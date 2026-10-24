export type BadgeId =
  | "first_move"
  | "first_capture"
  | "first_castle"
  | "first_check"
  | "first_promotion"
  | "active_knights"
  | "first_win"
  | "puzzle_solver"
  | "curious_student"
  | "turning_point_hero";

export type BadgeCategory = "play" | "learning" | "tactics" | "journey";

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  subtitle: string;
  description: string;
  iconName:
    | "Footprints"
    | "Swords"
    | "Shield"
    | "Zap"
    | "Crown"
    | "Compass"
    | "Trophy"
    | "Brain"
    | "GraduationCap"
    | "RotateCcw";
  category: BadgeCategory;
  criteria: string;
}

export interface UnlockedBadge {
  id: BadgeId;
  unlockedAt: string; // ISO 8601
}
