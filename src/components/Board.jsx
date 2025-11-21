import React, { useContext } from 'react'
import Hero from './Hero'
import BattlefieldLane from './BattlefieldLane'
import Hand from './Hand'
import { GameContext } from '../context/GameContext.jsx'
import HeroPowerBadge from './HeroPowerBadge.jsx'
import GameOverModal from './GameOverModal.jsx'
import InstructionsPanel from './InstructionsPanel.jsx'
import AnimationLayer from './AnimationLayer.jsx'

// Sistema de sons MELHORADO
const playSound = (type) => {
  try {
    const sounds = {
      cardPlay: () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 200
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      },
      // Som de ESPADA para ataques melee
      meleeAttack: () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        filter.type = 'bandpass'
        filter.frequency.value = 800

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)

        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      },
      // Som de FLECHA para ataques ranged
      rangedAttack: () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(2000, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      },
      impact: () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.value = 80
        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      },
      heroPower: () => {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      },
      victory: () => {
        const ctx = new AudioContext()
        const notes = [523, 659, 784, 1047]
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4)
          osc.start(ctx.currentTime + i * 0.15)
          osc.stop(ctx.currentTime + i * 0.15 + 0.4)
        })
      }
    }

    if (sounds[type]) sounds[type]()
  } catch (err) {
    console.log('Audio context error:', err)
  }
}

