import { useId, useRef, useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface CustomSelectProps<T extends string | number> {
  options: readonly CustomSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  disabled = false,
  title,
}: CustomSelectProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const openMenu = () => {
    if (disabled || options.length === 0) return;
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const moveActive = (step: number) => {
    setActiveIndex((current) => {
      if (options.length === 0) return 0;
      return (current + step + options.length) % options.length;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) selectOption(activeIndex);
        else openMenu();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (open) moveActive(1);
        else openMenu();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) moveActive(-1);
        else openMenu();
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(Math.max(0, options.length - 1));
        break;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        closeMenu();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`desktop-select${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
    >
      <button
        ref={triggerRef}
        className="desktop-select-trigger"
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        title={title}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className="desktop-select-value">{selectedOption?.label ?? ""}</span>
        <ChevronDown className="desktop-select-chevron" size={15} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listboxId}
          className="desktop-select-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                key={String(option.value)}
                id={`${listboxId}-option-${index}`}
                className={`desktop-select-option${isActive ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
