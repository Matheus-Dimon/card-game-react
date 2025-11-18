import React from 'react'
import { CARD_OPTIONS } from '../utils/constants.js'

export default function DeckSetup({ onStart }) {
  const [selected, setSelected] = React.useState([])
  const pool = CARD_OPTIONS.P1

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const start = () => {
    if (selected.length < 5) return alert('Escolha ao menos 5 cartas para iniciar (demo rule).')
    onStart(selected)
  }

  return (
    <div className="deck-setup">
      <h3>Escolha seu deck (demo)</h3>
      <div className="deck-grid">
        {pool.map(c => (
          <div key={c.id} className={`deck-card ${selected.includes(c.id) ? 'selected' : ''}`} onClick={() => toggle(c.id)}>
            <img src={c.image} alt={c.name} />
            <div className="deck-name">{c.name}</div>
          </div>
        ))}
      </div>
      <button onClick={start} className="btn">Start Game</button>
    </div>
  )
}
