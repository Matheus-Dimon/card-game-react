import React, { createContext, useReducer } from 'react'
import { makeStartingDeck, makeStartingHeropower, shuffle, HERO_POWERS_PER_HERO } from '../utils/helpers.js'
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

  animation: {
    active: false,
    element: null,
    startRect: null,
    endRect: null,
    callbackAction: null
  },

  isAITurnProcessing: false,
}

/* ---------------------- FUNÇÕES AUXILIARES ---------------------- */

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

/* --------------------------- REDUCER --------------------------- */
function reducer(state = initialState, action) {
  switch (action.type) {

    case 'GO_TO_HERO_POWER_OPTIONS': {
      return {
        ...state,
        gamePhase: 'HERO_POWER_OPTIONS'
      }
    }

    case 'START_GAME': {
      const p1 = { ...state.player1, hand: [], deck: [...state.player1.deck], heroPowers: [...state.player1.heroPowers] }
      const p2 = { ...state.player2, hand: [], deck: [...state.player2.deck], heroPowers: [...state.player2.heroPowers] }

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
      }
    }

    case 'HERO_POWER': {
      const { powerId, playerKey } = action.payload || {}
      const player = { ...state[playerKey] }

      const power = player.heroPowers.find(p => p.id === powerId)
      if (!power) return state
      if (player.mana < power.cost) return state
      if (player.hasUsedHeroPower) return state

      // comportamento do poder entra depois
      return state
    }

    /* --------------------------------------
       HERO POWER CLICK — TOTALMENTE CORRIGIDO
       -------------------------------------- */
       case "HERO_POWER_CLICK": {
  const { player: playerKey, powerId } = action
  const player = state[playerKey]

  // Garante que heroPowers existe e é array
  const heroPowers = Array.isArray(player.heroPowers) ? player.heroPowers : []

  const power = heroPowers.find(p => p.id === powerId)

  if (!power) {
    console.warn("Poder não encontrado!", { powerId, heroPowers })
    return state
  }

  if (player.mana < power.cost) {
    console.warn("Mana insuficiente!")
    return state
  }

  // Se NÃO precisa de alvo → executa direto
  if (!power.requiresTarget) {
    return applyHeroPowerEffect(state, playerKey, power)
  }

  // Se PRECISA alvo → ativa targeting mode
  return {
    ...state,
    targeting: {
      active: true,
      playerUsing: playerKey,
      power
    },
    gameLog: [
      ...(state.gameLog ?? []),
      `${playerKey} está selecionando um alvo para ${power.name}`
    ]
  }
}
  }
}
    

/* --------------------------- PROVIDER --------------------------- */

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export default GameContext
