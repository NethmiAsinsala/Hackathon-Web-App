// =====================================================
// CENTRALIZED COLOR CONSTANTS - Severity & Status Colors
// =====================================================
// All severity/priority/status colors are defined here
// Update these values to change colors across the entire app

// Severity Colors (Hex)
export const SEVERITY_COLORS = {
  Critical: '#FF3838', // Dark Red
  High: '#FFB302',     // Orange-Yellow
  Medium: '#FCE83A',   // Yellow
  Low: '#56F000',      // Bright Green
  default: '#6b7280',  // Gray (fallback)
}

// Severity Colors with opacity for backgrounds (rgba)
export const SEVERITY_BG_COLORS = {
  Critical: 'rgba(255, 56, 56, 0.2)',    // Dark Red 20%
  High: 'rgba(255, 179, 2, 0.2)',        // Orange-Yellow 20%
  Medium: 'rgba(252, 232, 58, 0.2)',     // Yellow 20%
  Low: 'rgba(86, 240, 0, 0.2)',          // Bright Green 20%
  default: 'rgba(107, 114, 128, 0.2)',   // Gray 20%
}

// Severity Colors for borders (with opacity)
export const SEVERITY_BORDER_COLORS = {
  Critical: 'rgba(255, 56, 56, 0.5)',    // Dark Red 50%
  High: 'rgba(255, 179, 2, 0.5)',        // Orange-Yellow 50%
  Medium: 'rgba(252, 232, 58, 0.5)',     // Yellow 50%
  Low: 'rgba(86, 240, 0, 0.5)',          // Bright Green 50%
  default: 'rgba(107, 114, 128, 0.5)',   // Gray 50%
}

// Status Colors (Hex) - for reference
export const STATUS_COLORS = {
  Pending: '#f97316',    // Orange
  'In Progress': '#3b82f6', // Blue
  Resolved: '#10b981',   // Emerald/Green
}

// Helper function to get Tailwind-compatible inline styles for severity badges
export const getSeverityStyles = (severity) => {
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.default
  const bgColor = SEVERITY_BG_COLORS[severity] || SEVERITY_BG_COLORS.default
  const borderColor = SEVERITY_BORDER_COLORS[severity] || SEVERITY_BORDER_COLORS.default
  
  return {
    backgroundColor: bgColor,
    color: color,
    borderColor: borderColor,
  }
}

// Get severity text color for use in className (Tailwind arbitrary values)
export const getSeverityTextClass = (severity, hasValue = true) => {
  if (!hasValue) return 'text-slate-500'
  
  switch (severity) {
    case 'Critical':
      return 'text-[#FF3838]'
    case 'High':
      return 'text-[#FFB302]'
    case 'Medium':
      return 'text-[#FCE83A]'
    case 'Low':
      return 'text-[#56F000]'
    default:
      return 'text-slate-500'
  }
}

export default SEVERITY_COLORS
