import React from 'react'

export default function Card({ card, isField = false, onClick, className = '', selected = false, isTargetable = false }) {
  const attack = card.attack || card.currentAttack || 0
  const defense = card.defense || 0
  const heal = card.healValue || card.currentHeal || 0
  const sizeClass = isField ? 'card-field' : 'card-hand'
  
  const getEffectIcons = () => {
    if (!card.effects || card.effects.length === 0) return null
    return card.effects.map((eff, idx) => {
      let icon = ''
      if (eff.effect === 'CHARGE') icon = '⚡'
      if (eff.effect === 'TAUNT') icon = '🛡️'
      if (eff.effect === 'LIFESTEAL') icon = '💉'
      if (eff.effect === 'IMMUNE_FIRST_TURN') icon = '✨'
      if (eff.effect === 'DAMAGE_ALL_ENEMIES') icon = '💥'
      if (eff.effect === 'HEAL_HERO') icon = '💚'
      if (eff.effect === 'DRAW_CARD') icon = '📖'
      if (eff.effect === 'BUFF_ALL_ALLIES') icon = '💪'
      if (eff.effect === 'DAMAGE_RANDOM_ENEMY') icon = '🎲'
      
      return icon ? (
        <span key={idx} className="effect-icon" title={eff.description}>
          {icon}
        </span>
      ) : null
    })
  }
  
  return (
    <div
      data-card-id={card.id}
      onClick={() => onClick && onClick(card)}
      className={`card ${sizeClass} ${className} ${selected ? 'selected' : ''} ${isTargetable ? 'target-highlight' : ''} ${!card.canAttack && isField ? 'card-tired' : ''}`}
    >
      <div className="card-frame">
        <img 
          src={card.image} 
          alt={card.name} 
          onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=300&fit=crop&q=80')} 
        />
        <div className="card-mana">{card.mana}</div>
        <div className="card-type">{card.type.name.charAt(0)}</div>
        
        {!isField && (
          <div className="card-stats-overlay">
            <div className="card-name">{card.name}</div>
            <div className="card-stats-row">
              {heal > 0 ? (
                <div className="stat-item heal-stat">
                  💚 {heal}
                </div>
              ) : (
                <div className="stat-item atk-stat">
                  ⚔️ {attack}
                </div>
              )}
              <div className="stat-item def-stat">
                🛡️ {defense}
              </div>
            </div>
            {card.effects && card.effects.length > 0 && (
              <div className="card-effects-hand">
                {getEffectIcons()}
              </div>
            )}
          </div>
        )}
        
        {isField && (
          <>
            <div className="card-stats">
              {heal > 0 ? (
                <span className="heal">💚 {heal}</span>
              ) : (
                <span className="atk">⚔️ {attack}</span>
              )}
              <span className="def">🛡️ {defense}</span>
            </div>
            {card.effects && card.effects.length > 0 && (
              <div className="card-effects-field">
                {getEffectIcons()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}