import React, { createContext, useReducer, useEffect, useRef } from 'react'
import { makeStartingDeck, makeStartingHeropower, shuffle } from '../utils/helpers.js'
import { CARD_OPTIONS, HERO_POWER_OPTIONS, STARTING_HP, STARTING_MANA } from '../utils/constants.js'

export const GameContext = createContext(null)

const STARTING_DECK_SIZE = 8

const initialState = {
  player1: {
    hp: STARTING_HP,
    mana: STARTING_MANA,
    maxMana: STARTING_MANA,
    hand: [],
    field: { melee: [], ranged: [] },
    deck: shuffle(makeStartingDeck(CARD_OPTIONS.P1, STARTING_DECK_SIZE)),
    heroPowers: makeStartingHeropower(HERO_POWER_OPTIONS.P1),
    hasUsedHeroPower: false,
  },
  player2: {
    hp: STARTING_HP,
    mana: STARTING_MANA,
    maxMana: STARTING_MANA,
    hand: [],
    field: { melee: [], ranged: [] },
    deck: shuffle(makeStartingDeck(CARD_OPTIONS.P2, STARTING_DECK_SIZE)),
    heroPowers: makeStartingHeropower(HERO_POWER_OPTIONS.P2),
    hasUsedHeroPower: false,
  },
  turn: 1,
  gamePhase: 'SETUP',
  gameOver: false,
  winner: null,
  selectedCardId: null,
  activeHeroPowerId: null,
  targeting: null,
  animation: { active: false, element: null, startRect: null, endRect: null, callbackAction: null },
  isAITurnProcessing: false,
}

/* ------------------- AUXILIARES ------------------- */
function safeLaneCopy(field = {}) {
  return {
    melee: Array.isArray(field.melee) ? [...field.melee] : [],
    ranged: Array.isArray(field.ranged) ? [...field.ranged] : [],
  }
}

function applyDamageToField(field, targetId, dmg) {
  if (!targetId) return field
  const safeField = safeLaneCopy(field)
  ;['melee', 'ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].map(c =>
      c.id === targetId ? { ...c, defense: c.defense - dmg } : c
    )
  })
  ;['melee', 'ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].filter(c => c.defense > 0)
  })
  return safeField
}

function markAttackerAsUsed(field, attackerId) {
  if (!attackerId) return field
  const safeField = safeLaneCopy(field)
  ;['melee', 'ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].map(c =>
      c.id === attackerId ? { ...c, canAttack: false } : c
    )
  })
  return safeField
}

/* ------------------- REDUCER ------------------- */
function reducer(state = initialState, action) {
  switch (action.type) {

    case 'GO_TO_HERO_POWER_OPTIONS':
      return { ...state, gamePhase: 'HERO_POWER_OPTIONS' }

    case 'START_GAME': {
      const p1 = { ...state.player1, hand: [], deck: [...state.player1.deck] }
      const p2 = { ...state.player2, hand: [], deck: [...state.player2.deck] }

      const draw = (p, n) => {
        const drawn = p.deck.slice(0, n).map(c => ({ ...c, id: `${c.id}_${Date.now()}` }))
        p.hand = [...p.hand, ...drawn]
        p.deck = p.deck.slice(n)
      }

      draw(p1, 3)
      draw(p2, 3)

      return { ...state, player1: p1, player2: p2, gamePhase: 'PLAYING' }
    }

    case 'PLAY_CARD': {
      const { cardId, playerKey } = action.payload
      const player = { ...state[playerKey] }
      const index = player.hand.findIndex(c => c.id === cardId)
      if (index === -1) return state
      const card = player.hand[index]
      if (player.mana < card.mana) return state

      player.mana -= card.mana
      player.hand = player.hand.filter(c => c.id !== cardId)
      const lane = card.type.lane
      const field = safeLaneCopy(player.field)
      field[lane] = [...field[lane], { ...card, canAttack: false }]

      return { ...state, [playerKey]: { ...player, field } }
    }

    case 'HERO_POWER_CLICK': {
      const { player: playerKey, powerId } = action
      const player = state[playerKey]
      const heroPowers = Array.isArray(player.heroPowers) ? player.heroPowers : []
      const power = heroPowers.find(p => p.id === powerId)
      if (!power) return state
      if (player.mana < power.cost) return state
      if (!power.requiresTarget) return applyHeroPowerEffect(state, playerKey, power)

      return { ...state, targeting: { active: true, playerUsing: playerKey, power } }
    }

    case 'APPLY_HERO_POWER': {
      const { playerKey, power } = action.payload
      const newState = applyHeroPowerEffect(state, playerKey, power)
      return { ...newState, targeting: null }
    }

    case 'SELECT_ATTACKER': {
      const { cardId } = action.payload
      return { ...state, selectedCardId: cardId === state.selectedCardId ? null : cardId }
    }

    case 'APPLY_ATTACK_DAMAGE': {
      const { attackerId, targetId, targetIsHero, damage, playerKey } = action.payload
      const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'

      const attacker = { ...state[playerKey], field: markAttackerAsUsed(state[playerKey].field, attackerId) }
      let newState = { ...state, [playerKey]: attacker }

      if (targetIsHero) {
        const opp = { ...state[opponentKey], field: safeLaneCopy(state[opponentKey].field) }
        opp.hp = Math.max(0, opp.hp - damage)
        newState = { ...newState, [opponentKey]: opp }
        if (opp.hp <= 0) return { ...newState, gameOver: true, winner: playerKey }
        return newState
      }

      const opp = { ...state[opponentKey], field: applyDamageToField(state[opponentKey].field, targetId, damage) }
      return { ...newState, [opponentKey]: opp }
    }

    case 'DRAW_CARD': {
      const { playerKey, count = 1 } = action.payload
      const player = { ...state[playerKey] }
      const drawn = player.deck.slice(0, count).map(c => ({ ...c, id: `${c.id}_${Date.now()}` }))
      player.hand = [...player.hand, ...drawn]
      player.deck = player.deck.slice(count)
      return { ...state, [playerKey]: player }
    }

    case 'END_TURN': {
      const nextTurn = state.turn === 1 ? 2 : 1
      const nextKey = nextTurn === 1 ? 'player1' : 'player2'
      const next = { ...state[nextKey], field: safeLaneCopy(state[nextKey].field) }
      next.maxMana = Math.min((next.maxMana || 0) + 1, 10)
      next.mana = next.maxMana
      next.field.melee = next.field.melee.map(c => ({ ...c, canAttack: true }))
      next.field.ranged = next.field.ranged.map(c => ({ ...c, canAttack: true }))
      return { ...state, turn: nextTurn, [nextKey]: next }
    }

    default:
      return state
  }
}

