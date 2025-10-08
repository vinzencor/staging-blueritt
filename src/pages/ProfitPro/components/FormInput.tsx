import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type TFormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  prefix?: string;
  error?: string;
  className?: string;
  variant?: "default" | "minimal";
};

const FormInput: React.FC<TFormInputProps> = ({
  label,
  prefix,
  error,
  className,
  variant = "default",
  ...props
}) => {
  const inputStyles = {
    default: "rounded-sm border border-gray-300 p-2",
    minimal: "border-none bg-gray-200",
  };

  const prefixStyles = {
    default: "absolute left-2 top-1/2 -translate-y-1/2",
    minimal: "absolute left-0 top-1/2 -translate-y-1/2 ",
  };

  return (
    <div className={cn(className, "flex w-full flex-col ")}>
      {label ? (
        <p
          className={cn(
            "text-sm font-semibold text-dark",
            variant === "default" ? "mb-2" : ""
          )}
        >
          {label}
          {props.required ? <span className="text-red-500">*</span> : null}
        </p>
      ) : null}

      <div className="relative text-black bg-gray-100">
        {prefix ? (
          <span
            className={cn(
              prefixStyles[variant],
              "text-black font-medium ","bg-white dark:bg-[#1A1C1E] dark:text-white"
,
              variant === "minimal" ? "text-sm text-dark" : "text-xs"
            )}
          >
            {prefix}
          </span>
        ) : null}
        <input
          className={cn(
            inputStyles[variant],
            prefix ? (variant === "minimal" ? "w-full" : "pl-6") : "",
            variant === "minimal"
              ? "text-dark text-md font-semibold outline-none focus:ring-1 focus:ring-gray-400"
              : "w-full text-xs text-gray-500 font-medium focus:ring-1 focus:ring-gray-400 placeholder:text-gray-400 ", "bg-white dark:bg-[#1A1C1E] dark:text-white"
,
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

export default FormInput;
