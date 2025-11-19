import React, { createContext, useReducer, useEffect, useRef } from 'react'
import { makeStartingDeck, makeStartingHeropower, shuffle, applyPassiveEffects, makeOrderedDeck } from '../utils/helpers.js'
import { CARD_OPTIONS, HERO_POWER_OPTIONS, STARTING_HP, STARTING_MANA, CARD_EFFECTS } from '../utils/constants.js'

export const GameContext = createContext(null)
const STARTING_DECK_SIZE = 15

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
    passiveSkills: [],
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
    passiveSkills: [],
  },
  turn: 1,
  turnCount: 1,
  gamePhase: 'PASSIVE_SKILLS',
  gameOver: false,
  winner: null,
  selectedCardId: null,
  selectedPassiveSkills: [],
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

function applyDamageToField(field, targetId, dmg, turnCount) {
  if (!targetId) return field
  const safeField = safeLaneCopy(field)
  ;['melee','ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].map(c => {
      if (c.id === targetId) {
        // Verifica imunidade primeira rodada
        if (c.immuneFirstTurn && c.turnPlayed === turnCount) {
          return c // Imune ao dano
        }
        return {...c, defense: c.defense - dmg}
      }
      return c
    })
  })
  ;['melee','ranged'].forEach(lane => {
    safeField[lane] = safeField[lane].filter(c => c.defense > 0)
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
  
  if (newPlayer.armor > 0) {
    const absorbed = Math.min(newPlayer.armor, dmg)
    newPlayer.armor -= absorbed
    dmg -= absorbed
  }
  
  if (dmg > 0) {
    newPlayer.hp = Math.max(0, newPlayer.hp - dmg)
  }
  
  return newPlayer
}

function applyCardEffects(state, card, playerKey) {
  if (!card.effects || card.effects.length === 0) return state
  
  let newState = {...state}
  const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
  
  card.effects.forEach(effect => {
    if (effect.type === 'BATTLECRY' && effect.trigger === 'ON_PLAY') {
      if (effect.effect === 'DAMAGE_ALL_ENEMIES') {
        const opponent = {...newState[opponentKey]}
        opponent.field = safeLaneCopy(opponent.field)
        ;['melee', 'ranged'].forEach(lane => {
          opponent.field[lane] = opponent.field[lane].map(c => ({
            ...c, 
            defense: c.defense - effect.value
          })).filter(c => c.defense > 0)
        })
        newState[opponentKey] = opponent
      } else if (effect.effect === 'HEAL_HERO') {
        const player = {...newState[playerKey]}
        player.hp = player.hp + effect.value // SEM limite!
        newState[playerKey] = player
      } else if (effect.effect === 'HEAL_TARGET' && effect.requiresTarget) {
        // Para clérigos que curam alvos específicos
        // Isso precisa ser tratado com targeting separado
        // Por enquanto, vamos apenas curar o herói
        const player = {...newState[playerKey]}
        player.hp = player.hp + effect.value
        newState[playerKey] = player
      } else if (effect.effect === 'DRAW_CARD') {
        const player = {...newState[playerKey]}
        const drawn = player.deck.slice(0, effect.value).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
        player.hand = [...player.hand, ...drawn]
        player.deck = player.deck.slice(effect.value)
        newState[playerKey] = player
      } else if (effect.effect === 'BUFF_ALL_ALLIES') {
        const player = {...newState[playerKey]}
        player.field = safeLaneCopy(player.field)
        ;['melee', 'ranged'].forEach(lane => {
          player.field[lane] = player.field[lane].map(c => ({
            ...c,
            attack: c.attack + effect.value,
            defense: c.defense + effect.value
          }))
        })
        newState[playerKey] = player
      }
    }
  })
  
  return newState
}

/* ------------------- HERO POWER ------------------- */
function applyHeroPowerEffect(state, playerKey, power, targetCardId = null, targetIsHero = false) {
  const opponentKey = playerKey === 'player1' ? 'player2' : 'player1'
  const player = {...state[playerKey]}
  const opponent = {...state[opponentKey]}

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
        const updatedField = applyDamageToField(opponent.field, targetCardId, dmg, state.turnCount)
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
      player.hp = player.hp + heal // SEM limite!
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

    case 'SET_SELECTED_PASSIVE_SKILLS': {
      return {...state, selectedPassiveSkills: action.payload}
    }

    case 'GO_TO_DECK_SETUP': {
      if (state.selectedPassiveSkills.length !== 3) return state
      return {...state, gamePhase: 'SETUP'}
    }

    case 'SET_SELECTED_DECK_CARDS': {
      return {...state, selectedDeckCards: action.payload}
    }

    case 'SET_SELECTED_HERO_POWERS': {
      return {...state, selectedHeroPowers: action.payload}
    }

    case 'GO_TO_HERO_POWER_OPTIONS': {
      if (state.selectedDeckCards.length < 15) return state
      
      // USA A ORDEM ESCOLHIDA - NÃO embaralha
      const p1Deck = makeOrderedDeck(CARD_OPTIONS.P1, state.selectedDeckCards)
      
      return {
        ...state, 
        gamePhase: 'HERO_POWER_OPTIONS',
        player1: {
          ...state.player1,
          deck: p1Deck
        }
      }
    }

    case 'START_GAME': {
      if (state.selectedHeroPowers.length < 2) return state

      const p1Powers = state.selectedHeroPowers.map(powerId => {
        const power = HERO_POWER_OPTIONS.P1.find(p => p.id === powerId)
        return {...power}
      })

      let p1 = {
        ...state.player1, 
        heroPowers: p1Powers, 
        hand: [], 
        deck: [...state.player1.deck],
        passiveSkills: state.selectedPassiveSkills
      }
      
      let p2 = {...state.player2, hand: [], deck: [...state.player2.deck]}
      
      // Aplica passivas iniciais
      p1 = applyPassiveEffects(p1, state.selectedPassiveSkills)
      
      const draw = (p, n) => {
        const drawn = p.deck.slice(0, n).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
        p.hand = [...p.hand, ...drawn]
        p.deck = p.deck.slice(n)
      }
      
      let startHand = 3
      if (state.selectedPassiveSkills.some(id => id.includes('card_draw'))) {
        startHand = 4
      }
      
      draw(p1, startHand)
      draw(p2, 3)
      
      return {...state, player1: p1, player2: p2, gamePhase: 'PLAYING', turnCount: 1}
    }

    case 'PLAY_CARD': {
      const {cardId, playerKey} = action.payload
      const player = {...state[playerKey]}
      const index = player.hand.findIndex(c => c.id === cardId)
      if (index === -1) return state
      
      let card = {...player.hand[index]}
      
      // Aplica modificador de custo de passiva
      if (player.passiveSkills?.some(id => id.includes('cheaper_minions'))) {
        card.mana = Math.max(1, card.mana - 1)
      }
      
      if (player.mana < card.mana) return state
      
      player.mana -= card.mana
      player.hand = player.hand.filter(c => c.id !== cardId)
      
      // Aplica buffs de passivas
      if (player.passiveSkills?.some(id => id.includes('hp_boost'))) {
        card.defense += 1
      }
      if (player.passiveSkills?.some(id => id.includes('atk_boost'))) {
        card.attack += 1
      }
      if (card.type.lane === 'ranged' && player.passiveSkills?.some(id => id.includes('ranged_damage'))) {
        card.attack += 1
      }
      
      // Verifica efeitos da carta
      let canAttack = false
      let immuneFirstTurn = false
      
      if (card.effects) {
        card.effects.forEach(effect => {
          if (effect.effect === 'CHARGE') canAttack = true
          if (effect.effect === 'IMMUNE_FIRST_TURN') immuneFirstTurn = true
        })
      }
      
      // Passiva de charge para melee
      if (card.type.lane === 'melee' && player.passiveSkills?.some(id => id.includes('charge_melee'))) {
        canAttack = true
      }
      
      const lane = card.type.lane
      const field = safeLaneCopy(player.field)
      
      // IMPORTANTE: Immune não dá charge!
      card.canAttack = canAttack
      card.immuneFirstTurn = immuneFirstTurn
      card.turnPlayed = state.turnCount
      card.currentTurn = state.turnCount
      
      field[lane] = [...field[lane], card]
      
      let newState = {...state, [playerKey]: {...player, field}}
      
      // Aplica efeitos battlecry
      newState = applyCardEffects(newState, card, playerKey)
      
      return newState
    }

    case 'HERO_POWER_CLICK': {
      const {player: playerKey, powerId} = action.payload
      const player = state[playerKey]
      const heroPowers = Array.isArray(player.heroPowers) ? player.heroPowers : []
      const power = powerId ? heroPowers.find(p => p.id === powerId) : heroPowers[0]
      
      if (!power) return state
      
      let cost = power.cost
      // Passiva de custo reduzido
      if (player.passiveSkills?.some(id => id.includes('hero_power_cheap'))) {
        cost = Math.max(0, cost - 1)
      }
      
      if (player.mana < cost || player.hasUsedHeroPower) return state
      
      const modifiedPower = {...power, cost}
      
      if (!power.requiresTarget) {
        return applyHeroPowerEffect(state, playerKey, modifiedPower)
      }
      
      return {
        ...state, 
        targeting: {
          active: true, 
          playerUsing: playerKey, 
          power: modifiedPower
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
      
      // Marca atacante como usado
      let attacker = {...state[playerKey]}
      attacker.field = markAttackerAsUsed(attacker.field, attackerId)
      
      // Pega dados do atacante
      const attackerCard = [...state[playerKey].field.melee, ...state[playerKey].field.ranged]
        .find(c => c.id === attackerId)
      
      let newState = {...state, [playerKey]: attacker}

      if (targetIsHero) {
        const opp = applyDamageToHero(state[opponentKey], damage)
        newState = {...newState, [opponentKey]: {...opp, field: safeLaneCopy(state[opponentKey].field)}}
        
        // Lifesteal
        if (attackerCard?.effects?.some(e => e.effect === 'LIFESTEAL')) {
          const newAttacker = {...newState[playerKey]}
          newAttacker.hp = newAttacker.hp + damage
          newState[playerKey] = newAttacker
        }
        
        if (opp.hp <= 0) {
          return {...newState, gameOver: true, winner: playerKey}
        }
        return newState
      }

      // Ataque a minion
      const targetCard = [...state[opponentKey].field.melee, ...state[opponentKey].field.ranged]
        .find(c => c.id === targetId)
      
      let opp = {...state[opponentKey]}
      opp.field = applyDamageToField(opp.field, targetId, damage, state.turnCount)
      
      // CONTRA-ATAQUE: Se MELEE atacou MELEE, o atacante recebe dano de volta
      if (attackerCard?.type.lane === 'melee' && targetCard?.type.lane === 'melee') {
        const counterDamage = targetCard.attack || 0
        attacker.field = applyDamageToField(attacker.field, attackerId, counterDamage, state.turnCount)
      }
      
      // Lifesteal
      if (attackerCard?.effects?.some(e => e.effect === 'LIFESTEAL')) {
        attacker.hp = attacker.hp + damage
      }
      
      return {...newState, [playerKey]: attacker, [opponentKey]: opp}
    }

    case 'END_TURN': {
      const nextTurn = state.turn === 1 ? 2 : 1
      const nextKey = nextTurn === 1 ? 'player1' : 'player2'
      const newTurnCount = state.turnCount + 1
      const next = {...state[nextKey], field: safeLaneCopy(state[nextKey].field)}
      
      next.maxMana = Math.min((next.maxMana || 0) + 1, 10)
      next.mana = next.maxMana
      next.hasUsedHeroPower = false
      
      // Atualiza turno atual das cartas
      ;['melee', 'ranged'].forEach(lane => {
        next.field[lane] = next.field[lane].map(c => ({
          ...c, 
          canAttack: true,
          currentTurn: newTurnCount
        }))
      })
      
      // Draw automático
      const drawn = next.deck.slice(0, 1).map(c => ({...c, id: `${c.id}_${Date.now()}_${Math.random()}`}))
      next.hand = [...next.hand, ...drawn]
      next.deck = next.deck.slice(1)
      
      return {...state, turn: nextTurn, turnCount: newTurnCount, [nextKey]: next}
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