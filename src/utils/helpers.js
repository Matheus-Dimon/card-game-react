import { HERO_PASSIVE_OPTIONS, STARTING_HP, STARTING_MANA, CARD_OPTIONS } from './constants.js'

export const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Função NOVA: monta deck na ordem escolhida pelo jogador
export const makeOrderedDeck = (pool, selectedIds) => {
  return selectedIds.map(id => {
    const card = pool.find(c => c.id === id)
    return {...card}
  })
}

export const makeStartingDeck = (pool, size) => {
  const d = []
  let idx = 0
  while (d.length < size) {
    d.push({ ...pool[idx % pool.length] })
    idx++
  }
  return d
}

export const makeStartingHeropower = (pool) => {
  return pool.map(p => ({ ...p }))
}

export const HERO_POWERS_PER_HERO = 2

export function applyHeroPowerEffect(state, playerKey, power) {
  const opponentKey = playerKey === "player1" ? "player2" : "player1"
  const player = state[playerKey]
  const opponent = state[opponentKey]

  switch (power.type) {
    case "damage": {
      return {
        ...state,
        [opponentKey]: {
          ...opponent,
          hp: opponent.hp - power.amount
        },
        [playerKey]: {
          ...player,
          mana: player.mana - power.cost,
          hasUsedHeroPower: true
        }
      }
    }

    case "heal": {
      return {
        ...state,
        [playerKey]: {
          ...player,
          hp: player.hp + power.amount,
          mana: player.mana - power.cost,
          hasUsedHeroPower: true
        }
      }
    }

    case "armor": {
      return {
        ...state,
        [playerKey]: {
          ...player,
          armor: (player.armor ?? 0) + power.amount,
          mana: player.mana - power.cost,
          hasUsedHeroPower: true
        }
      }
    }

    default:
      return state
  }
}

// Aplica efeitos das habilidades passivas
export function applyPassiveEffects(player, passiveSkillIds) {
  const passives = passiveSkillIds.map(id => 
    HERO_PASSIVE_OPTIONS.P1.find(p => p.id === id) || 
    HERO_PASSIVE_OPTIONS.P2.find(p => p.id === id)
  ).filter(Boolean)

  let modifiedPlayer = {...player}

  passives.forEach(passive => {
    const { effect } = passive
    
    switch (effect.stat) {
      case 'startingHP':
        modifiedPlayer.hp = STARTING_HP + effect.value
        break
      
      case 'startingArmor':
        modifiedPlayer.armor = effect.value
        break
      
      case 'maxMana':
        modifiedPlayer.maxMana = STARTING_MANA + effect.value
        modifiedPlayer.mana = modifiedPlayer.maxMana
        break
      
      default:
        break
    }
  })

  return modifiedPlayer
}

export const uid = (prefix = '') =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`