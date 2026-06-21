import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CustomSelect.css";

function normalizeOptions(options) {
  return options.map((option) =>
    typeof option === "object"
      ? option
      : {
          value: option,
          label: option,
        }
  );
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Chon",
  searchable = false,
  disabled = false,
  className = "",
}) {
  const rootRef = useRef(null);
  const searchInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedOptions = useMemo(() => normalizeOptions(options || []), [options]);
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return normalizedOptions;

    return normalizedOptions.filter((option) =>
      String(option.label || "").toLowerCase().includes(keyword)
    );
  }, [normalizedOptions, search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [open, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setSearch("");
  };

  const handleSelect = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
      },
    });
    setOpen(false);
    setSearch("");
  };

  return (
    <div
      ref={rootRef}
      className={`custom-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={`custom-select-value ${selectedOption ? "" : "is-placeholder"}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="custom-select-icon" aria-hidden="true" />
      </button>

      <div className="custom-select-panel">
        {searchable ? (
          <div className="custom-select-search-wrap">
            <input
              ref={searchInputRef}
              className="custom-select-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim kiem..."
            />
          </div>
        ) : null}

        <div className="custom-select-options" role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = String(option.value) === String(value);

              return (
                <button
                  key={`${option.value}`}
                  type="button"
                  className={`custom-select-option ${isSelected ? "is-selected" : ""}`.trim()}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{option.label}</span>
                  {isSelected ? <span className="custom-select-check">✓</span> : null}
                </button>
              );
            })
          ) : (
            <div className="custom-select-empty">Khong tim thay lua chon phu hop</div>
          )}
        </div>
      </div>
    </div>
  );
}
