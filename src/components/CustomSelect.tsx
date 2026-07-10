import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface CustomSelectProps {
  id: string;
  label?: string;
  value: string | number;
  options: (string | number)[];
  onChange: (value: any) => void;
  placeholder?: string;
  enableSearch?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  enableSearch = false,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = enableSearch
    ? options.filter((option) =>
        option.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <div className="relative w-full text-left" ref={dropdownRef} id={`container-${id}`}>
      {label && (
        <label className="block text-xs font-semibold text-purple-300 mb-1 tracking-wider uppercase">
          {label}
        </label>
      )}

      {/* Select Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery(""); // reset search
        }}
        className={`w-full bg-[#161226]/90 border border-purple-950/60 hover:border-purple-500/50 rounded-lg py-2.5 px-3.5 text-sm font-medium text-purple-100 flex items-center justify-between shadow-inner focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-150 text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#1b1633] border border-purple-800/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
          {/* Optional Search bar inside dropdown */}
          {enableSearch && (
            <div className="p-2 border-b border-purple-900/30 bg-[#120e24]/60 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-purple-100 focus:outline-none placeholder-purple-500"
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-2.5 px-3.5 text-xs text-purple-400 italic">No matches found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3.5 text-xs font-medium transition-colors duration-150 flex items-center justify-between ${
                    value === option
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-purple-900/40 hover:text-purple-100"
                  }`}
                >
                  <span>{option}</span>
                  {value === option && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
