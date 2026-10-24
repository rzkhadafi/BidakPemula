import { NextRequest, NextResponse } from "next/server";
import { GeminiTutorService } from "@/features/tutor/server/gemini-service";
import { TutorSpeechRequest, TutorApiError } from "@/features/tutor/types";

export async function POST(req: NextRequest) {
  try {
    let body: TutorSpeechRequest;
    try {
      body = await req.json();
    } catch {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Format JSON permintaan suara tidak valid.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    if (!body || !body.text || typeof body.text !== "string") {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Parameter 'text' wajib diisi untuk sintesis suara.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    const trimmed = body.text.trim();
    if (trimmed.length > 1000) {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Naskah suara melebihi batas maksimal 1000 karakter.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    const speechResult = await GeminiTutorService.synthesizeSpeech(trimmed, body.voice);

    if (!speechResult) {
      // Return 503 indicating client should fall back to Web Speech API
      return NextResponse.json(
        {
          code: "PROVIDER_UNAVAILABLE",
          message: "Layanan Gemini TTS sedang tidak tersedia. Gunakan suara lokal perangkat.",
          fallbackToWebSpeech: true,
          retryable: false,
        },
        { status: 503 }
      );
    }

    // Return pure binary audio data
    return new Response(new Uint8Array(speechResult.audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": speechResult.mimeType || "audio/wav",
        "Content-Length": String(speechResult.audioBuffer.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      const tutorErr = err as TutorApiError;
      const status = tutorErr.code === "INVALID_REQUEST" ? 400 : 500;
      return NextResponse.json(tutorErr, { status });
    }

    const defaultErr: TutorApiError = {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan saat memproses sintesis audio.",
      retryable: true,
    };
    return NextResponse.json(defaultErr, { status: 500 });
  }
}
