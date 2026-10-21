import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C7A66A] disabled:opacity-50 disabled:pointer-events-none select-none";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#F2F0E8] text-[#141619] hover:bg-[#E8E3D8] active:bg-[#D8D2C5]",
      secondary:
        "bg-[#24292E] text-[#F2F0E8] border border-[#353B42] hover:bg-[#2C3238] active:bg-[#1C2024]",
      ghost:
        "bg-transparent text-[#F2F0E8] hover:bg-[#2C3238] active:bg-[#24292E]",
      destructive:
        "bg-[#E17C78]/15 text-[#E17C78] border border-[#E17C78]/30 hover:bg-[#E17C78]/25 active:bg-[#E17C78]/35",
      accent:
        "bg-[#C7A66A] text-[#141619] hover:bg-[#D8BB83] active:bg-[#B89658]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
