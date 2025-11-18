import React, { createContext, useReducer } from 'react'
import { makeStartingDeck, shuffle } from '../utils/helpers.js'
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
    heroPowers: [],
    hasUsedHeroPower: false,
  },
  player2: {
    hp: STARTING_HP,
    mana: STARTING_MANA,
    maxMana: STARTING_MANA,
    hand: [],
    field: { melee: [], ranged: [] },
    deck: shuffle(makeStartingDeck(CARD_OPTIONS.P2, STARTING_DECK_SIZE)),
    heroPowers: [],
    hasUsedHeroPower: false,
  },
  turn: 1,
  gamePhase: 'SETUP',
  log: ['Bem-vindo! Configure seu deck.'],
  gameOver: false,
  winner: null,
  selectedCardId: null,
  activeHeroPowerId: null,
  animation: {
    active: false,
    element: null,
    startRect: null,
    endRect: null,
    callbackAction: null
  },
  isAITurnProcessing: false,
}

/* -------------------------------------------------------------------------- */
/*                       FUNÇÕES AUXILIARES SEGURO/IMUTÁVEL                   */
/* -------------------------------------------------------------------------- */

function safeLaneCopy(field = {}) {
  return {
    melee: Array.isArray(field.melee) ? [...field.melee] : [],
    ranged: Array.isArray(field.ranged) ? [...field.ranged] : [],
  }
}

function applyDamageToField(field, targetId, dmg) {
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
  const safeField = safeLaneCopy(field)

  ;['melee', 'ranged'].forEach(lane => {
    const laneList = Array.isArray(safeField[lane]) ? safeField[lane] : []
    safeField[lane] = laneList.map(card =>
      card.id === attackerId ? { ...card, canAttack: false } : card
    )
  })

  return safeField
}

/* -------------------------------------------------------------------------- */
/*                                  REDUCER                                   */
/* -------------------------------------------------------------------------- */

function reducer(state = initialState, action) {
  switch (action.type) {

    /* ------------------------------ INICIAR JOGO ------------------------------ */
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

    /* ------------------------------ JOGAR CARTA ------------------------------ */
    case 'PLAY_CARD': {
      const { cardId, playerKey } = action.payload || {}
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

      return {
        ...state,
        [playerKey]: { ...player, field },
        log: [`${card.name} jogado por ${playerKey}`, ...state.log]
      }
    }

    /* ------------------------------ SELEÇÃO DE ATAQUE ------------------------------ */
    case 'SELECT_ATTACKER': {
      const { cardId } = action.payload || {}
      if (cardId === null) return { ...state, selectedCardId: null }
      return { ...state, selectedCardId: state.selectedCardId === cardId ? null : cardId }
    }

    /* ------------------------------ COMPRA DE CARTA ------------------------------ */
    case 'DRAW_CARD': {
      const { playerKey, count = 1 } = action.payload || {}
      const player = { ...state[playerKey] }

      const drawn = player.deck.slice(0, count).map(c => ({ ...c, id: `${c.id}_${Date.now()}` }))
      player.hand = [...player.hand, ...drawn]
      player.deck = player.deck.slice(count)
      return { ...state, [playerKey]: player }
    }

    /* ------------------------------ FIM DE TURNO ------------------------------ */
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

    /* ------------------------------ APLICAR DANO ------------------------------ */
    case 'APPLY_ATTACK_DAMAGE': {
      const { attackerId, targetId, targetIsHero, damage, playerKey } = action.payload || {}
      const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'

      const attacker = {
        ...state[playerKey],
        field: markAttackerAsUsed(state[playerKey].field, attackerId)
      }

      let newState = { ...state, [playerKey]: attacker }

      /* --------- HERO TARGET --------- */
      if (targetIsHero) {
        const opp = { ...state[opponentKey], field: safeLaneCopy(state[opponentKey].field) }
        opp.hp = Math.max(0, opp.hp - damage)

        newState = {
          ...newState,
          [opponentKey]: opp,
          log: [`${attackerId} causou ${damage} ao herói ${opponentKey}`, ...state.log]
        }

        if (opp.hp <= 0) {
          newState.gameOver = true
          newState.winner = playerKey
        }

        return newState
      }

      /* --------- MINION TARGET --------- */
      const opp = {
        ...state[opponentKey],
        field: applyDamageToField(state[opponentKey].field, targetId, damage)
      }

      return {
        ...newState,
        [opponentKey]: opp,
        log: [`${attackerId} acertou ${targetId} por ${damage}`, ...state.log]
      }
    }

    /* ------------------------------ ANIMAÇÃO ------------------------------ */
    case 'INITIATE_ANIMATION':
      return { ...state, animation: { ...action.payload, active: true } }

    case 'END_ANIMATION':
      return {
        ...state,
        animation: { active: false, element: null, startRect: null, endRect: null, callbackAction: null }
      }

    /* ------------------------------ AI ------------------------------ */
    case 'SET_AI_PROCESSING':
      return { ...state, isAITurnProcessing: !!action.payload }

    /* ------------------------------ LOG ------------------------------ */
    case 'LOG':
      return { ...state, log: [action.payload, ...state.log] }

    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */
/*                                 PROVIDER                                    */
/* -------------------------------------------------------------------------- */

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // AI DOS INIMIGOS
  React.useEffect(() => {
    if (state.turn !== 2 || state.gamePhase !== 'PLAYING' || state.isAITurnProcessing || state.gameOver)
      return

    let cancelled = false
    const delay = ms => new Promise(r => setTimeout(r, ms))

    const runAI = async () => {
      dispatch({ type: 'SET_AI_PROCESSING', payload: true })
      await delay(800)
      if (cancelled) return

      dispatch({ type: 'DRAW_CARD', payload: { playerKey: 'player2', count: 1 } })
      await delay(400)
      if (cancelled) return

      let current = state.player2.mana
      const playable = state.player2.hand.filter(c => c.mana <= current).sort((a, b) => b.mana - a.mana)

      for (const card of playable.slice(0, 2)) {
        dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, playerKey: 'player2' } })
        current -= card.mana
        await delay(600)
        if (cancelled) return
      }

      await delay(300)

      const attackers = [...state.player2.field.melee, ...state.player2.field.ranged]
        .filter(c => c.canAttack !== false)

      for (const a of attackers) {
        const enemies = [...state.player1.field.melee, ...state.player1.field.ranged]
        if (enemies.length > 0) {
          const weakest = enemies.reduce((x, y) => x.defense < y.defense ? x : y)
          dispatch({
            type: 'APPLY_ATTACK_DAMAGE',
            payload: {
              attackerId: a.id,
              targetId: weakest.id,
              targetIsHero: false,
              damage: a.attack || 1,
              playerKey: 'player2'
            }
          })
        } else {
          dispatch({
            type: 'APPLY_ATTACK_DAMAGE',
            payload: {
              attackerId: a.id,
              targetId: null,
              targetIsHero: true,
              damage: a.attack || 1,
              playerKey: 'player2'
            }
          })
        }
        await delay(400)
        if (cancelled) return
      }

      await delay(600)
      if (!cancelled) {
        dispatch({ type: 'END_TURN' })
      }
      dispatch({ type: 'SET_AI_PROCESSING', payload: false })
    }

    runAI()
    return () => { cancelled = true }
  }, [state.turn, state.gamePhase])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export default GameContext
