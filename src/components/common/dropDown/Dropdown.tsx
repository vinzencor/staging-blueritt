import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Icon } from "@iconify-icon/react";
import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import "../../../index.scss";

type TDropdownOption = {
  label: string;
  value: string;
};

type TDropdownProps = {
  options: TDropdownOption[];
  label?: string;
  showLabelAfterSelection?: boolean;
  selectedOption?: TDropdownOption | null;
  menuClassName?: string;
  menuButtonClassName?: string;
  isFullWidth: boolean;
  menuItemClassName?: string;
  onOptionChange: (opt: TDropdownOption) => void;
};

const Dropdown: React.FC<TDropdownProps> = ({
  options,
  label = "Select...",
  showLabelAfterSelection = false,
  selectedOption,
  menuClassName,
  menuButtonClassName,
  isFullWidth = false,
  menuItemClassName,
  onOptionChange,
}) => {
  const [selected, setSelected] = useState<TDropdownOption | null>(
    selectedOption || null
  );

  useEffect(() => {
    setSelected(selectedOption || null);
  }, [selectedOption]);

  const handleSelection = (option: TDropdownOption) => {
    setSelected(option);
    onOptionChange(option);
  };

  return (
    <Menu as="div" className={cn("relative inline-block text-left", menuClassName)}>
      <div>
        <MenuButton
          className={cn(
            "inline-flex items-center justify-between gap-x-1.5 rounded-md px-3 py-3 text-sm text-black w-full",
            "bg-white dark:bg-[#1A1C1E] dark:text-gray-400 border border-gray-400",
            menuButtonClassName
          )}
        >
          {showLabelAfterSelection
            ? label || selected?.label || "Options"
            : selected?.label || label || "Options"}
          <Icon icon="mingcute:down-line" />
        </MenuButton>
      </div>

      <MenuItems
        className={cn(
          "absolute left-0 z-10 mt-2 origin-top-right rounded-md bg-white dark:bg-[#1A1C1E] shadow-lg   focus:outline-none",
          isFullWidth ? "w-full overflow-y-auto" : "w-full",
          menuClassName
        )}
      >
        <div className="max-h-60 h-48 overflow-y-auto custom-scrollbar">
          {options.map((option, index) => (
            <MenuItem key={`${label}-${option.value}-${index}`}>
              <span
                onClick={() => handleSelection(option)}
                className={cn(
                  "block px-4 py-2 text-sm truncate hover:cursor-pointer",
                  menuItemClassName
                )}
              >
                {option.label}
              </span>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default Dropdown;
