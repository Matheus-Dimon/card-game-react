import React from 'react';
import '../styles/styles.css';

const HeroPowerTooltip = ({ power }) => {
  if (!power) return null;

  const getDescription = () => {
    switch (power.effect) {
      case 'damage':
        return `Causa ${power.amount} de dano a um alvo.`;
      case 'heal_target':
        return `Cura ${power.amount} de vida a qualquer alvo (herói ou unidade).`;
      case 'heal':
        return `Cura ${power.amount} de vida ao herói.`;
      case 'armor':
        return `Ganha ${power.amount} de armadura.`;
      case 'draw':
        return `Compra ${power.amount} carta${power.amount > 1 ? 's' : ''}.`;
      case 'charge_melee':
        return `Suas unidades corpo a corpo podem atacar neste turno.`;
      case 'buff_all':
        return `+${power.amount}/+${power.amount} a todas suas unidades.`;
      case 'damage_all_enemies':
        return `Causa ${power.amount} de dano a todas unidades inimigas.`;
      case 'mana_boost':
        return `Ganha ${power.amount} de mana temporária permanentemente (aumenta máxima).`;
      case 'draw_from_graveyard':
        return `Retorna ${power.amount} unidade${power.amount > 1 ? 's' : ''} morta${power.amount > 1 ? 's' : ''} para a mão.`;
      default:
        return power.description || 'Efeito desconhecido.';
    }
  };

  return (
    <div className="hero-power-tooltip">
      <div className="hero-power-tooltip-content">
        <h3>{power.name}</h3>
        <p><strong>Custo:</strong> {power.cost} 💎</p>
        <p style={{ marginTop: '8px' }}>{getDescription()}</p>
        {power.requiresTarget && (
          <p style={{ fontStyle: 'italic', marginTop: '8px' }}>
            Requer alvo a escolher.
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroPowerTooltip;
