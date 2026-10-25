import { NextResponse } from "next/server";
import { GeminiTutorService } from "@/features/tutor/server/gemini-service";

export async function GET() {
  const isConfigured = GeminiTutorService.isTutorConfigured();
  return NextResponse.json({
    geminiConfigured: isConfigured,
    message: isConfigured
      ? "Kunci GEMINI_API_KEY aktif dan terbaca oleh server."
      : "Kunci GEMINI_API_KEY belum terpasang atau belum terbaca di Vercel Environment Variables.",
  });
}
