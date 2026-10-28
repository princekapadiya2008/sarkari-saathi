import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = 'What government service or scheme are you trying to navigate?',
  compact = false,
}) {
  return (
    <div className={`searchBox ${compact ? 'compact' : ''}`}>
      <Search size={18} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {!compact && (
        <button type="button" onClick={onSubmit} className="searchButton">
          Explore <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
