import { Chess, Square } from "chess.js";
import {
  TutorExplainRequest,
  TutorExplainResponse,
  SuggestedMove,
  TutorApiError,
} from "../types";
import { getCuratedTutorExplanation } from "./curated-tutor-fallbacks";

export interface SpeechResult {
  audioBuffer: Buffer;
  mimeType: string;
}

/**
 * Wraps raw linear PCM buffer in a standard 44-byte RIFF WAVE header.
 * Gemini 2.5 Flash TTS outputs raw 16-bit signed integer linear PCM mono at 24000Hz (audio/L16;codec=pcm;rate=24000).
 */
export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavHeader = Buffer.alloc(44);

  // RIFF Chunk Descriptor
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write("WAVE", 8);

  // "fmt " sub-chunk
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 = PCM linear)
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

/**
 * Server-only service interacting securely with Gemini models.
 * API keys and server secrets are never exposed to the client.
 */
export class GeminiTutorService {
  private static getApiKey(): string | null {
    return process.env.GEMINI_API_KEY?.trim() || null;
  }

  private static getTutorModel(): string {
    return process.env.GEMINI_TUTOR_MODEL?.trim() || "gemini-3.8-flash";
  }

  private static getTtsModel(): string {
    return process.env.GEMINI_TTS_MODEL?.trim() || "gemini-2.5-flash-preview-tts";
  }

  private static getDefaultVoice(): string {
    return process.env.GEMINI_TTS_VOICE?.trim() || "Aoede";
  }

  public static isTutorConfigured(): boolean {
    const key = this.getApiKey();
    const enabled = process.env.TUTOR_ENABLED?.trim();
    if (enabled === "false") return false;
    return Boolean(key);
  }

