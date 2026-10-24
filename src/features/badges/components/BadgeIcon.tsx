"use client";

import React from "react";
import {
  Footprints,
  Swords,
  Shield,
  Zap,
  Crown,
  Compass,
  Trophy,
  Brain,
  GraduationCap,
  RotateCcw,
  Award,
} from "lucide-react";
import { BadgeDefinition } from "../types";

interface BadgeIconProps {
  name: BadgeDefinition["iconName"];
  className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case "Footprints":
      return <Footprints className={className} />;
    case "Swords":
      return <Swords className={className} />;
    case "Shield":
      return <Shield className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Crown":
      return <Crown className={className} />;
    case "Compass":
      return <Compass className={className} />;
    case "Trophy":
      return <Trophy className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "RotateCcw":
      return <RotateCcw className={className} />;
    default:
      return <Award className={className} />;
  }
};
