import { NextRequest, NextResponse } from "next/server";
import { GeminiTutorService } from "@/features/tutor/server/gemini-service";
import { TutorExplainRequest, TutorApiError } from "@/features/tutor/types";

export async function POST(req: NextRequest) {
  try {
    let body: TutorExplainRequest;
    try {
      body = await req.json();
    } catch {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Format JSON permintaan tidak valid.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Badan permintaan tidak boleh kosong.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    if (!body.fen || typeof body.fen !== "string") {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Parameter FEN papan catur wajib diisi.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    if (body.sideToMove !== "w" && body.sideToMove !== "b") {
      const err: TutorApiError = {
        code: "INVALID_REQUEST",
        message: "Parameter sideToMove harus 'w' atau 'b'.",
        retryable: false,
      };
      return NextResponse.json(err, { status: 400 });
    }

    const explanation = await GeminiTutorService.explain(body);
    return NextResponse.json(explanation, { status: 200 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      const tutorErr = err as TutorApiError;
      const status = tutorErr.code === "INVALID_REQUEST" ? 400 : 500;
      return NextResponse.json(tutorErr, { status });
    }

    const defaultErr: TutorApiError = {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan internal pada layanan Guru Catur.",
      retryable: true,
    };
    return NextResponse.json(defaultErr, { status: 500 });
  }
}
