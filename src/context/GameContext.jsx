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
    armor: 0,
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
    armor: 0,
  },
  turn: 1,
  gamePhase: 'SETUP',
  gameOver: false,
  winner: null,
  selectedCardId: null,
  selectedDeckCards: [],
  selectedHeroPowers: [],
  targeting: { active: false, playerUsing: null, power: null },
  animation: { active: false, element: null, startRect: null, endRect: null, callbackAction: null },
  isAITurnProcessing: false,
}

/* ------------------- AUXILIARES ------------------- */
function safeLaneCopy(field = {}) {
  return { 
    melee: Array.isArray(field.melee) ? [...field.melee] : [], 
    ranged: Array.isArray(field.ranged) ? [...field.ranged] : [] 
  }
}

function applyDamageToField(field, targetId, dmg) {
  if (!targetId) return field
  const safeField = safeLaneCopy(field)
  ;['melee','ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].map(c => c.id===targetId ? {...c, defense: c.defense - dmg} : c)
  })
  ;['melee','ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].filter(c => c.defense>0)
  })
  return safeField
}

function markAttackerAsUsed(field, attackerId) {
  if (!attackerId) return field
  const safeField = safeLaneCopy(field)
  ;['melee','ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].map(c=> c.id===attackerId ? {...c, canAttack:false} : c)
  })
  return safeField
}

function applyDamageToHero(player, damage) {
  let dmg = damage
  const newPlayer = {...player}
  
  // Armor absorve primeiro
  if (newPlayer.armor > 0) {
    const absorbed = Math.min(newPlayer.armor, dmg)
    newPlayer.armor -= absorbed
    dmg -= absorbed
  }
  
  // Resto vai pro HP
  if (dmg > 0) {
    newPlayer.hp = Math.max(0, newPlayer.hp - dmg)
  }
  
  return newPlayer
}

/* ------------------- HERO POWER ------------------- */
function applyHeroPowerEffect(state, playerKey, power, targetCardId = null, targetIsHero = false) {
  const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
  const player = {...state[playerKey]}
  const opponent = {...state[opponentKey]}

  // Validações
  if (player.mana < power.cost) return state
  if (player.hasUsedHeroPower) return state

  player.mana -= power.cost
  player.hasUsedHeroPower = true

  switch (power.effect) {
    case 'damage': {
      const dmg = power.amount || 1
      if (targetIsHero) {
        const updatedOpponent = applyDamageToHero(opponent, dmg)
        return {
          ...state,
          [playerKey]: player,
          [opponentKey]: updatedOpponent,
          gameOver: updatedOpponent.hp <= 0,
          winner: updatedOpponent.hp <= 0 ? playerKey : null
        }
      } else if (targetCardId) {
        const updatedField = applyDamageToField(opponent.field, targetCardId, dmg)
        return {
          ...state,
          [playerKey]: player,
          [opponentKey]: {...opponent, field: updatedField}
        }
      }
      return state
    }

    case 'heal': {
      const heal = power.amount || 2
      player.hp = Math.min(player.hp + heal, STARTING_HP)
      return {...state, [playerKey]: player}
    }

    case 'armor': {
      const armor = power.amount || 2
      player.armor = (player.armor || 0) + armor
      return {...state, [playerKey]: player}
    }

    case 'draw': {
      const count = power.amount || 1
      const drawn = player.deck.slice(0, count).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
      player.hand = [...player.hand, ...drawn]
      player.deck = player.deck.slice(count)
      return {...state, [playerKey]: player}
    }

    default:
      return state
  }
}

