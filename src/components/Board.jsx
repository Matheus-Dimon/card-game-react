import React, { useContext } from 'react'
import Hero from './Hero'
import BattlefieldLane from './BattlefieldLane'
import Hand from './Hand'
import { GameContext } from '../context/GameContext.jsx'
import HeroPowerBadge from './HeroPowerBadge.jsx'
import GameOverModal from './GameOverModal.jsx'
import InstructionsPanel from './InstructionsPanel.jsx'
import AnimationLayer from './AnimationLayer.jsx'
import { HERO_IMAGES } from '../utils/constants.js'

// Sistema de sons MELHORADO
const playSound = (type) => {
  try {
    const sounds = {
      cardPlay: () => {
        const audio = new Audio('/src/SoundEffects/cardPlay.mp3') // assuming background.mp3 is music, need card play sound
        audio.volume = 0.6
        audio.play().catch(err => console.log('Audio play error:', err))
      },
      warrior_attack: () => {
        const audio = new Audio('/src/SoundEffects/guerreiros.wav')
        audio.volume = 0.8
        audio.play().catch(err => console.log('Audio play error:', err))
      },
      archer_attack: () => {
        const audio = new Audio('/src/SoundEffects/arqueiros.wav')
        audio.volume = 0.8
        audio.play().catch(err => console.log('Audio play error:', err))
      },
      cleric_attack: () => {
        const audio = new Audio('/src/SoundEffects/clerigos.wav')
        audio.volume = 0.8
        audio.play().catch(err => console.log('Audio play error:', err))
      },
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
      // Som de ESPADA normal - curto e seco
      sword_normal: () => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        filter.type = 'bandpass'
        filter.frequency.value = 1000

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12)

        gain.gain.setValueAtTime(0.6, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.12)
      },
      // Som de ESPADA crítico - mais intenso com brilho adicional
      sword_critical: () => {
        // Base strike
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        const filter1 = ctx.createBiquadFilter()

        filter1.type = 'bandpass'
        filter1.frequency.value = 1000

        osc1.connect(filter1)
        filter1.connect(gain1)
        gain1.connect(ctx.destination)

        osc1.type = 'sawtooth'
        osc1.frequency.setValueAtTime(400, ctx.currentTime)
        osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2)

        gain1.gain.setValueAtTime(0.7, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.2)

        // Critical shimmer
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = 'sine'
        osc2.frequency.value = 1500
        gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.1)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc2.start(ctx.currentTime + 0.1)
        osc2.stop(ctx.currentTime + 0.4)
      },
      // Som de FLECHA - whizz lançamento + impacto
      arrow: () => {
        // Launch whizz
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()

        osc1.connect(gain1)
        gain1.connect(ctx.destination)

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(2000, ctx.currentTime)
        osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)

        gain1.gain.setValueAtTime(0.5, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.15)

        // Impact
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = 'square'
        osc2.frequency.value = 120
        gain2.gain.setValueAtTime(0.6, ctx.currentTime + 0.15)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc2.start(ctx.currentTime + 0.15)
        osc2.stop(ctx.currentTime + 0.3)
      },
      impact: () => {
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
      // Cura sutil - curta e suave
      heal_small: () => {
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.type = 'sine'
        osc1.frequency.value = 800
        gain1.gain.setValueAtTime(0.4, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.25)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.type = 'triangle'
        osc2.frequency.value = 600
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.05)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc2.start(ctx.currentTime + 0.05)
        osc2.stop(ctx.currentTime + 0.3)
      },
      // Cura grandiosa - envolvente com mais harpas
      heal_large: () => {
        const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.5)
          osc.start(ctx.currentTime + i * 0.08)
          osc.stop(ctx.currentTime + i * 0.08 + 0.5)
        })
      },
      damage: () => {
        const noise = ctx.createBufferSource()
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1
        }
        noise.buffer = buffer
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 800
        const gain = ctx.createGain()
        noise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        noise.start(ctx.currentTime)
      },
      victory: () => {
        const notes = [523, 659, 784, 1047]
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.2, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
          osc.start(ctx.currentTime + i * 0.1)
          osc.stop(ctx.currentTime + i * 0.1 + 0.4)
        })
      }
    }

    if (sounds[type]) {
      const soundFunc = sounds[type]
      soundFunc()
    }
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

    // Play heal sound for battlecry heals
    if (card.effects?.some(e => e.effect === 'HEAL_TARGET' && e.type === 'BATTLECRY')) {
      playSound('cleric_attack')  // plays clerigos.wav for healing
    }
  }

  const endTurn = () => {
    if (turn !== 1) return
    dispatch({ type: 'END_TURN' })
  }

  const onPlayerFieldCardClick = (card) => {
    if (turn !== 1) return

    // If currently targeting for hero power, apply hero power with target
    if (targeting.active && targeting.playerUsing === 'player1') {
      dispatch({
        type: 'APPLY_HERO_POWER_WITH_TARGET',
        payload: {
          playerKey: 'player1',
          power: targeting.power,
          targetCardId: card.id,
          targetIsHero: false
        }
      })
      return
    }

    // If currently targeting for cleric healing, select target to heal
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
          ? document.querySelector(`[data-hero="player1"]`)
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

    // Toca som apropriado baseado no tipo do carta
    switch (attacker.type.name.toLowerCase()) {
      case 'guerreiro':
        playSound('warrior_attack')
        break
      case 'arqueiro':
        playSound('archer_attack')
        break
      case 'clérigo':
        playSound('cleric_attack')
        break
      default:
        playSound('sword_normal')
        break
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
      // Enhanced melee attack anticipation with 2.5 collision physics
      const originalTransform = attackerEl.style.transform
      const originalScale = attackerEl.style.scale || 1

      // Phase 1: Anticipation - lean back with enhanced glow
      attackerEl.style.transform = originalTransform + ' translateY(-20px) rotateX(-10deg) scale(1.05)'
      attackerEl.style.boxShadow = '0 15px 40px rgba(245,192,107,0.6), inset 0 0 20px rgba(255,255,0,0.3)'
      attackerEl.style.filter = 'brightness(1.2) saturate(1.3)'

      setTimeout(() => {
        // Phase 2: Lunge - move forward with collision prediction, constrained within board boundaries
        const targetRect = targetEl.getBoundingClientRect()
        const attackerRect = attackerEl.getBoundingClientRect()

        // Get board container boundaries to constrain movement
        const boardContainer = document.querySelector('.board-container')
        const boardRect = boardContainer ? boardContainer.getBoundingClientRect() : {
          left: 50, right: window.innerWidth - 50,
          top: 50, bottom: window.innerHeight - 50
        }

        // Calculate desired movement
        let deltaX = (targetRect.left - attackerRect.left) * 0.8
        let deltaY = (targetRect.top - attackerRect.top) * 0.8

        // Clamp movement to stay within board boundaries
        const newCardLeft = attackerRect.left + deltaX
        const newCardRight = newCardLeft + attackerRect.width
        const newCardTop = attackerRect.top + deltaY
        const newCardBottom = newCardTop + attackerRect.height

        // Constrain horizontal movement
        const leftBoundary = boardRect.left + 20
        const rightBoundary = boardRect.right - 20
        if (newCardLeft < leftBoundary) {
          deltaX = leftBoundary - attackerRect.left
        } else if (newCardRight > rightBoundary) {
          deltaX = rightBoundary - attackerRect.width - attackerRect.left
        }

        // Constrain vertical movement to avoid card disappearing off screen
        const topBoundary = boardRect.top + 20
        const bottomBoundary = boardRect.bottom - 20
        if (newCardTop < topBoundary) {
          deltaY = topBoundary - attackerRect.top
        } else if (newCardBottom > bottomBoundary) {
          deltaY = bottomBoundary - attackerRect.height - attackerRect.top
        }

        attackerEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.95) rotateX(20deg)`
        attackerEl.style.boxShadow = '0 10px 30px rgba(245,192,107,0.7), 0 0 40px rgba(255,200,0,0.5)'

        // Add battle cry particle effect
        const battleCry = document.createElement('div')
        battleCry.className = 'battle-cry-particle'
        battleCry.style.left = `${attackerRect.left + attackerRect.width / 2}px`
        battleCry.style.top = `${attackerRect.top + attackerRect.height / 2}px`
        document.body.appendChild(battleCry)

        setTimeout(() => {
          if (battleCry.parentNode) battleCry.parentNode.removeChild(battleCry)
        }, 200)

        setTimeout(() => {
          // Phase 3: Final impact with enhanced after-effects
          attackerEl.style.transform = originalTransform
          attackerEl.style.boxShadow = ''
          attackerEl.style.filter = ''
          dispatch({
            type: 'INITIATE_ANIMATION',
            payload: animationPayload
          })
          dispatch({ type: 'SELECT_ATTACKER', payload: { cardId: null } })
        }, 500)
      }, 400)
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

    // For healing powers, don't allow targeting enemy heroes
    if (power.effect === 'heal_target' && isHero && targetHeroKey !== playerUsing) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    // For non-healing powers, don't allow targeting own cards
    if (power.effect !== 'heal_target' && !isHero && target && isCardOwner(target.id, playerUsing)) {
      dispatch({ type: 'CANCEL_TARGETING' })
      return
    }

    // For healing powers, don't allow targeting enemy cards
    if (power.effect === 'heal_target' && !isHero && target && !isCardOwner(target.id, playerUsing)) {
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
      heroPowerEffect: power.effect,
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
            image={HERO_IMAGES.PLAYER2}
            onClick={() => onTargetClick(null, true, 'player2')}
            isTargetable={isPlayer2HeroTargetable()}
          />
          <HeroPowerBadge
            powers={player2.heroPowers}
            onClick={(powerId) => dispatch({ type: "HERO_POWER_CLICK", payload: {player: "player2", powerId}})}
            disabledProps={{ disabled: false, mana: 0, hasUsedHeroPower: player2.hasUsedHeroPower }}
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
            image={HERO_IMAGES.PLAYER1}
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
          End Turn
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

      <AnimationLayer animation={animation} onComplete={(cb, anim) => {
        try {
          // Play appropriate sound based on animation type
          if (anim?.damage < 0 || anim?.projectile === 'healglow') {
            playSound('cleric_attack')  // plays clerigos.wav for healing
          } else {
            playSound('impact')  // regular impact sound for attacks
          }
          dispatch({ type: 'END_ANIMATION' })
          if (cb) dispatch(cb)
        } catch (err) {
          console.error('Error handling animation callback', err, cb, anim)
          try { dispatch({ type: 'END_ANIMATION' }) } catch (e) { console.error(e) }
        }
      }} />

      {gameOver && <GameOverModal winner={winner} onRestart={() => dispatch({type: 'RESTART_GAME'})} />}
    </div>

    <InstructionsPanel />
  </div>
  )
}
