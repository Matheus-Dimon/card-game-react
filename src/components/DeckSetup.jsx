import React, { useContext } from 'react'
import { CARD_OPTIONS } from '../utils/constants.js'
import { GameContext } from '../context/GameContext'

export default function DeckSetup() {
  const { state, dispatch } = useContext(GameContext)
  const pool = CARD_OPTIONS.P1
  const selected = state.selectedDeckCards || []
  const maxAllowed = 3 // Max 3 copies per card

  const handleCardClick = (cardId, selectedCards) => {
    const count = selectedCards.filter(x => x === cardId).length
    let newSelected
    if (count < 3) {
      newSelected = [...selectedCards, cardId] // Add one copy
    } else if (count === 3) {
      newSelected = selectedCards.filter(x => x !== cardId) // Remove all copies
    } else {
      newSelected = selectedCards // Fallback, should not happen
    }
    return newSelected
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
        {eff.effect === 'DAMAGE_TARGET_ENEMY' && ''}
      </span>
    ))
  }

  const handleSelectedCardClick = (cardId) => {
    const newSelected = selected.filter(id => id !== cardId)
    dispatch({ type: 'SET_SELECTED_DECK_CARDS', payload: newSelected })
  }

  return (
    <div className="deck-setup">
      <div className="setup-header">
        <h2>⚔️ Monte seu Deck</h2>
        <p className={`setup-subtitle ${selected.length === 15 ? 'deck-complete' : ''}`}>
          Escolha exatamente 15 cartas • {selected.length}/15 selecionadas
          {selected.length === 15 && <span className="warning"> - Deck completo!</span>}
        </p>
      </div>

      {selected.length === 15 && (
        <div className="bright-warning">
          ✨ DECK COMPLETO! ✨
        </div>
      )}

      <div className="deck-setup-container">
        <div className="deck-selection-area">
          <div className="deck-grid">
            {pool.map(c => (
              <div
                key={c.id}
                className={`deck-card ${selected.includes(c.id) ? 'selected' : ''}`}
                onClick={() => {
                  const newSelection = handleCardClick(c.id, selected)
                  if (newSelection.length > 15) {
                    alert('Você não pode selecionar mais de 15 cartas!')
                    return
                  }
                  dispatch({ type: 'SET_SELECTED_DECK_CARDS', payload: newSelection })
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
                {(() => {
                  const count = selected.filter(x => x === c.id).length
                  return <div className="selected-badge">{count}</div>
                })()}
              </div>
            ))}
          </div>
        </div>

        <div className="selected-cards-panel">
          <h3>Cartas Selecionadas ({selected.length}/15)</h3>
          <div className="selected-cards-list">
            {selected.length > 0 ? (
              selected.map((cardId, idx) => {
                const card = pool.find(c => c.id === cardId)
                return (
                  <div
                    key={`${cardId}-${idx}`}
                    className="selected-card-item"
                    onClick={() => handleSelectedCardClick(cardId)}
                  >
                    <span className="selected-card-number">{idx + 1}.</span>
                    <div className="selected-card-image">
                      <img src={card?.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=50&h=75&fit=crop&q=80'} alt={card?.name || cardId} />
                    </div>
                    <div className="selected-card-info">
                      <div className="selected-card-name">{card?.name || cardId}</div>
                      <div className="selected-card-stats">
                        {card && (
                          <>
                            <span className="mana-cost">{card.mana}💎</span>
                            <span className="attack">⚔️{card.attack || card.healValue || 0}</span>
                            <span className="defense">🛡️{card.defense}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="empty-selection">Nenhuma carta selecionada ainda.</p>
            )}
          </div>
        </div>
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
