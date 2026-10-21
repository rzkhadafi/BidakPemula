import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "raised";
}

export const Card: React.FC<CardProps> = ({
  className = "",
  variant = "surface",
  children,
  ...props
}) => {
  const variantStyles = {
    surface: "bg-[#1C2024] border border-[#353B42]",
    raised: "bg-[#24292E] border border-[#353B42]",
  };

  return (
    <div
      className={`rounded-xl p-5 text-[#F2F0E8] transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
