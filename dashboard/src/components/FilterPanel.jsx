// Filter Panel Component
// =======================
// Search and date range filtering for incidents

import { useState } from 'react'
import { Search, Calendar, X, Filter, ChevronDown } from 'lucide-react'

// Predefined date range options
const DATE_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Custom Range', value: 'custom' }
]

// Status filter options
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved']

// Type filter options
const TYPE_OPTIONS = ['All', 'Landslide', 'Flood', 'Fire', 'Blocked Road']

function FilterPanel({ 
  searchQuery, 
  onSearchChange, 
  dateRange, 
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  onClearFilters,
  activeFilterCount
}) {
  const [showCustomDates, setShowCustomDates] = useState(dateRange === 'custom')

  const handleDateRangeChange = (value) => {
    onDateRangeChange(value)
    setShowCustomDates(value === 'custom')
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search incidents by type, description, location..."
            className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {DATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        {showCustomDates && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Clear ({activeFilterCount})
          </button>
        )}

        {/* Active Filters Badge */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
