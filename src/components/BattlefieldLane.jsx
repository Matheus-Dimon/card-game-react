import React from 'react'
import Card from './Card'

export default function BattlefieldLane({ cards = [], laneType, playerKey, onCardClick, selectedCardId = null, selectedOwner = null }) {
  return (
    <div className={`lane lane-${laneType}`}>
      <div className="lane-header">{laneType === 'melee' ? 'CORPO A CORPO' : 'LONGA DISTÂNCIA'}</div>
      <div className="lane-cards">
        {cards.map(c => {
          const selected = selectedCardId === c.id
          const isTargetable = selectedCardId && selectedOwner && selectedOwner !== playerKey
          return (
            <Card
              key={c.id}
              card={c}
              isField
              onClick={() => onCardClick && onCardClick(c)}
              selected={selected}
              isTargetable={isTargetable}
            />
          )
        })}
      </div>
    </div>
  )
}
