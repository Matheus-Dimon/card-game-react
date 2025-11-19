import React, { useState } from 'react'

export default function InstructionsPanel() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`instructions-panel ${isOpen ? 'open' : 'closed'}`}>
      <button className="instructions-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '📖 ▼' : '📖 ►'}
      </button>
      
      {isOpen && (
        <div className="instructions-content">
          <h3>📜 Como Jogar</h3>
          
          <div className="instruction-section">
            <h4>⚔️ Combate</h4>
            <ul>
              <li><strong>Melee:</strong> Ataca corpo a corpo. Recebe dano ao atacar melee.</li>
              <li><strong>Ranged:</strong> Ataca à distância. Não recebe dano ao atacar.</li>
              <li>Melee pode atacar ranged se não houver melee inimigo.</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h4>✨ Efeitos das Cartas</h4>
            <ul>
              <li>⚡ <strong>Charge:</strong> Ataca imediatamente</li>
              <li>🛡️ <strong>Taunt:</strong> Deve ser atacado primeiro</li>
              <li>✨ <strong>Imune 1ª Rodada:</strong> Não recebe dano no turno jogado</li>
              <li>💉 <strong>Lifesteal:</strong> Cura o herói ao atacar</li>
              <li>💥 <strong>Battlecry:</strong> Efeito ao ser jogada</li>
              <li>🎲 <strong>Deathrattle:</strong> Efeito ao morrer</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h4>💎 Recursos</h4>
            <ul>
              <li>Ganhe +1 mana máxima por turno (máx. 10)</li>
              <li>Compre 1 carta no início do turno</li>
              <li>Use poderes de herói (1x por turno)</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h4>🎯 Estratégia</h4>
            <ul>
              <li>Controle o campo com unidades melee</li>
              <li>Use ranged para eliminar ameaças</li>
              <li>Clérigos curam além de 30 HP</li>
              <li>Planeje seus turnos com antecedência</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}