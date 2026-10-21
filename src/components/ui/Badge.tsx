import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-md tracking-wide select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-[#24292E] text-[#B0B5B9] border border-[#353B42]",
    accent: "bg-[#C7A66A]/15 text-[#C7A66A] border border-[#C7A66A]/30",
    success: "bg-[#73B894]/15 text-[#73B894] border border-[#73B894]/30",
    warning: "bg-[#E3B66F]/15 text-[#E3B66F] border border-[#E3B66F]/30",
    danger: "bg-[#E17C78]/15 text-[#E17C78] border border-[#E17C78]/30",
    muted: "bg-[#1C2024] text-[#8A9299] border border-[#2C3238]",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
