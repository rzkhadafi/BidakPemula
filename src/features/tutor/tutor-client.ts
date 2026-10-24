import { TutorExplainRequest, TutorExplainResponse } from "./types";
import { getCuratedTutorExplanation } from "./server/curated-tutor-fallbacks";

/**
 * Client-side fetcher for the Indonesian AI Chess Tutor.
 * Calls /api/tutor/explain with fallback to local curated rule-based explanations.
 */
export async function requestTutorExplanation(
  request: TutorExplainRequest
): Promise<TutorExplainResponse> {
  try {
    const res = await fetch("/api/tutor/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const data: TutorExplainResponse = await res.json();
      return data;
    }

    console.warn(`Tutor API returned ${res.status}, falling back to curated tutor.`);
    return getCuratedTutorExplanation(request);
  } catch (err) {
    console.warn("Network request to /api/tutor/explain failed, using curated tutor fallback:", err);
    return getCuratedTutorExplanation(request);
  }
}
