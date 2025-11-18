import React from 'react'

export default function HeroPowerSelection({ powers = [], onSelect }) {
  return (
    <div className="hero-powers">
      {powers.map(p => (
        <button key={p.id} className="hero-power" onClick={() => onSelect && onSelect(p)}>{p.name} ({p.cost})</button>
      ))}
    </div>
  )
}