/* ------------------- HERO POWER EFFECT ------------------- */
function applyHeroPowerEffect(state, playerKey, power) {
  console.log("Executando efeito:", power.name)
  const player = { ...state[playerKey] }
  if (power.type === 'HEAL') player.hp = Math.min(player.hp + (power.value || 2), STARTING_HP)
  if (power.type === 'DAMAGE') {
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
    const opponent = { ...state[opponentKey] }
    opponent.hp = Math.max(opponent.hp - (power.value || 2), 0)
    return { ...state, [playerKey]: player, [opponentKey]: opponent }
  }
  return { ...state, [playerKey]: player }
}

/* ------------------- PROVIDER ------------------- */
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  /* --------- IA SIMPLES --------- */
  useEffect(() => {
    if (state.turn !== 2 || state.gamePhase !== 'PLAYING' || state.isAITurnProcessing || state.gameOver) return
    let cancelled = false
    const delay = ms => new Promise(r => setTimeout(r, ms))

    const runAI = async () => {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      await delay(800)
      if (cancelled) return

      // Draw
      dispatch({ type: 'DRAW_CARD', payload: { playerKey: 'player2', count: 1 } })
      await delay(400)
      if (cancelled) return

      // Play up to 2 cards
      let mana = stateRef.current.player2.mana
      const playable = stateRef.current.player2.hand.filter(c => c.mana <= mana).sort((a,b)=>b.mana-a.mana)
      const toPlay = playable.slice(0,2)
      for (const card of toPlay) {
        if (cancelled) break
        dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player2' } })
        mana -= card.mana
        await delay(500)
      }

      // Attack
      const attackers = [...stateRef.current.player2.field.melee, ...stateRef.current.player2.field.ranged].filter(c => c.canAttack)
      for (const attacker of attackers) {
        if (cancelled) break
        const enemyField = [...stateRef.current.player1.field.melee, ...stateRef.current.player1.field.ranged]
        if (enemyField.length > 0) {
          const target = enemyField.reduce((a,b)=> a.defense < b.defense ? a : b)
          dispatch({ type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId: attacker.id, targetId: target.id, targetIsHero: false, damage: attacker.attack || 1, playerKey: 'player2' } })
        } else {
          dispatch({ type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId: attacker.id, targetId: null, targetIsHero: true, damage: attacker.attack || 1, playerKey: 'player2' } })
        }
        await delay(400)
      }

      await delay(600)
      if (!cancelled) dispatch({ type: 'END_TURN' })
      if (!cancelled) dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }

    runAI()
    return () => { cancelled = true }
  }, [state.turn, state.gamePhase])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export default GameContext