export default function Board() {
  const { state, dispatch } = useContext(GameContext)
  const { player1, player2, turn, animation, targeting, gameOver, winner } = state

  const playCard = (card) => {
    if (turn !== 1) return
    playSound('cardPlay')
    dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player1' } })
  }

  const endTurn = () => {
    if (turn !== 1) return
    dispatch({ type: 'END_TURN' })
  }

  const onPlayerFieldCardClick = (card) => {
    if (turn !== 1) return

    // If currently targeting for hero power, do nothing
    if (targeting.active) return

    // If currently targeting for healing, select target to heal
    if (state.targeting.healingActive) {
      // Only allow healing own cards or deselect if clicked same
      if (isCardOwner(card.id, 'player1')) {
        dispatch({
          type: 'APPLY_HEAL_WITH_TARGET',
          payload: {
            targetCardId: card.id,
            targetIsHero: false
          }
        })
      }
      return
    }

    if (!card.canAttack) return

    // Check if this is a cleric unit (has healValue)
    if (card.healValue && card.healValue > 0) {
      // Start targeting for healing allies
      dispatch({
        type: 'INITIATE_HEAL_TARGETING',
        payload: {
          healerId: card.id,
          healAmount: card.healValue
        }
      })
      return
    }

    if (!state.selectedCardId) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
      return
    }

    if (state.selectedCardId === card.id) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: card.id } })
  }

  const onTargetClick = (target, isHero = false, targetHeroKey = null) => {
    // Handle cleric healing targeting first
    if (state.targeting.healingActive && state.targeting.playerUsing === 'player1') {
      if (!target && !isHero) return

      // Don't heal enemy targets
      if (targetHeroKey !== 'player1' && !target) return
      if (target && !isCardOwner(target.id, 'player1')) return

      // Initiate heal animation
      const healer = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === state.targeting.healerId)
      if (healer) {
        const healerEl = document.querySelector(`[data-card-id="${healer.id}"]`)
        const targetEl = isHero
          ? document.querySelector(`[data-hero="${player1.hero ? 'player1' : 'player1'}"]`)
          : (target ? document.querySelector(`[data-card-id="${target.id}"]`) : null)

        if (healerEl && targetEl) {
          const healerRect = healerEl.getBoundingClientRect()
          const targetRect = targetEl.getBoundingClientRect()

          dispatch({
            type: 'INITIATE_ANIMATION',
            payload: {
              startRect: healerRect,
              endRect: targetRect,
              duration: 1000,
              damage: -state.targeting.healAmount, // negative for heal
              projectile: 'healglow',
              callbackAction: {
                type: 'APPLY_HEAL_WITH_TARGET',
                payload: {
                  targetCardId: isHero ? null : (target ? target.id : null),
                  targetIsHero: isHero
                }
              }
            }
          })
        } else {
          dispatch({
            type: 'APPLY_HEAL_WITH_TARGET',
            payload: {
              targetCardId: isHero ? null : (target ? target.id : null),
              targetIsHero: isHero
            }
          })
        }
      }
      return
    }

    if (targeting.active && targeting.playerUsing === 'player1') {
      handleHeroPowerTarget(target, isHero, targetHeroKey)
      return
    }

    if (turn !== 1) return

    const attackerId = state.selectedCardId
    if (!attackerId) return

    const attacker = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === attackerId)
    if (!attacker || !attacker.canAttack) {
      dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      return
    }

    if (!isValidTarget(attacker, target, isHero, targetHeroKey)) {
      return
    }

    // Toca som apropriado baseado no tipo de ataque
    if (attacker.type.lane === 'melee') {
      playSound('meleeAttack')
    } else {
      playSound('rangedAttack')
    }

    processAttack(attacker, target, isHero, targetHeroKey)
  }

  const isValidTarget = (attacker, target, isHero, targetHeroKey) => {
    if (targetHeroKey === 'player1' || (target && isCardOwner(target.id, 'player1'))) {
      return false
    }

    if (attacker.type.lane === 'melee') {
      if (isHero) {
        // MELEE pode atacar hero se não houver nenhuma unidade MELEE inimiga
        return player2.field.melee.length === 0
      } else {
        // MELEE pode atacar MELEE sempre
        if (target && target.type.lane === 'melee') return true
        // MELEE pode atacar RANGED se não houver MELEE inimigo
        if (target && target.type.lane === 'ranged' && player2.field.melee.length === 0) return true
        return false
      }
    }

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

    const isMelee = attacker.type.lane === 'melee'
    let animationPayload = {
      startRect,
      endRect,
      duration: isMelee ? 1000 : 800, // Increased duration for drama
      damage: damageVal,
      callbackAction: {
        type: 'APPLY_ATTACK_DAMAGE',
        payload: {
          attackerId: attacker.id,
          targetId: isHero ? null : (target ? target.id : null),
          targetIsHero: isHero,
          damage: damageVal,
          playerKey: 'player1'
        }
      }
    }

    if (isMelee) {
      // Melee attack anticipation: lean back, then lunge forward
      const originalTransform = attackerEl.style.transform
      const originalScale = attackerEl.style.scale || 1

      // Phase 1: Anticipation - lean back
      attackerEl.style.transform = originalTransform + ' translateY(-20px) rotateX(-10deg) scale(1.05)'
      attackerEl.style.boxShadow = '0 15px 40px rgba(245,192,107,0.6)'

      setTimeout(() => {
        // Phase 2: Lunge - move forward and scale down
        const targetRect = targetEl.getBoundingClientRect()
        const attackerRect = attackerEl.getBoundingClientRect()
        const deltaX = (targetRect.left - attackerRect.left) * 0.3
        const deltaY = (targetRect.top - attackerRect.top) * 0.3

        attackerEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.95) rotateX(20deg)`
        attackerEl.style.boxShadow = '0 5px 20px rgba(245,192,107,0.4)'

        setTimeout(() => {
          // Phase 3: Animate projectile (invisible melee projectile for timing)
          attackerEl.style.transform = originalTransform
          attackerEl.style.boxShadow = ''
          dispatch({
            type: 'INITIATE_ANIMATION',
            payload: animationPayload
          })
          dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
        }, 400)
      }, 300)
    } else {
      // Ranged attack anticipation: slight glow and scale up
      const originalTransform = attackerEl.style.transform
      const originalBoxShadow = attackerEl.style.boxShadow

      attackerEl.style.transform = originalTransform + ' scale(1.02)'
      attackerEl.style.boxShadow = '0 0 20px rgba(245,192,107,0.4)'

      setTimeout(() => {
        attackerEl.style.transform = originalTransform
        attackerEl.style.boxShadow = originalBoxShadow || ''

        // For ranged, use projectile
        let projectile = 'stone'
        if (attacker.type?.name?.toLowerCase().includes('arqueiro')) projectile = 'arrow'
        if (attacker.type?.name?.toLowerCase().includes('cler')) projectile = 'spark'
        animationPayload.projectile = projectile
        dispatch({
          type: 'INITIATE_ANIMATION',
          payload: animationPayload
        })
        dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
      }, 200)
    }
  }

  const handleHeroPowerTarget = (target, isHero, targetHeroKey) => {
    const { power, playerUsing } = targeting

    if (isHero && targetHeroKey === playerUsing) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    if (!isHero && target && isCardOwner(target.id, playerUsing)) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    playSound('heroPower')
    processHeroPower(power, playerUsing, target, isHero, targetHeroKey)
  }

  const processHeroPower = (power, playerUsing, target, isHero, targetHeroKey) => {
    const heroEl = document.querySelector(`[data-hero="${playerUsing}"]`)
    const damageVal = power.amount || 1
    const targetEl = isHero
      ? document.querySelector(`[data-hero="${targetHeroKey}"]`)
      : (target ? document.querySelector(`[data-card-id="${target.id}"]`) : null)

    if (!heroEl || (!targetEl && !isHero)) {
      dispatch({
        type: 'APPLY_HERO_POWER_WITH_TARGET',
        payload: {
          playerKey: playerUsing,
          power,
          targetCardId: isHero ? null : (target ? target.id : null),
          targetIsHero: isHero
        }
      })
      return
    }

    const startRect = heroEl.getBoundingClientRect()
    const endRect = isHero
      ? document.querySelector(`[data-hero="${targetHeroKey}"]`).getBoundingClientRect()
      : targetEl.getBoundingClientRect()

    // Determine projectile based on power effect
    let projectile = 'spark' // default glowy effect
    if (power.effect === 'damage') projectile = 'fireball'  // red/fire
    if (power.effect === 'heal_target') projectile = 'healglow'  // green healing

    const animationPayload = {
      startRect,
      endRect,
      duration: 800, // Smooth like Hearthstone
      damage: power.effect === 'damage' ? damageVal : null,
      projectile,
      callbackAction: {
        type: 'APPLY_HERO_POWER_WITH_TARGET',
        payload: {
          playerKey: playerUsing,
          power,
          targetCardId: isHero ? null : (target ? target.id : null),
          targetIsHero: isHero
        }
      }
    }

    dispatch({
      type: 'INITIATE_ANIMATION',
      payload: animationPayload
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

  const isPlayer2HeroTargetable = () => {
    if (targeting.active && targeting.playerUsing === 'player1') return true
    if (state.selectedCardId && selectedOwner === 'player1') {
      const attacker = [...player1.field.melee, ...player1.field.ranged].find(c => c.id === state.selectedCardId)
      if (!attacker) return false

      if (attacker.type.lane === 'ranged') return true
      if (attacker.type.lane === 'melee' && player2.field.melee.length === 0) return true
    }
    return false
  }

  React.useEffect(() => {
    if (gameOver && winner === 'player1') {
      playSound('victory')
    }
  }, [gameOver, winner])

  return (
    <div className="board-container">
      <div className="board-root">
      <div className="board-section board-top">
        <div className="hero-area">
          <Hero
            heroKey="player2"
            name="Enemy"
            hp={player2.hp}
            mana={player2.mana}
            armor={player2.armor}
            image="https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=200&h=200&fit=crop"
            onClick={() => onTargetClick(null, true, 'player2')}
            isTargetable={isPlayer2HeroTargetable()}
          />
          <HeroPowerBadge
            powers={player2.heroPowers}
            onClick={(powerId) => dispatch({ type: "HERO_POWER_CLICK", payload: {player: "player2", powerId}})}
            disabledProps={{ disabled: false, mana: 0 }}
          />
        </div>

        <div className="lanes-vertical">
          <BattlefieldLane
            cards={player2.field.ranged}
            laneType="ranged"
            playerKey="player2"
            onCardClick={(c) => onTargetClick(c, false, 'player2')}
            selectedCardId={state.selectedCardId}
            selectedOwner={selectedOwner}
            targetingActive={targeting.active && targeting.playerUsing === 'player1'}
          />
          <BattlefieldLane
            cards={player2.field.melee}
            laneType="melee"
            playerKey="player2"
            onCardClick={(c) => onTargetClick(c, false, 'player2')}
            selectedCardId={state.selectedCardId}
            selectedOwner={selectedOwner}
            targetingActive={targeting.active && targeting.playerUsing === 'player1'}
          />
        </div>
      </div>

      <div className="board-divider" />

      <div className="board-section board-bottom">
        <div className="lanes-vertical">
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

        <div className="hero-area">
          <Hero
            heroKey="player1"
            name="Player"
            hp={player1.hp}
            mana={player1.mana}
            armor={player1.armor}
            image="https://images.unsplash.com/photo-1605792657660-596af9009e82?w=200&h=200&fit=crop"
            onClick={() => onTargetClick(null, true, 'player1')}
          />
          <HeroPowerBadge
            powers={player1.heroPowers}
            onClick={(powerId) => dispatch({ type: "HERO_POWER_CLICK", payload: {player: "player1", powerId}})}
            disabledProps={{ mana: player1.mana, hasUsedHeroPower: player1.hasUsedHeroPower }}
          />
        </div>
      </div>

      <Hand cards={player1.hand} onPlayCard={playCard} playerMana={player1.mana} />

      <div className="controls">
        <button className="btn" onClick={endTurn} disabled={turn !== 1}>
          {turn === 1 ? 'End Turn' : 'Enemy Turn...'}
        </button>
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

      {targeting.healingActive && targeting.playerUsing === 'player1' && (
        <div className="targeting-overlay">
          <div className="targeting-message">
            Selecione um alvo para curar
            <button className="btn-cancel" onClick={() => dispatch({type: 'CANCEL_TARGETING'})}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <AnimationLayer animation={animation} onComplete={(cb) => {
        try {
          playSound('impact')
          dispatch({ type: 'END_ANIMATION' })
          if (cb) dispatch(cb)
        } catch (err) {
          console.error('Error handling animation callback', err, cb)
          try { dispatch({ type: 'END_ANIMATION' }) } catch (e) { console.error(e) }
        }
      }} />

      {gameOver && <GameOverModal winner={winner} onRestart={() => dispatch({type: 'RESTART_GAME'})} />}
    </div>

    <InstructionsPanel />
  </div>
  )
}
