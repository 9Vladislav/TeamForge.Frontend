import { useEffect, useRef, useState } from "react";
import { icons } from "../../assets/icons";

export function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) ||
    options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (option.disabled) return;

    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <label className="relative block" ref={selectRef}>
      {label && (
        <span className="mb-2 block text-[13px] font-bold text-[#D1D5DB]">
          {label}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-md border bg-[#1C2128] px-4 text-left text-[15px] text-[#F3F4F6] outline-none transition hover:bg-[#232A34] disabled:cursor-not-allowed disabled:opacity-70 ${
          isOpen
            ? "border-[#B91C1C]"
            : "border-[#30363D] hover:border-[#4B5563]"
        }`}
      >
        <span className="truncate">{selectedOption?.label || "Не обрано"}</span>

        <img
          src={isOpen ? icons.chevronUp : icons.chevronDown}
          alt=""
          className="h-5 w-5 shrink-0 icon-white"
        />
      </button>

      {isOpen && (
        <div className="custom-scroll custom-select-dropdown absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 rounded-md border border-[#30363D] bg-[#161B22] p-1 shadow-xl">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);

            return (
              <button
                type="button"
                key={option.value}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={`flex min-h-10 w-full items-center rounded px-3 text-left text-[15px] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? "bg-[#B91C1C] text-[#F3F4F6]"
                    : "text-[#D1D5DB] hover:bg-[#232A34] hover:text-[#F3F4F6]"
                }`}
              >
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </label>
  );
}
