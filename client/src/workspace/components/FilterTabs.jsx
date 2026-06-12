const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'apps', label: 'Apps' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'recent', label: 'Recently Used' },
];

export default function FilterTabs({ value, onChange }) {
  return (
    <div className="ws-filters">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`ws-filter-btn${value === f.id ? ' active' : ''}`}
          onClick={() => onChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
