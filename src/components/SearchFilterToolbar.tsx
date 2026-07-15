import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  placeholder?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const SearchFilterToolbar: React.FC<SearchFilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter by",
  placeholder = "Search records...",
  className = "",
  actions
}) => {
  const hasActiveFilters = searchTerm !== "" || (filterValue && filterValue !== "ALL");

  const handleClear = () => {
    onSearchChange("");
    if (onFilterChange) {
      onFilterChange("ALL");
    }
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full bg-white border border-gray-100 p-4 rounded-3xl shadow-sm transition-all hover:border-gray-200/80 mb-6 ${className}`}>
      {/* Search Input Container */}
      <div className="relative grow">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-500" size={16} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-gray-50/50 border border-gray-100 hover:border-gray-200/80 rounded-2xl py-3 pl-11 pr-10 font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/80 text-xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-all"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Selector & Clear Button */}
      <div className="flex flex-wrap items-center gap-3">
        {onFilterChange && filterOptions && filterOptions.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100 rounded-2xl px-3 py-1 bg-white">
            <SlidersHorizontal size={13} className="text-gray-400" />
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              aria-label={filterLabel}
              className="bg-transparent border-none py-2 pr-4 pl-1 font-extrabold text-gray-800 text-[10px] uppercase tracking-wider focus:outline-none focus:ring-0 cursor-pointer"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="normal-case font-medium text-xs">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest bg-red-50 hover:bg-red-100/80 text-red-600 rounded-xl transition-all flex items-center gap-1.5 border border-red-100/50 cursor-pointer"
          >
            <X size={11} />
            Reset Filters
          </button>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default SearchFilterToolbar;
