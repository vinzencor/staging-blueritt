import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "success";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  return (
    <button 
      className={cn(
        "cursor-pointer rounded-full p-2 text-sm duration-150",
        variant === "primary" &&
          `bg-primary border border-primary text-white hover:bg-purple-600`,
        variant === "outline" && `border border-primary bg-white text-primary`,
        variant === "success" &&
          `border border-success bg-success text-white`,

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
