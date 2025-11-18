export default function HeroPowerBadge({ power, onClick }) {
  if (!power) return null

  return (
    <div className="hero-power" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="hero-power-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z"
            fill="#ffd86b"
            stroke="#d58c1a"
            strokeWidth="1.3"
          />
        </svg>
      </div>

      <div className="hero-power-info">
        <div className="hero-power-name">{power.name}</div>
        <div className="hero-power-cost">{power.cost} mana</div>
        <div className="hero-power-desc">{power.description}</div>
      </div>
    </div>
  )
}
