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
  // simple: repeat pool until reach size
  let idx = 0
  while (d.length < size) {
    d.push({ ...pool[idx % pool.length] })
    idx++
  }
  return d
}

export const uid = (prefix = '') => `${prefix}${Date.now()}${Math.floor(Math.random()*1000)}`
