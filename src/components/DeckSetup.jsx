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
    if (selected.length < 15) {
      alert('Escolha exatamente 15 cartas para continuar!')
      return
    }
    dispatch({ type: 'GO_TO_HERO_POWER_OPTIONS' })
  }

  const getEffectBadges = (effects) => {
    if (!effects || effects.length === 0) return null
    return effects.map((eff, idx) => (
      <span key={idx} className="effect-badge" title={eff.description}>
        {eff.effect === 'CHARGE' && '⚡'}
        {eff.effect === 'TAUNT' && '🛡️'}
        {eff.effect === 'LIFESTEAL' && '💉'}
        {eff.effect === 'IMMUNE_FIRST_TURN' && '✨'}
        {eff.effect === 'DAMAGE_ALL_ENEMIES' && '💥'}
        {eff.effect === 'HEAL_HERO' && '💚'}
        {eff.effect === 'DRAW_CARD' && '📖'}
        {eff.effect === 'BUFF_ALL_ALLIES' && '💪'}
        {eff.effect === 'DAMAGE_RANDOM_ENEMY' && '🎲'}
      </span>
    ))
  }

  return (
    <div className="deck-setup">
      <div className="setup-header">
        <h2>⚔️ Monte seu Deck</h2>
        <p className="setup-subtitle">
          Escolha exatamente 15 cartas • {selected.length}/15 selecionadas
        </p>
      </div>

      <div className="deck-grid">
        {pool.map(c => (
          <div 
            key={c.id} 
            className={`deck-card ${selected.includes(c.id) ? 'selected' : ''} ${selected.length >= 15 && !selected.includes(c.id) ? 'disabled' : ''}`} 
            onClick={() => {
              if (selected.length >= 15 && !selected.includes(c.id)) return
              toggle(c.id)
            }}
          >
            <img src={c.image} alt={c.name} onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=300&fit=crop&q=80'} />
            <div className="deck-card-info">
              <div className="deck-name">{c.name}</div>
              <div className="deck-stats">
                <span className="mana-cost">{c.mana}💎</span>
                <span className="attack">⚔️{c.attack || c.healValue || 0}</span>
                <span className="defense">🛡️{c.defense}</span>
              </div>
              {c.effects && c.effects.length > 0 && (
                <div className="deck-effects">
                  {getEffectBadges(c.effects)}
                </div>
              )}
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
          className={`btn btn-primary ${selected.length === 15 ? '' : 'btn-disabled'}`}
          disabled={selected.length !== 15}
        >
          {selected.length === 15 ? 'Próximo: Escolher Poderes →' : `Faltam ${15 - selected.length} cartas`}
        </button>
      </div>
    </div>
  )
}