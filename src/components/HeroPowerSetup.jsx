import React from 'react'
import { HERO_POWER_OPTIONS } from '../utils/constants.js'

export default function HeropSetup({ onStart }) {
  const [selected, setSelected] = React.useState([])
  const pool = HERO_POWER_OPTIONS.P1
  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }
  const start = () => {
    if (selected.length <2) return alert('Escolha ao menos 2 poderes para o seu herói para iniciar (demo rule).')
    onStart(selected)
  }

  return (
    <div className="hero-power-setup">
      <h3>Escolha seus poderes do herói (demo)</h3>
      <div className="hero-power-grid">
        {pool.map(c => (
          <div key={c.id} className={`hero-power-card ${selected.includes(c.id) ? 'selected' : ''}`} onClick={() => toggle(c.id)}>
            <img src={c.image} alt={c.name} />
            <div className="hero-power-name">{c.name}</div>
          </div>
        ))}
      </div>
      <button onClick={start} className="btn">Start Game</button>
    </div>
  )
}
