import React from 'react'
import Card from './Card'

export default function Hand({ cards = [], onPlayCard }) {
  return (
    <div className="hand">
      {cards.map(c => (
        <Card key={c.id} card={c} onClick={() => onPlayCard && onPlayCard(c)} />
      ))}
    </div>
  )
}
