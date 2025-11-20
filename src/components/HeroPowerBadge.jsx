import React from 'react'
import HeroPowerTooltip from './HeroPowerTooltip'

export default function HeroPowerBadge({ powers = [], onClick }) {
  const [showTooltip, setShowTooltip] = React.useState(null)

  if (!powers || powers.length === 0) return null

  return (
    <div className="hero-powers-container">
      {powers.map((power, idx) => (
        <div
          key={power.id || idx}
          className="hero-power"
          onClick={() => onClick && onClick(power.id)}
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setShowTooltip(power.id)}
          onMouseLeave={() => setShowTooltip(null)}
          title={`${power.name} - ${power.cost} mana`}
        >
          {showTooltip === power.id && <HeroPowerTooltip power={power} />}
          <div className="hero-power-icon">
            {power.icon ? (
              <span className="power-emoji">{power.icon}</span>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z"
                  fill="#ffd86b"
                  stroke="#d58c1a"
                  strokeWidth="1.3"
                />
              </svg>
            )}
          </div>

          <div className="hero-power-info">
            <div className="hero-power-name">{power.name}</div>
            <div className="hero-power-cost">{power.cost} 💎</div>
          </div>
        </div>
      ))}
    </div>
  )
}
