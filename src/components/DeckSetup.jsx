import React, { useContext } from 'react'
import { CARD_OPTIONS } from '../utils/constants.js'
import GameContext from '../context/GameContext'

export default function DeckSetup() {
  const { state, dispatch } = useContext(GameContext)
  const pool = CARD_OPTIONS.P1
  const selected = state.selectedDeckCards || []

  const toggle = (id) => {
    const newSelected = selected.includes(id) 
      ? selected.filter(x => x !== id) 
      : [...selected, id]
    
    dispatch({ type: 'SET_SELECTED_DECK_CARDS', payload: newSelected })
  }

  const handleNext = () => {
    if (selected.length < 8) {
      alert('Escolha ao menos 8 cartas para continuar!')
      return
    }
    dispatch({ type: 'GO_TO_HERO_POWER_OPTIONS' })
  }

  return (
    <div className="deck-setup">
      <div className="setup-header">
        <h2>Monte seu Deck</h2>
        <p className="setup-subtitle">
          Escolha no mínimo 8 cartas • {selected.length} selecionadas
        </p>
      </div>

      <div className="deck-grid">
        {pool.map(c => (
          <div 
            key={c.id} 
            className={`deck-card ${selected.includes(c.id) ? 'selected' : ''}`} 
            onClick={() => toggle(c.id)}
          >
            <img src={c.image} alt={c.name} />
            <div className="deck-card-info">
              <div className="deck-name">{c.name}</div>
              <div className="deck-stats">
                <span className="mana-cost">{c.mana}</span>
                <span className="attack">⚔️{c.attack}</span>
                <span className="defense">🛡️{c.defense}</span>
              </div>
            </div>
            {selected.includes(c.id) && (
              <div className="selected-badge">✓</div>
            )}
          </div>
        ))}
      </div>

      <div className="setup-footer">
        <button 
          onClick={handleNext} 
          className={`btn btn-primary ${selected.length >= 8 ? '' : 'btn-disabled'}`}
          disabled={selected.length < 8}
        >
          {selected.length >= 8 ? 'Próximo: Escolher Poderes →' : `Faltam ${8 - selected.length} cartas`}
        </button>
      </div>
    </div>
  )
}
