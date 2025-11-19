import React, { useContext } from 'react'
import Hero from './Hero'
import BattlefieldLane from './BattlefieldLane'
import Hand from './Hand'
import AnimationLayer from './AnimationLayer'
import GameContext from '../context/GameContext.jsx'
import HeroPowerBadge from './HeroPowerBadge.jsx'
import GameOverModal from './GameOverModal.jsx'

export default function Board() {
  const { state, dispatch } = useContext(GameContext)
  const { player1, player2, turn, animation, targeting, gameOver, winner } = state

  const playCard = (card) => {
    // Só pode jogar no seu turno
    if (turn !== 1) return
    dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player1' } })
  }

  const endTurn = () => {
    if (turn !== 1) return
    dispatch({ type: 'END_TURN' })
  }

  const onPlayerFieldCardClick = (card) => {
    // Só permite selecionar durante o turno do player1
    if (turn !== 1) return
    
    // Não permite selecionar se estiver em modo targeting de hero power
    if (targeting.active) return
    
    // Só permite selecionar cartas que podem atacar
    if (!card.canAttack) return

    // Se não há atacante selecionado, seleciona este
    if (!state.selectedCardId) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
      return
    }

    // Se clicou no atacante já selecionado, cancela seleção
    if (state.selectedCardId === card.id) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    // Se clicou em outra carta própria, troca o atacante
    dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
  }

  const onTargetClick = (target, isHero = false, targetHeroKey = null) => {
    // Se estiver em modo targeting de hero power
    if (targeting.active && targeting.playerUsing === 'player1') {
      handleHeroPowerTarget(target, isHero, targetHeroKey)
      return
    }

    // Modo ataque normal
    if (turn !== 1) return
    
    const attackerId = state.selectedCardId
    if (!attackerId) return

    // Encontra o atacante
    const attacker = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === attackerId)
    if (!attacker || !attacker.canAttack) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    // REGRA: Verifica se alvo é válido
    if (!isValidTarget(attacker, target, isHero, targetHeroKey)) {
      return
    }

    // Processa ataque com animação
    processAttack(attacker, target, isHero, targetHeroKey)
  }

  const isValidTarget = (attacker, target, isHero, targetHeroKey) => {
    // Não pode atacar a si mesmo ou aliados
    if (targetHeroKey === 'player1' || (target && isCardOwner(target.id, 'player1'))) {
      return false
    }

    // REGRA: Cartas MELEE só podem atacar cartas MELEE ou o hero se não houver MELEE inimigo
    if (attacker.type.lane === 'melee') {
      if (isHero) {
        // Só pode atacar hero se não houver minions melee inimigos
        return player2.field.melee.length === 0
      } else {
        // Melee só pode atacar melee
        return target && target.type.lane === 'melee'
      }
    }

    // REGRA: Cartas RANGED podem atacar qualquer coisa (ranged, melee ou hero)
    if (attacker.type.lane === 'ranged') {
      return true
    }

    return false
  }

  const processAttack = (attacker, target, isHero, targetHeroKey) => {
    const attackerEl = document.querySelector(`[data-card-id="${attacker.id}"]`)
    const damageVal = attacker.attack || 1
    const targetEl = isHero 
      ? document.querySelector(`[data-hero="${targetHeroKey}"]`) 
      : (target ? document.querySelector(`[data-card-id="${target.id}"]`) : null)

    if (!attackerEl || !targetEl) {
      // Fallback sem animação
      dispatch({ 
        type: 'APPLY_ATTACK_DAMAGE', 
        payload: { 
          attackerId: attacker.id, 
          targetId: isHero ? null : (target ? target.id : null), 
          targetIsHero: isHero, 
          damage: damageVal, 
          playerKey: 'player1' 
        } 
      })
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    const startRect = attackerEl.getBoundingClientRect()
    const endRect = targetEl.getBoundingClientRect()

    // Determina tipo de projétil baseado no tipo de unidade
    let projectile = 'stone'
    if (attacker.type?.name?.toLowerCase().includes('arqueiro')) projectile = 'arrow'
    if (attacker.type?.name?.toLowerCase().includes('cler')) projectile = 'spark'

    const cbAction = { 
      type: 'APPLY_ATTACK_DAMAGE', 
      payload: { 
        attackerId: attacker.id, 
        targetId: isHero ? null : (target ? target.id : null), 
        targetIsHero: isHero, 
        damage: damageVal, 
        playerKey: 'player1' 
      } 
    }

    dispatch({ 
      type: 'INITIATE_ANIMATION', 
      payload: { 
        startRect, 
        endRect, 
        duration: 700, 
        projectile, 
        damage: damageVal, 
        callbackAction: cbAction 
      } 
    })
    
    dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
  }

  const handleHeroPowerTarget = (target, isHero, targetHeroKey) => {
    const { power, playerUsing } = targeting

    // Valida se o alvo é do oponente
    if (isHero && targetHeroKey === playerUsing) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    if (!isHero && target && isCardOwner(target.id, playerUsing)) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    dispatch({
      type: 'APPLY_HERO_POWER_WITH_TARGET',
      payload: {
        playerKey: playerUsing,
        power,
        targetCardId: isHero ? null : (target ? target.id : null),
        targetIsHero: isHero
      }
    })
  }

  const isCardOwner = (cardId, playerKey) => {
    if (!cardId) return false
    const player = state[playerKey]
    return [...player.field.melee, ...player.field.ranged].some(c => c.id === cardId)
  }

  const findOwnerOfCard = (cardId) => {
    if (!cardId) return null
    if (isCardOwner(cardId, 'player1')) return 'player1'
    if (isCardOwner(cardId, 'player2')) return 'player2'
    return null
  }

  const selectedOwner = findOwnerOfCard(state.selectedCardId)

  // Determina se hero é targetável
  const isPlayer2HeroTargetable = () => {
    if (targeting.active && targeting.playerUsing === 'player1') return true
    if (state.selectedCardId && selectedOwner === 'player1') {
      const attacker = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === state.selectedCardId)
      if (!attacker) return false
      
      // RANGED pode atacar sempre, MELEE só se não houver melee inimigo
      if (attacker.type.lane === 'ranged') return true
      if (attacker.type.lane === 'melee' && player2.field.melee.length === 0) return true
    }
    return false
  }

  return (
    <div className="board-root">
      <div className="board-top">
        <Hero 
          heroKey="player2" 
          name="Enemy" 
          hp={player2.hp} 
          mana={player2.mana} 
          armor={player2.armor}
          image={player2.heroImage} 
          onClick={() => onTargetClick(null, true, 'player2')} 
          isTargetable={isPlayer2HeroTargetable()}
        />
        <HeroPowerBadge 
          powers={player2.heroPowers}
          onClick={(powerId) => dispatch({ type: "HERO_POWER_CLICK", payload: {player: "player2", powerId}})} 
        />
        <div className="board-field">
          <BattlefieldLane 
            cards={player2.field.melee} 
            laneType="melee" 
            playerKey="player2" 
            onCardClick={(c) => onTargetClick(c, false, 'player2')} 
            selectedCardId={state.selectedCardId} 
            selectedOwner={selectedOwner}
            targetingActive={targeting.active && targeting.playerUsing === 'player1'}
          />
          <BattlefieldLane 
            cards={player2.field.ranged} 
            laneType="ranged" 
            playerKey="player2" 
            onCardClick={(c) => onTargetClick(c, false, 'player2')} 
            selectedCardId={state.selectedCardId} 
            selectedOwner={selectedOwner}
            targetingActive={targeting.active && targeting.playerUsing === 'player1'}
          />
        </div>
      </div>
      
      <div className="board-center">
        <div className="board-middle-field">
          <BattlefieldLane 
            cards={player1.field.melee} 
            laneType="melee" 
            playerKey="player1" 
            onCardClick={onPlayerFieldCardClick} 
            selectedCardId={state.selectedCardId} 
            selectedOwner={selectedOwner}
            targetingActive={false}
          />
          <BattlefieldLane 
            cards={player1.field.ranged} 
            laneType="ranged" 
            playerKey="player1" 
            onCardClick={onPlayerFieldCardClick} 
            selectedCardId={state.selectedCardId} 
            selectedOwner={selectedOwner}
            targetingActive={false}
          />
        </div>
      </div>

      <div className="board-bottom">
        <Hero 
          heroKey="player1" 
          name="Player" 
          hp={player1.hp} 
          mana={player1.mana} 
          armor={player1.armor}
          image={player1.heroImage} 
          onClick={() => onTargetClick(null, true, 'player1')} 
        />
        <HeroPowerBadge 
          powers={player1.heroPowers} 
          onClick={(powerId) => dispatch({ type: "HERO_POWER_CLICK", payload: {player: "player1", powerId}})} 
        />
        <Hand cards={player1.hand} onPlayCard={playCard} />
        <div className="controls">
          <button className="btn" onClick={endTurn} disabled={turn !== 1}>
            {turn === 1 ? 'End Turn' : 'Enemy Turn...'}
          </button>
        </div>
      </div>

      {targeting.active && targeting.playerUsing === 'player1' && (
        <div className="targeting-overlay">
          <div className="targeting-message">
            Selecione um alvo para {targeting.power?.name}
            <button className="btn-cancel" onClick={() => dispatch({type: 'CANCEL_TARGETING'})}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <AnimationLayer animation={animation} onComplete={(cb) => {
        try {
          dispatch({ type: 'END_ANIMATION' })
          if (cb) dispatch(cb)
        } catch (err) {
          console.error('Error handling animation callback', err, cb)
          try { dispatch({ type: 'END_ANIMATION' }) } catch (e) { console.error(e) }
        }
      }} />

      {gameOver && <GameOverModal winner={winner} onRestart={() => dispatch({type: 'RESTART_GAME'})} />}
    </div>
  )
}