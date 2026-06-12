export default function ToggleSwitch({ checked, onChange, disabled = false, id, ariaLabel }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`ws-toggle${checked ? ' on' : ''}${disabled ? ' disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className="ws-toggle-track">
        <span className="ws-toggle-thumb" />
      </span>
    </button>
  );
}
