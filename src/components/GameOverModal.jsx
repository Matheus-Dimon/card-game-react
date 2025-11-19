import React from 'react'

export default function GameOverModal({ winner, onRestart }) {
  const isVictory = winner === 'player1'

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className={`game-over-header ${isVictory ? 'victory' : 'defeat'}`}>
          {isVictory ? '🎉 VITÓRIA!' : '💀 DERROTA'}
        </div>
        
        <div className="game-over-content">
          {isVictory ? (
            <div className="victory-message">
              <p className="message-main">Você derrotou o inimigo!</p>
              <p className="message-sub">Sua estratégia foi perfeita</p>
            </div>
          ) : (
            <div className="defeat-message">
              <p className="message-main">O inimigo te derrotou!</p>
              <p className="message-sub">Tente novamente com uma nova estratégia</p>
            </div>
          )}
        </div>

        <div className="game-over-actions">
          <button className="btn btn-restart" onClick={onRestart}>
            🔄 Jogar Novamente
          </button>
        </div>
      </div>
    </div>
  )
}