/* ------------------- REDUCER ------------------- */
function reducer(state=initialState, action){
  switch(action.type){

    case 'SET_SELECTED_DECK_CARDS': {
      return {...state, selectedDeckCards: action.payload}
    }

    case 'SET_SELECTED_HERO_POWERS': {
      return {...state, selectedHeroPowers: action.payload}
    }

    case 'GO_TO_HERO_POWER_OPTIONS': {
      // Valida deck mínimo
      if (state.selectedDeckCards.length < 8) return state
      
      // Cria deck do player1 com as cartas selecionadas
      const p1Deck = state.selectedDeckCards.map(cardId => {
        const card = CARD_OPTIONS.P1.find(c => c.id === cardId)
        return {...card}
      })
      
      return {
        ...state, 
        gamePhase: 'HERO_POWER_OPTIONS',
        player1: {
          ...state.player1,
          deck: shuffle(p1Deck)
        }
      }
    }

    case 'START_GAME': {
      // Valida hero powers mínimos
      if (state.selectedHeroPowers.length < 2) return state

      // Configura hero powers do player1
      const p1Powers = state.selectedHeroPowers.map(powerId => {
        const power = HERO_POWER_OPTIONS.P1.find(p => p.id === powerId)
        return {...power}
      })

      const p1 = {...state.player1, heroPowers: p1Powers, hand: [], deck: [...state.player1.deck]}
      const p2 = {...state.player2, hand: [], deck: [...state.player2.deck]}
      
      const draw = (p, n) => {
        const drawn = p.deck.slice(0, n).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
        p.hand = [...p.hand, ...drawn]
        p.deck = p.deck.slice(n)
      }
      
      draw(p1, 3)
      draw(p2, 3)
      
      return {...state, player1: p1, player2: p2, gamePhase: 'PLAYING'}
    }

    case 'PLAY_CARD': {
      const {cardId, playerKey} = action.payload
      const player = {...state[playerKey]}
      const index = player.hand.findIndex(c => c.id === cardId)
      if (index === -1) return state
      
      const card = player.hand[index]
      if (player.mana < card.mana) return state
      
      player.mana -= card.mana
      player.hand = player.hand.filter(c => c.id !== cardId)
      
      const lane = card.type.lane
      const field = safeLaneCopy(player.field)
      field[lane] = [...field[lane], {...card, canAttack: false}]
      
      return {...state, [playerKey]: {...player, field}}
    }

    case 'HERO_POWER_CLICK': {
      const {player: playerKey, powerId} = action.payload
      const player = state[playerKey]
      const heroPowers = Array.isArray(player.heroPowers) ? player.heroPowers : []
      const power = powerId ? heroPowers.find(p => p.id === powerId) : heroPowers[0]
      
      if (!power) return state
      if (player.mana < power.cost || player.hasUsedHeroPower) return state
      
      // Se não precisa target, aplica direto
      if (!power.requiresTarget) {
        return applyHeroPowerEffect(state, playerKey, power)
      }
      
      // Se precisa target, ativa modo targeting
      return {
        ...state, 
        targeting: {
          active: true, 
          playerUsing: playerKey, 
          power
        }
      }
    }

    case 'APPLY_HERO_POWER_WITH_TARGET': {
      const {playerKey, power, targetCardId, targetIsHero} = action.payload
      const newState = applyHeroPowerEffect(state, playerKey, power, targetCardId, targetIsHero)
      return {...newState, targeting: {active: false, playerUsing: null, power: null}}
    }

    case 'CANCEL_TARGETING': {
      return {...state, targeting: {active: false, playerUsing: null, power: null}}
    }

    case 'DRAW_CARD': {
      const {playerKey, count=1} = action.payload
      const player = {...state[playerKey]}
      const drawn = player.deck.slice(0, count).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
      player.hand = [...player.hand, ...drawn]
      player.deck = player.deck.slice(count)
      return {...state, [playerKey]: player}
    }

    case 'SELECT_ATTACKER': {
      const {cardId} = action.payload
      return {...state, selectedCardId: cardId === state.selectedCardId ? null : cardId}
    }

    case 'INITIATE_ANIMATION': {
      return {...state, animation: {...action.payload, active: true}}
    }

    case 'END_ANIMATION': {
      return {...state, animation: {active: false, element: null, startRect: null, endRect: null, callbackAction: null}}
    }

    case 'APPLY_ATTACK_DAMAGE': {
      const {attackerId, targetId, targetIsHero, damage, playerKey} = action.payload
      const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
      
      const attacker = {...state[playerKey], field: markAttackerAsUsed(state[playerKey].field, attackerId)}
      let newState = {...state, [playerKey]: attacker}

      if (targetIsHero) {
        const opp = applyDamageToHero(state[opponentKey], damage)
        newState = {...newState, [opponentKey]: {...opp, field: safeLaneCopy(state[opponentKey].field)}}
        
        if (opp.hp <= 0) {
          return {...newState, gameOver: true, winner: playerKey}
        }
        return newState
      }

      const opp = {...state[opponentKey], field: applyDamageToField(state[opponentKey].field, targetId, damage)}
      return {...newState, [opponentKey]: opp}
    }

    case 'END_TURN': {
      const nextTurn = state.turn === 1 ? 2 : 1
      const nextKey = nextTurn === 1 ? 'player1' : 'player2'
      const next = {...state[nextKey], field: safeLaneCopy(state[nextKey].field)}
      
      next.maxMana = Math.min((next.maxMana || 0) + 1, 10)
      next.mana = next.maxMana
      next.hasUsedHeroPower = false
      next.field.melee = next.field.melee.map(c => ({...c, canAttack: true}))
      next.field.ranged = next.field.ranged.map(c => ({...c, canAttack: true}))
      
      // Draw automático no início do turno
      const drawn = next.deck.slice(0, 1).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
      next.hand = [...next.hand, ...drawn]
      next.deck = next.deck.slice(1)
      
      return {...state, turn: nextTurn, [nextKey]: next}
    }

    case 'RESTART_GAME': {
      return {
        ...initialState,
        player1: {
          ...initialState.player1,
          deck: shuffle(makeStartingDeck(CARD_OPTIONS.P1, STARTING_DECK_SIZE))
        },
        player2: {
          ...initialState.player2,
          deck: shuffle(makeStartingDeck(CARD_OPTIONS.P2, STARTING_DECK_SIZE))
        }
      }
    }

    case 'SET_AI_PROCESSING': {
      return {...state, isAITurnProcessing: !!action.payload}
    }

    default: 
      return state
  }
}

