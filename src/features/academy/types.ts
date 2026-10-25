export interface LessonStep {
  id: string;
  stepNumber: number;
  instruction: string;
  subText: string;
  fen: string;
  targetSquare?: string; // If the challenge is to click a square
  allowedTargetSquares?: string[]; // Multiple acceptable target squares to click
  expectedMoveUci?: string; // e.g. "d4d7" or "e1g1"
  allowedMovesUci?: string[]; // Multiple acceptable solutions
  hint: string;
  explanationOnSuccess: string;
}

export interface AcademyLesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  summary: string;
  duration: string;
  conceptHeading: string;
  conceptBody: string[];
  steps: LessonStep[];
  takeaways: string[];
}

export interface AcademyProgress {
  schemaVersion: number;
  completedLessonIds: string[];
  currentLessonId: string;
  lastStudiedAt: string;
  stepProgress: Record<string, number>; // lessonId -> completed step count
}