  /**
   * Generates structured explanation from Gemini, with validation & fallback.
   */
  public static async explain(request: TutorExplainRequest): Promise<TutorExplainResponse> {
    // 1. Strict Validation
    let chess: Chess;
    try {
      chess = new Chess(request.fen);
    } catch {
      throw {
        code: "INVALID_REQUEST",
        message: "Format FEN papan catur tidak valid.",
        retryable: false,
      } as TutorApiError;
    }

    if (request.question && request.question.length > 500) {
      throw {
        code: "INVALID_REQUEST",
        message: "Pertanyaan melebihi batas maksimal 500 karakter.",
        retryable: false,
      } as TutorApiError;
    }

    if (request.recentMovesSan && request.recentMovesSan.length > 16) {
      request.recentMovesSan = request.recentMovesSan.slice(-16);
    }

    // 2. Check if API key is present
    const apiKey = this.getApiKey();
    if (!apiKey || process.env.TUTOR_ENABLED === "false") {
      return getCuratedTutorExplanation(request);
    }

    const modelName = this.getTutorModel();
    const turnLabel = request.sideToMove === "w" ? "Putih" : "Hitam";

    // Build context prompt
    const prompt = `Anda adalah Guru Catur AI Indonesia yang sabar, hangat, dan mendidik untuk pemain pemula.
Tugas Anda adalah menjelaskan situasi posisi catur berikut dengan bahasa Indonesia yang alami dan mudah dipahami:

Posisi (FEN): ${request.fen}
Giliran Melangkah: ${turnLabel}
Level Pemain: ${request.learnerLevel}
Mode: ${request.mode}
${request.lastMoveSan ? `Langkah Terakhir: ${request.lastMoveSan}` : ""}
${request.recentMovesSan && request.recentMovesSan.length > 0 ? `Riwayat Langkah Terbaru: ${request.recentMovesSan.join(" ")}` : ""}
${request.lessonTitle ? `Judul Materi Belajar: ${request.lessonTitle}` : ""}
${request.lessonStepInstruction ? `Instruksi Langkah: ${request.lessonStepInstruction}` : ""}
${
  request.question
    ? `\nPERMINTAAN KHUSUS DARI PEMAIN: Pemain menanyakan: "${request.question}". Fokuskan seluruh respon Anda (title, summary, explanation, spokenText) untuk MENJAWAB PERTANYAAN INI secara langsung, bersahabat, mendidik, dan tuntas sesuai situasi papan saat ini.`
    : ""
}
${
  request.analysis?.bestMoveSan
    ? `Analisis Engine: Langkah Terbaik = ${request.analysis.bestMoveSan}, Evaluasi (cp) = ${request.analysis.evaluationCp ?? 0}, Kedalaman = ${request.analysis.depth ?? 0}`
    : "Analisis Engine: Tidak tersedia secara mendalam."
}

PEDOMAN PENTING:
1. Jelaskan alasan sebuah langkah baik/buruk dengan bahasa Indonesia sederhana tanpa jargon yang membingungkan. Jika menyebut istilah (misal: rokade, garpu, pin), jelaskan artinya secara singkat.
2. JANGAN MENGARANG langkah terbaik atau evaluasi jika data engine tidak menyediakannya. Jika analisis engine tidak ada, sampaikan penjelasan berdasarkan prinsip visual papan.
3. Field "spokenText" HARUS berupa naskah percakapan lisan yang hangat, bersahabat, memiliki intonasi hidup, dan menyenangkan didengar (maksimal 3 kalimat). Gunakan gaya tutur seorang mentor ramah yang berbicara langsung kepada murid (misalnya: "Halo! Langkah ini bagus sekali karena membuka jalan untuk perwiramu menguasai petak tengah."). Hindari gaya bahasa baku seperti ensiklopedia dan jangan pernah mengeja kode notasi mentah seperti "Nf3" atau tanda catur teknis.
4. Kembalikan HANYA format JSON valid tanpa markdown formatting tambahan atau pembungkus lain:
{
  "title": "Judul singkat penjelasan",
  "summary": "1-2 kalimat kesimpulan utama",
  "explanation": "Penjelasan mendidik 2-4 paragraf singkat yang hangat",
  "spokenText": "Naskah narasi suara ramah bahasa Indonesia (maksimal 400 karakter)",
  "concept": "Nama konsep taktik atau strategi yang relevan",
  "suggestedMoves": [
    { "uci": "e2e4", "san": "e4", "description": "Alasan singkat langkah ini baik" }
  ],
  "hint": "Petunjuk bertahap tanpa membocorkan langsung jika pemain butuh bantuan",
  "followUpQuestion": "Pertanyaan reflektif untuk mengajak pemain berpikir"
}`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1000,
            responseMimeType: "application/json",
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Gemini quota reached (429), switching to curated offline tutor.");
          return getCuratedTutorExplanation(request);
        }
        console.warn(`Gemini API returned status ${response.status}, switching to curated offline tutor.`);
        return getCuratedTutorExplanation(request);
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return getCuratedTutorExplanation(request);
      }

      let parsed: Partial<TutorExplainResponse>;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        return getCuratedTutorExplanation(request);
      }

      // 3. Legal Move Verification via chess.js on suggestedMoves
      const verifiedMoves: SuggestedMove[] = [];
      const legalMoves = chess.moves({ verbose: true });

      if (Array.isArray(parsed.suggestedMoves)) {
        for (const item of parsed.suggestedMoves) {
          if (item && typeof item.uci === "string" && item.uci.length >= 4) {
            const from = item.uci.slice(0, 2) as Square;
            const to = item.uci.slice(2, 4) as Square;
            const matched = legalMoves.find((m) => m.from === from && m.to === to);
            if (matched) {
              verifiedMoves.push({
                uci: `${matched.from}${matched.to}${matched.promotion || ""}`,
                san: matched.san,
                description: item.description || `Langkah legal ke ${matched.to}`,
              });
            }
          }
        }
      }

      // If Gemini didn't supply valid legal moves, inject from legalMoves
      if (verifiedMoves.length === 0 && legalMoves.length > 0) {
        const top = legalMoves[0];
        verifiedMoves.push({
          uci: `${top.from}${top.to}${top.promotion || ""}`,
          san: top.san,
          description: "Langkah legal terdekat yang dapat dipertimbangkan.",
        });
      }

      return {
        title: parsed.title || "Penjelasan Posisi Catur",
        summary: parsed.summary || "Analisis posisi catur Anda saat ini.",
        explanation: parsed.explanation || "Perhatikan perwira dan koordinasi petak di atas papan.",
        spokenText: parsed.spokenText || parsed.summary || "Mari amati posisi bidak pada papan bersama-sama.",
        concept: parsed.concept || "Strategi Dasar Catur",
        suggestedMoves: verifiedMoves.slice(0, 3),
        hint: parsed.hint || undefined,
        followUpQuestion: parsed.followUpQuestion || undefined,
        analysisStatus: request.analysis?.bestMoveSan ? "available" : "unavailable",
        source: "gemini",
      };
    } catch (err) {
      console.warn("Gemini call failed or timed out, returning curated tutor:", err);
      return getCuratedTutorExplanation(request);
    }
  }

  /**
   * Generates audio speech using Gemini TTS model.
   * Returns audio buffer as WAV format.
   */
  public static async synthesizeSpeech(text: string, voice?: string): Promise<SpeechResult | null> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw {
        code: "INVALID_REQUEST",
        message: "Teks untuk sintesis suara tidak boleh kosong.",
        retryable: false,
      } as TutorApiError;
    }

    if (trimmed.length > 1000) {
      throw {
        code: "INVALID_REQUEST",
        message: "Teks melebihi batas maksimal 1000 karakter.",
        retryable: false,
      } as TutorApiError;
    }

    const apiKey = this.getApiKey();
    if (!apiKey || process.env.TUTOR_ENABLED === "false") {
      return null;
    }

    const modelName = this.getTtsModel();
    const voiceName = voice || this.getDefaultVoice();

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: trimmed }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName,
                },
              },
            },
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Gemini TTS API returned status ${response.status}`);
        return null;
      }

      const json = await response.json();
      const candidatePart = json?.candidates?.[0]?.content?.parts?.[0];
      const inlineData = candidatePart?.inlineData;

      if (!inlineData?.data) {
        console.warn("Gemini TTS response missing audio inlineData");
        return null;
      }

      const rawBuffer = Buffer.from(inlineData.data, "base64");
      const returnedMime = inlineData.mimeType || "audio/wav";

      // If already a complete WAV with RIFF header, return directly
      let wavBuffer: Buffer;
      if (
        rawBuffer.length >= 12 &&
        rawBuffer.subarray(0, 4).toString() === "RIFF" &&
        rawBuffer.subarray(8, 12).toString() === "WAVE"
      ) {
        wavBuffer = rawBuffer;
      } else {
        // Raw Linear PCM (e.g. audio/L16;codec=pcm;rate=24000)
        let sampleRate = 24000;
        const rateMatch = returnedMime.match(/rate=(\d+)/);
        if (rateMatch) {
          const parsedRate = parseInt(rateMatch[1], 10);
          if (!isNaN(parsedRate) && parsedRate > 0) {
            sampleRate = parsedRate;
          }
        }
        wavBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
      }

      return {
        audioBuffer: wavBuffer,
        mimeType: "audio/wav",
      };
    } catch (err) {
      console.warn("Gemini TTS synthesis failed:", err);
      return null;
    }
  }
}
