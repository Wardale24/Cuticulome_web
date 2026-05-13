"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

type SearchableFilterSelectProps = {
  id: string;
  name: string;
  label: string;
  options: string[];
  selectedValue: string;
  allValue: string;
  placeholder: string;
};

const MAX_VISIBLE_OPTIONS = 80;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getInitialValue(
  options: string[],
  selectedValue: string,
  allValue: string
) {
  return options.includes(selectedValue) ? selectedValue : allValue;
}

export default function SearchableFilterSelect({
  id,
  name,
  label,
  options,
  selectedValue,
  allValue,
  placeholder,
}: SearchableFilterSelectProps) {
  const initialSelectedValue = getInitialValue(options, selectedValue, allValue);

  const [inputValue, setInputValue] = useState(initialSelectedValue);
  const [submittedValue, setSubmittedValue] = useState(initialSelectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setInputValue(initialSelectedValue);
    setSubmittedValue(initialSelectedValue);
    setHighlightedIndex(0);
    setIsOpen(false);
  }, [initialSelectedValue]);

  const filteredOptions = useMemo(() => {
    const query = normalize(inputValue);

    if (query.length === 0 || inputValue === allValue) {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    const matches = options.filter((option) =>
      normalize(option).includes(query)
    );

    const sortedMatches = matches.sort((firstOption, secondOption) => {
      const first = normalize(firstOption);
      const second = normalize(secondOption);

      const firstStartsWith = first.startsWith(query);
      const secondStartsWith = second.startsWith(query);

      if (firstStartsWith && !secondStartsWith) {
        return -1;
      }

      if (!firstStartsWith && secondStartsWith) {
        return 1;
      }

      return firstOption.localeCompare(secondOption);
    });

    return Array.from(new Set(sortedMatches)).slice(0, MAX_VISIBLE_OPTIONS);
  }, [allValue, inputValue, options]);

  function openDropdown() {
    setIsOpen(true);
    setHighlightedIndex(0);

    if (submittedValue === allValue) {
      setInputValue("");
    }
  }

  function closeDropdown() {
    setInputValue(submittedValue);
    setIsOpen(false);
    setHighlightedIndex(0);
  }

  function selectOption(option: string) {
    setInputValue(option);
    setSubmittedValue(option);
    setHighlightedIndex(0);
    setIsOpen(false);
  }

  function clearSelection() {
    setInputValue("");
    setSubmittedValue(allValue);
    setHighlightedIndex(0);
    setIsOpen(true);
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    setIsOpen(true);
    setHighlightedIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((currentIndex) =>
        Math.min(currentIndex + 1, Math.max(filteredOptions.length - 1, 0))
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter" && isOpen && filteredOptions[highlightedIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  }

  const hasSuggestions = filteredOptions.length > 0;
  const isIdleAllValueState =
    submittedValue === allValue && inputValue === allValue;

  const shouldShowClearButton =
    !isIdleAllValueState &&
    (inputValue.trim().length > 0 || submittedValue !== allValue);

  return (
    <div className="relative">
      <label htmlFor={id} className="text-sm font-semibold text-[#2a2118]">
        {label}
      </label>

      {submittedValue !== allValue && (
        <input type="hidden" name={name} value={submittedValue} />
      )}

      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-suggestions`}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={openDropdown}
          onClick={openDropdown}
          onBlur={() => {
            setTimeout(() => {
              closeDropdown();
            }, 120);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-2xl border border-[#d8cbb7] bg-white px-4 py-3 pr-14 text-sm text-[#2a2118] outline-none transition placeholder:text-[#9a8b78] focus:border-[#8c3f2b] focus:ring-2 focus:ring-[#8c3f2b]/20"
        />

        {shouldShowClearButton ? (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearSelection}
            className="absolute inset-y-1 right-1 rounded-full px-3 text-sm font-semibold text-[#8c3f2b] hover:bg-[#efe5d4]"
          >
            ×
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Open ${label} options`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={openDropdown}
            className="absolute inset-y-1 right-1 rounded-full px-3 text-sm font-semibold text-[#8c3f2b] hover:bg-[#efe5d4]"
          >
            ▾
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#d8cbb7] bg-white p-2 shadow-lg"
        >
          {hasSuggestions ? (
            filteredOptions.map((option, index) => {
              const isSelected = option === submittedValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={
                    isHighlighted
                      ? "w-full rounded-xl bg-[#efe5d4] px-3 py-2 text-left text-sm font-semibold text-[#2a2118]"
                      : isSelected
                      ? "w-full rounded-xl bg-[#fffaf1] px-3 py-2 text-left text-sm font-semibold text-[#8c3f2b]"
                      : "w-full rounded-xl px-3 py-2 text-left text-sm text-[#6a5d4d] hover:bg-[#fffaf1] hover:text-[#2a2118]"
                  }
                >
                  {option}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-sm text-[#6a5d4d]">
              No matching options found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
