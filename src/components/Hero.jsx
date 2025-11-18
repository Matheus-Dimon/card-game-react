import React from 'react'

export default function Hero({ name = 'Hero', hp = 30, mana = 0, image, onClick, isTargetable = false, heroKey = 'player' }) {
  const crystals = Array.from({ length: Math.min(mana, 10) })
  return (
    <div data-hero={heroKey} className={`hero ${isTargetable ? 'targetable' : ''}`} onClick={onClick}>
      <img src={image} alt={name} className="hero-img" />
      <div className="hero-info">
        <div className="hero-name">{name}</div>
        <div className="hero-stats">HP: <strong>{hp}</strong></div>
        <div className="hero-resources" aria-hidden>
          {crystals.map((_, i) => (
            <div key={i} className="hero-crystal" />
          ))}
        </div>
      </div>
    </div>
  )
}
