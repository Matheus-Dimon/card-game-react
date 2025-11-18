import React from 'react'
import Hero from './Hero'
import BattlefieldLane from './BattlefieldLane'
import Hand from './Hand'
import GameLog from './GameLog'
import AnimationLayer from './AnimationLayer'
import { useContext } from 'react'
import GameContext from '../context/GameContext'

export default function Board() {
  const { state, dispatch } = useContext(GameContext)
  const { player1, player2, turn, log, animation } = state

  const playCard = (card) => {
    dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player1' } })
  }

  const endTurn = () => dispatch({ type: 'END_TURN' })

  const onPlayerFieldCardClick = (card) => {
    // Only allow player1 to select during their turn
    if (turn !== 1) return
    
    // Only allow selection of cards that can attack
    if (!card.canAttack) return

    // if there's currently no selected attacker, select this player's card as attacker
    if (!state.selectedCardId) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
      return
    }

    // if clicked the selected attacker, cancel selection
    if (state.selectedCardId === card.id) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    // otherwise, if an attacker is selected and player clicked another of their own cards, switch attacker
    dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
  }

  const onTargetClick = (target, isHero = false, targetHeroKey = null) => {
    // Only allow player1 to attack during their turn
    if (turn !== 1) return
    
    const attackerId = state.selectedCardId
    if (!attackerId) return

    // Verify attacker belongs to player1 and can attack
    const attacker = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === attackerId)
    if (!attacker || !attacker.canAttack) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    // Verify target is valid (belongs to player2 or is player2 hero)
    if (!isHero) {
      const targetValid = [...player2.field.melee, ...player2.field.ranged].some(c => c.id === target?.id)
      if (!targetValid) return
    } else if (targetHeroKey !== 'player2') {
      return // Can't attack own hero
    }

    const attackerEl = document.querySelector(`[data-card-id="${attackerId}"]`)
    const damageVal = attacker.attack || 1
    const targetEl = isHero ? document.querySelector(`[data-hero="${targetHeroKey}"]`) : (target ? document.querySelector(`[data-card-id="${target.id}"]`) : null)

    if (!attackerEl || !targetEl) {
      // fallback immediate
      dispatch({ type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId, targetId: isHero ? null : (target ? target.id : null), targetIsHero: isHero, damage: damageVal, playerKey: 'player1' } })
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    const startRect = attackerEl.getBoundingClientRect()
    const endRect = targetEl.getBoundingClientRect()

    // determine projectile type from attacker unit type
    let projectile = 'stone'
    if (attacker.type?.name?.toLowerCase().includes('arqueiro')) projectile = 'arrow'
    if (attacker.type?.name?.toLowerCase().includes('cler')) projectile = 'spark'

    const cbAction = { type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId, targetId: isHero ? null : (target ? target.id : null), targetIsHero: isHero, damage: damageVal, playerKey: 'player1' } }

    dispatch({ type: 'INITIATE_ANIMATION', payload: { startRect, endRect, duration: 700, projectile, damage: damageVal, callbackAction: cbAction } })
    // clear selection
    dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
  }

  const findOwnerOfCard = (cardId) => {
    if (!cardId) return null
    const inP1 = [...player1.field.melee, ...player1.field.ranged].some(c => c.id === cardId)
    if (inP1) return 'player1'
    const inP2 = [...player2.field.melee, ...player2.field.ranged].some(c => c.id === cardId)
    if (inP2) return 'player2'
    return null
  }
  const selectedOwner = findOwnerOfCard(state.selectedCardId)

  return (
    <div className="board-root">
      <div className="board-top">
        <Hero heroKey="player2" name="Enemy" hp={player2.hp} mana={player2.mana} image={player2.heroImage} onClick={() => onTargetClick(null,true,'player2')} />
        <div className="board-field">
          <BattlefieldLane cards={player2.field.melee} laneType="melee" playerKey="player2" onCardClick={(c)=> onTargetClick(c,false,'player2')} selectedCardId={state.selectedCardId} selectedOwner={selectedOwner} />
          <BattlefieldLane cards={player2.field.ranged} laneType="ranged" playerKey="player2" onCardClick={(c)=> onTargetClick(c,false,'player2')} selectedCardId={state.selectedCardId} selectedOwner={selectedOwner} />
        </div>
        <GameLog log={log} />
      </div>

      <div className="board-center">
        <div className="board-middle-field">
          <BattlefieldLane cards={player1.field.melee} laneType="melee" playerKey="player1" onCardClick={onPlayerFieldCardClick} selectedCardId={state.selectedCardId} selectedOwner={selectedOwner} />
          <BattlefieldLane cards={player1.field.ranged} laneType="ranged" playerKey="player1" onCardClick={onPlayerFieldCardClick} selectedCardId={state.selectedCardId} selectedOwner={selectedOwner} />
        </div>
      </div>

      <div className="board-bottom">
        <Hero heroKey="player1" name="Player" hp={player1.hp} mana={player1.mana} image={player1.heroImage} onClick={() => onTargetClick(null,true,'player1')} />
        <Hand cards={player1.hand} onPlayCard={playCard} />
        <div className="controls">
          <button className="btn" onClick={endTurn}>End Turn</button>
        </div>
      </div>

      <AnimationLayer animation={animation} onComplete={(cb) => {
        try {
          dispatch({ type: 'END_ANIMATION' })
          if (cb) dispatch(cb)
        } catch (err) {
          console.error('Error handling animation callback', err, cb)
          // ensure animation state cleared
          try { dispatch({ type: 'END_ANIMATION' }) } catch (e) { console.error(e) }
        }
      }} />
    </div>
  )
}
