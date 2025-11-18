export const STARTING_HP = 30
export const STARTING_MANA = 1
export const MAX_MANA = 10

export const CARD_IMAGE_URLS = {
  WARRIOR: 'https://placehold.co/80x110/1f2937/a5b4fc?text=G',
  ARCHER: 'https://placehold.co/80x110/1f2937/fca5a5?text=A',
  CLERIC: 'https://placehold.co/80x110/1f2937/fdba74?text=C',
}

export const UNIT_TYPES = {
  WARRIOR: { name: 'Guerreiro', lane: 'melee', color: 'bg-red-500' },
  ARCHER: { name: 'Arqueiro', lane: 'ranged', color: 'bg-green-500' },
  CLERIC: { name: 'Clérigo', lane: 'ranged', color: 'bg-yellow-500' },
}

export const CARD_OPTIONS = {
  P1: [
    { id: 'p1_001', name: 'A. Curandeiro', type: UNIT_TYPES.CLERIC, mana: 1, attack: 0, defense: 2, healValue: 2, image: CARD_IMAGE_URLS.CLERIC },
    { id: 'p1_002', name: 'R. Elite', type: UNIT_TYPES.WARRIOR, mana: 2, attack: 2, defense: 3, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p1_003', name: 'Arqueiro', type: UNIT_TYPES.ARCHER, mana: 2, attack: 3, defense: 2, image: CARD_IMAGE_URLS.ARCHER },
    { id: 'p1_004', name: 'Cavaleiro', type: UNIT_TYPES.WARRIOR, mana: 3, attack: 3, defense: 4, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p1_005', name: 'E. de Batalha', type: UNIT_TYPES.ARCHER, mana: 4, attack: 4, defense: 3, image: CARD_IMAGE_URLS.ARCHER },
    { id: 'p1_006', name: 'Sacerdote', type: UNIT_TYPES.CLERIC, mana: 5, attack: 0, defense: 6, healValue: 4, image: CARD_IMAGE_URLS.CLERIC },
    { id: 'p1_007', name: 'Tanque', type: UNIT_TYPES.WARRIOR, mana: 6, attack: 5, defense: 8, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p1_008', name: 'Dragão', type: UNIT_TYPES.ARCHER, mana: 8, attack: 8, defense: 8, image: CARD_IMAGE_URLS.ARCHER },
  ],
  P2: [
    { id: 'p2_001', name: 'G. Esqueleto', type: UNIT_TYPES.WARRIOR, mana: 1, attack: 1, defense: 2, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p2_002', name: 'Zumbi', type: UNIT_TYPES.WARRIOR, mana: 2, attack: 2, defense: 3, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p2_003', name: 'Lançador Dardo', type: UNIT_TYPES.ARCHER, mana: 2, attack: 3, defense: 2, image: CARD_IMAGE_URLS.ARCHER },
    { id: 'p2_004', name: 'Necromante', type: UNIT_TYPES.CLERIC, mana: 3, attack: 0, defense: 4, healValue: 3, image: CARD_IMAGE_URLS.CLERIC },
    { id: 'p2_005', name: 'Abominação', type: UNIT_TYPES.WARRIOR, mana: 4, attack: 4, defense: 5, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p2_006', name: 'Devorador', type: UNIT_TYPES.ARCHER, mana: 5, attack: 6, defense: 4, image: CARD_IMAGE_URLS.ARCHER },
    { id: 'p2_007', name: 'Gargula', type: UNIT_TYPES.WARRIOR, mana: 6, attack: 5, defense: 8, image: CARD_IMAGE_URLS.WARRIOR },
    { id: 'p2_008', name: 'Serpente', type: UNIT_TYPES.ARCHER, mana: 8, attack: 8, defense: 8, image: CARD_IMAGE_URLS.ARCHER },
  ],
}

export const HERO_POWER_OPTIONS = [
  { id: 'HP01', name: 'Tiro Arcano', cost: 2, description: '2 de dano', requiresTarget: true, effect: 'DMG_TARGET', value: 2 },
  { id: 'HP02', name: 'Comprar', cost: 3, description: 'Compra 1 carta', requiresTarget: false, effect: 'DRAW_CARD', value: 1 },
]
