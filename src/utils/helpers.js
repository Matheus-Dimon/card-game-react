export const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
  // retorna poderes fixos, clonados corretamente
  return pool.map(p => ({ ...p }))
}

// quantidade de hero powers por herói (fixo para todos)
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

export const uid = (prefix = '') =>
  `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
