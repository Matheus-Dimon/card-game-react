import React from 'react'
import { CARD_OPTIONS } from '../utils/constants.js'

export default function DeckSetup({ onStart }) {
  const [selected, setSelected] = React.useState([])
  const pool = CARD_OPTIONS.P1

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const hpselect = () => {
    if (selected.length < 8) return alert('Escolha ao menos 8 cartas para iniciar (demo rule).')
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
      <button onClick={hpselect} className="btn">Hero power select</button>
    </div>
  )
}