/* ------------------- PROVIDER COM IA ------------------- */
export function GameProvider({children}){
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (state.turn !== 2 || state.gamePhase !== 'PLAYING' || state.isAITurnProcessing || state.gameOver) return
    
    let cancelled = false
    const delay = ms => new Promise(r => setTimeout(r, ms))

    const runAI = async () => {
      dispatch({type: 'SET_AI_PROCESSING', payload: true})
      await delay(800)
      if (cancelled) return

      // AI sempre compra 1 carta (já acontece no END_TURN do player1)
      
      let mana = stateRef.current.player2.mana
      const playable = stateRef.current.player2.hand.filter(c => c.mana <= mana).sort((a,b) => b.mana - a.mana)
      const toPlay = playable.slice(0, 2)
      
      for (const card of toPlay) {
        if (cancelled) break
        dispatch({type: 'PLAY_CARD', payload: {cardId: card.id, playerKey: 'player2'}})
        mana -= card.mana
        await delay(500)
      }

      const attackers = [...stateRef.current.player2.field.melee, ...stateRef.current.player2.field.ranged].filter(c => c.canAttack)
      
      for (const attacker of attackers) {
        if (cancelled) break
        const enemyField = [...stateRef.current.player1.field.melee, ...stateRef.current.player1.field.ranged]
        
        if (enemyField.length > 0) {
          const target = enemyField.reduce((a,b) => a.defense < b.defense ? a : b)
          dispatch({type: 'INITIATE_ANIMATION', payload: {attackerId: attacker.id, targetId: target.id, targetIsHero: false, damage: attacker.attack || 1, playerKey: 'player2', projectile: 'stone', duration: 700, callbackAction: {type: 'APPLY_ATTACK_DAMAGE', payload: {attackerId: attacker.id, targetId: target.id, targetIsHero: false, damage: attacker.attack || 1, playerKey: 'player2'}}}})
        } else {
          dispatch({type: 'INITIATE_ANIMATION', payload: {attackerId: attacker.id, targetId: null, targetIsHero: true, damage: attacker.attack || 1, playerKey: 'player2', projectile: 'stone', duration: 700, callbackAction: {type: 'APPLY_ATTACK_DAMAGE', payload: {attackerId: attacker.id, targetId: null, targetIsHero: true, damage: attacker.attack || 1, playerKey: 'player2'}}}})
        }
        await delay(800)
      }

      if (!cancelled) {
        dispatch({type: 'END_TURN'})
        dispatch({type: 'SET_AI_PROCESSING', payload: false})
      }
    }

    runAI()
    return () => {cancelled = true}
  }, [state.turn, state.gamePhase])

  return <GameContext.Provider value={{state, dispatch}}>{children}</GameContext.Provider>
}

export default GameContext