import React from 'react'

export default function Card({ card, isField = false, onClick, className = '', selected = false, isTargetable = false }) {
  const attack = card.attack || card.currentAttack || 0
  const defense = card.defense || 0
  const heal = card.healValue || card.currentHeal || 0
  const sizeClass = isField ? 'card-field' : 'card-hand'
  return (
    <div
      data-card-id={card.id}
      onClick={() => onClick && onClick(card)}
      className={`card ${sizeClass} ${className} ${selected ? 'selected' : ''} ${isTargetable ? 'target-highlight' : ''}`}
    >
      <div className="card-frame">
        <img src={card.image} alt={card.name} onError={(e) => (e.currentTarget.src = 'https://placehold.co/80x110/6b7280/f3f4f6?text=C')} />
        <div className="card-mana">{card.mana}</div>
        <div className="card-type">{card.type.name.charAt(0)}</div>
        {isField && (
          <div className="card-stats">
            {heal ? (
              <span className="heal">➕ {heal}</span>
            ) : (
              <span className="atk">⚔️ {attack}</span>
            )}{' '}
            <span className="def">🛡️ {defense}</span>
          </div>
        )}
      </div>
    </div>
  )
}
