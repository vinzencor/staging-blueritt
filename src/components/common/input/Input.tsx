import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Icon } from "@iconify-icon/react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      containerClassName,
      className,
      label,
      labelClassName,
      error,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const isPasswordField = type === "password";

    return (
      <div className={cn(`w-full`, containerClassName)}>
        <div className="relative">
          {label && (
            <label
              className={cn(
                "relative left-4 top-1.5 block w-fit bg-white px-2 text-xs",
                labelClassName
              )}
            >
              {label}
            </label>
          )}
          <input
            className={cn(
              "w-full rounded-md border px-3 py-3 text-sm  focus:border-primary focus:outline-none ","bg-white dark:bg-[#1A1C1E] dark:text-gray-400",

              error ? "border-red-500" : "border-gray-300",
              isPasswordField ? "pr-10" : "",
              className
            )}
            ref={ref}
            type={isPasswordField && showPassword ? "text" : type}
            {...props}
          />
          {isPasswordField && (
            <>
              <Icon
                icon={`${showPassword ? "mdi-light:eye" : "mdi-light:eye-off"}`}
                width="20"
                height="20"
                className="absolute bottom-0 right-3 top-4 flex items-center text-gray-500 hover:cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            </>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

export default Input;
