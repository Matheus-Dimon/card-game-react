import React, { createContext, useReducer } from 'react'
import { makeStartingDeck,applyHeroPowerEffect,shuffle } from '../utils/helpers.js'
import { CARD_OPTIONS, STARTING_HP, STARTING_MANA } from '../utils/constants.js'

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
  gamePhase: 'SETUP', // SETUP -> PLAYING -> GAME_OVER
  gameOver: false,
  winner: null,
  selectedCardId: null,
  activeHeroPowerId: null,
  animation: { active: false, element: null, startRect: null, endRect: null, callbackAction: null },
  isAITurnProcessing: false,
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'START_GAME': {
      // draw starting hands
      const p1 = { ...state.player1 }
      const p2 = { ...state.player2 }
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
      const { cardId, playerKey } = action.payload || {}
      const player = { ...state[playerKey] }
      const handIndex = player.hand.findIndex(c => c.id === cardId)
      if (handIndex === -1) return state
      const card = player.hand[handIndex]
      if (player.mana < card.mana) return state
      player.mana -= card.mana
      player.hand = player.hand.filter((c) => c.id !== cardId)
      const lane = card.type.lane
      player.field = { ...player.field, [lane]: [...player.field[lane], { ...card, canAttack: false }] }
      const newState = { ...state, [playerKey]: player, log: [`${card.name} jogado por ${playerKey}`, ...state.log] }
      return newState
    }

    case 'SELECT_ATTACKER': {
      const { cardId } = action.payload || {}
      // If cardId is null, clear selection
      if (cardId === null) return { ...state, selectedCardId: null }
      // toggle selection
      return { ...state, selectedCardId: state.selectedCardId === cardId ? null : cardId }
    }

    case 'DRAW_CARD': {
      const { playerKey, count = 1 } = action.payload || {}
      const player = { ...state[playerKey] }
      const drawn = player.deck.slice(0, count).map(c => ({ ...c, id: `${c.id}_${Date.now()}` }))
      player.hand = [...player.hand, ...drawn]
      player.deck = player.deck.slice(count)
      return { ...state, [playerKey]: player }
    }

    case 'END_TURN': {
      const nextTurn = state.turn === 1 ? 2 : 1
      const currentKey = state.turn === 1 ? 'player1' : 'player2'
      const nextKey = nextTurn === 1 ? 'player1' : 'player2'
      const nextPlayer = { ...state[nextKey] }
      nextPlayer.maxMana = Math.min((nextPlayer.maxMana || 0) + 1, 10)
      nextPlayer.mana = nextPlayer.maxMana
      // ready minions
      nextPlayer.field.melee = nextPlayer.field.melee.map(c => ({ ...c, canAttack: true }))
      nextPlayer.field.ranged = nextPlayer.field.ranged.map(c => ({ ...c, canAttack: true }))
      return { ...state, turn: nextTurn, [nextKey]: nextPlayer }
    }

    case 'APPLY_ATTACK_DAMAGE': {
      const { attackerId, targetId, targetIsHero, damage, playerKey } = action.payload || {}
      const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
      // mark attacker as having attacked (cannot attack again this turn)
      const attackerOwner = playerKey
      const atkOwner = { ...state[attackerOwner] }
      ['melee','ranged'].forEach(l => {
        atkOwner.field[l] = atkOwner.field[l].map(c => c.id === attackerId ? { ...c, canAttack: false } : c)
      })
      let newState = { ...state, [attackerOwner]: atkOwner }
      if (targetIsHero) {
        const opp = { ...state[opponentKey] }
        opp.hp = Math.max(0, opp.hp - damage)
        const log = [`${attackerId} causou ${damage} ao herói ${opponentKey}`, ...state.log]
        newState = { ...newState, [opponentKey]: opp, log }
        if (opp.hp <= 0) newState = { ...newState, gameOver: true, winner: playerKey }
        return newState
      }
      // target is minion
      const opp = { ...state[opponentKey] }
      ['melee','ranged'].forEach(l => {
        opp.field[l] = opp.field[l].map(c => c.id === targetId ? { ...c, defense: c.defense - damage } : c)
      })
      // remove dead
      ['melee','ranged'].forEach(l => {
        opp.field[l] = opp.field[l].filter(c => c.defense > 0)
      })
      return { ...newState, [opponentKey]: opp, log: [`${attackerId} acertou ${targetId} por ${damage}`, ...state.log] }
    }

    case 'INITIATE_ANIMATION': {
      return { ...state, animation: { ...action.payload, active: true } }
    }

    case 'END_ANIMATION': {
      return { ...state, animation: { active: false, element: null, startRect: null, endRect: null, callbackAction: null } }
    }

    case 'SET_AI_PROCESSING': {
      return { ...state, isAITurnProcessing: !!action.payload }
    }

    case 'LOG': {
      return { ...state, log: [action.payload, ...state.log] }
    }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Simple AI runner for player2: plays up to two cards and attacks, then ends turn.
  React.useEffect(() => {
    if (state.turn !== 2 || state.gamePhase !== 'PLAYING' || state.isAITurnProcessing || state.gameOver) return

    let cancelled = false
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    const runAI = async () => {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      await delay(800)
      if (cancelled) return

      // Draw card at start of turn
      dispatch({ type: 'DRAW_CARD', payload: { playerKey: 'player2', count: 1 } })
      await delay(400)
      if (cancelled) return

      // Get current state snapshot for AI logic
      let currentMana = state.player2.mana
      const playable = state.player2.hand.filter(c => c.mana <= currentMana).sort((a,b)=>b.mana-a.mana)
      const toPlay = playable.slice(0,2)
      
      for (const card of toPlay) {
        if (cancelled) break
        dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player2' } })
        currentMana -= card.mana
        await delay(600)
      }

      await delay(500)
      if (cancelled) return

      // Attack phase: each attacker attacks weakest enemy or hero
      const attackers = [...state.player2.field.melee, ...state.player2.field.ranged].filter(c => c.canAttack !== false)
      for (const attacker of attackers) {
        if (cancelled) break
        const enemyField = [...state.player1.field.melee, ...state.player1.field.ranged]
        if (enemyField.length > 0) {
          // target weakest
          const target = enemyField.reduce((a,b)=> (a.defense < b.defense ? a : b))
          dispatch({ type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId: attacker.id, targetId: target.id, targetIsHero: false, damage: attacker.attack || 1, playerKey: 'player2' } })
        } else {
          dispatch({ type: 'APPLY_ATTACK_DAMAGE', payload: { attackerId: attacker.id, targetId: null, targetIsHero: true, damage: attacker.attack || 1, playerKey: 'player2' } })
        }
        await delay(400)
      }

      await delay(600)
      if (!cancelled) {
        dispatch({ type: 'END_TURN' })
        dispatch({ type: 'SET_AI_PROCESSING', payload: false })
      }
    }

    runAI()

    return () => { cancelled = true }
  }, [state.turn, state.gamePhase])

  return (
    <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
  )
}

export default GameContext
