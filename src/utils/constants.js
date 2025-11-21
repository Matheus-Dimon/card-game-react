// Import local images
import arqueirosImg from '../images/arqueiros.jpg'
import clerigosImg from '../images/clerigos.jpg'
import guerreirosImg from '../images/guerreiros.jpg'
import heroiP1 from '../images/herói p1.jpg'
import heroiP2 from '../images/herói p2.jpg'

export const STARTING_HP = 30
export const STARTING_MANA = 1
export const STARTING_MANAP2 = 3
export const MAX_MANA = 10

// Imagens locais para as cartas
export const CARD_IMAGE_URLS = {
  WARRIOR: guerreirosImg,
  WARRIOR_2: guerreirosImg,
  WARRIOR_3: guerreirosImg,
  ARCHER: arqueirosImg,
  ARCHER_2: arqueirosImg,
  ARCHER_3: arqueirosImg,
  CLERIC: clerigosImg,
  CLERIC_2: clerigosImg,
  CLERIC_3: clerigosImg,
  // Using additional images for variety
  DARK_WARRIOR: guerreirosImg,
  DARK_MAGE: clerigosImg,
  BEAST: arqueirosImg,
}

export const UNIT_TYPES = {
  WARRIOR: { name: 'Guerreiro', lane: 'melee', color: 'bg-red-500', backgroundImage: guerreirosImg },
  ARCHER: { name: 'Arqueiro', lane: 'ranged', color: 'bg-green-500', backgroundImage: arqueirosImg },
  CLERIC: { name: 'Clérigo', lane: 'ranged', color: 'bg-yellow-500', backgroundImage: clerigosImg },
}

export const HERO_IMAGES = {
  PLAYER1: heroiP1,
  PLAYER2: heroiP2,
}

// Sistema de efeitos para cartas
export const CARD_EFFECTS = {
  BATTLECRY_DAMAGE_ALL: {
    type: 'BATTLECRY',
    trigger: 'ON_PLAY',
    effect: 'DAMAGE_ALL_ENEMIES',
    value: 1,
    description: 'Causa 1 de dano a todos os inimigos',
    icon: '💥'
  },
  BATTLECRY_HEAL_TARGET: {
    type: 'BATTLECRY',
    trigger: 'ON_PLAY',
    effect: 'HEAL_TARGET',
    value: 3,
    description: 'Cura 3 de vida a um alvo',
    icon: '💚',
    requiresTarget: true
  },
  BATTLECRY_DRAW: {
    type: 'BATTLECRY',
    trigger: 'ON_PLAY',
    effect: 'DRAW_CARD',
    value: 1,
    description: 'Compra 1 carta',
    icon: '📖'
  },
  SHIELD_FIRST_TURN: {
    type: 'PASSIVE',
    effect: 'IMMUNE_FIRST_TURN',
    description: 'Imune na 1ª rodada',
    icon: '✨'
  },
  TAUNT: {
    type: 'PASSIVE',
    effect: 'TAUNT',
    description: 'Deve ser atacado primeiro',
    icon: '🛡️'
  },
  CHARGE: {
    type: 'PASSIVE',
    effect: 'CHARGE',
    description: 'Pode atacar imediatamente',
    icon: '⚡'
  },
  LIFESTEAL: {
    type: 'PASSIVE',
    effect: 'LIFESTEAL',
    description: 'Cura o herói ao atacar',
    icon: '💉'
  },
  BATTLECRY_BUFF_ALLIES: {
    type: 'BATTLECRY',
    trigger: 'ON_PLAY',
    effect: 'BUFF_ALL_ALLIES',
    value: 1,
    description: '+1/+1 a todos aliados',
    icon: '💪'
  },
  DEATHRATTLE_DAMAGE: {
    type: 'DEATHRATTLE',
    trigger: 'ON_DEATH',
    effect: 'DAMAGE_TARGET_ENEMY',
    value: 2,
    description: 'Causa 2 de dano a um alvo',
    icon: '🎯',
    requiresTarget: true
  },
}

    // Pool expandido de 30 cartas para seleção
export const CARD_OPTIONS = {
  P1: [
    // Básicas (custo 1-2)
    { id: 'p1_001', name: 'Escudeiro', type: UNIT_TYPES.WARRIOR, mana: 1, attack: 2, defense: 4, image: CARD_IMAGE_URLS.WARRIOR, effects: [CARD_EFFECTS.TAUNT], rarity: 'Common' },
    { id: 'p1_002', name: 'Arqueiro Novato', type: UNIT_TYPES.ARCHER, mana: 1, attack: 3, defense: 2, image: CARD_IMAGE_URLS.ARCHER, effects: [CARD_EFFECTS.BATTLECRY_DAMAGE_ALL], rarity: 'Common' },
    { id: 'p1_003', name: 'Acólito', type: UNIT_TYPES.CLERIC, mana: 1, attack: 0, defense: 3, healValue: 3, image: CARD_IMAGE_URLS.CLERIC, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET], rarity: 'Common' },
    { id: 'p1_004', name: 'Lanceiro', type: UNIT_TYPES.WARRIOR, mana: 2, attack: 4, defense: 3, image: CARD_IMAGE_URLS.WARRIOR_2, effects: [CARD_EFFECTS.CHARGE], rarity: 'Common' },
    { id: 'p1_005', name: 'Besteiro', type: UNIT_TYPES.ARCHER, mana: 2, attack: 4, defense: 3, image: CARD_IMAGE_URLS.ARCHER_2, effects: [CARD_EFFECTS.LIFESTEAL], rarity: 'Common' },

    // Intermediárias (custo 3-4) com efeitos
    { id: 'p1_006', name: 'Cavaleiro', type: UNIT_TYPES.WARRIOR, mana: 3, attack: 4, defense: 5, image: CARD_IMAGE_URLS.WARRIOR_3, effects: [CARD_EFFECTS.CHARGE], rarity: 'Common' },
    { id: 'p1_007', name: 'Guardião', type: UNIT_TYPES.WARRIOR, mana: 3, attack: 3, defense: 6, image: CARD_IMAGE_URLS.WARRIOR, effects: [CARD_EFFECTS.TAUNT], rarity: 'Common' },
    { id: 'p1_008', name: 'Atirador Elite', type: UNIT_TYPES.ARCHER, mana: 3, attack: 5, defense: 3, image: CARD_IMAGE_URLS.ARCHER_3, effects: [CARD_EFFECTS.BATTLECRY_DAMAGE_ALL], rarity: 'Common' },
    { id: 'p1_009', name: 'Curandeiro', type: UNIT_TYPES.CLERIC, mana: 3, attack: 0, defense: 5, healValue: 4, image: CARD_IMAGE_URLS.CLERIC_2, effects: [CARD_EFFECTS.BATTLECRY_DRAW], rarity: 'Common' },
    { id: 'p1_010', name: 'Paladino', type: UNIT_TYPES.WARRIOR, mana: 4, attack: 5, defense: 6, image: CARD_IMAGE_URLS.WARRIOR_2, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN], rarity: 'Common' },
    { id: 'p1_011', name: 'Caçador', type: UNIT_TYPES.ARCHER, mana: 4, attack: 6, defense: 4, image: CARD_IMAGE_URLS.ARCHER, effects: [CARD_EFFECTS.LIFESTEAL], rarity: 'Common' },
    { id: 'p1_012', name: 'Sacerdote', type: UNIT_TYPES.CLERIC, mana: 4, attack: 0, defense: 6, healValue: 5, image: CARD_IMAGE_URLS.CLERIC_3, effects: [CARD_EFFECTS.BATTLECRY_DRAW], rarity: 'Common' },

    // Avançadas (custo 5-6)
    { id: 'p1_013', name: 'Capitão', type: UNIT_TYPES.WARRIOR, mana: 5, attack: 4, defense: 6, image: CARD_IMAGE_URLS.WARRIOR_3, effects: [CARD_EFFECTS.BATTLECRY_BUFF_ALLIES], rarity: 'Rare' },
    { id: 'p1_014', name: 'Mago de Guerra', type: UNIT_TYPES.ARCHER, mana: 5, attack: 6, defense: 4, image: CARD_IMAGE_URLS.ARCHER_2, effects: [CARD_EFFECTS.DEATHRATTLE_DAMAGE], rarity: 'Rare' },
    { id: 'p1_015', name: 'Bispo', type: UNIT_TYPES.CLERIC, mana: 5, attack: 0, defense: 6, healValue: 4, image: CARD_IMAGE_URLS.CLERIC, effects: [CARD_EFFECTS.TAUNT], rarity: 'Rare' },
    { id: 'p1_016', name: 'Campeão', type: UNIT_TYPES.WARRIOR, mana: 6, attack: 6, defense: 6, image: CARD_IMAGE_URLS.WARRIOR, effects: [CARD_EFFECTS.CHARGE], rarity: 'Rare' },
    { id: 'p1_017', name: 'Arquimago', type: UNIT_TYPES.ARCHER, mana: 6, attack: 7, defense: 5, image: CARD_IMAGE_URLS.ARCHER_3, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN], rarity: 'Rare' },
    { id: 'p1_018', name: 'Sumo Sacerdote', type: UNIT_TYPES.CLERIC, mana: 6, attack: 0, defense: 7, healValue: 5, image: CARD_IMAGE_URLS.CLERIC_2, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET], rarity: 'Rare' },

    // Épicas (custo 7-8)
    { id: 'p1_019', name: 'General', type: UNIT_TYPES.WARRIOR, mana: 7, attack: 7, defense: 7, image: CARD_IMAGE_URLS.WARRIOR_2, effects: [CARD_EFFECTS.TAUNT, CARD_EFFECTS.BATTLECRY_BUFF_ALLIES], rarity: 'Epic' },
    { id: 'p1_020', name: 'Invocador', type: UNIT_TYPES.ARCHER, mana: 7, attack: 6, defense: 6, image: CARD_IMAGE_URLS.ARCHER, effects: [CARD_EFFECTS.BATTLECRY_DRAW], rarity: 'Epic' },
    { id: 'p1_021', name: 'Arquiclérigo', type: UNIT_TYPES.CLERIC, mana: 7, attack: 0, defense: 8, healValue: 6, image: CARD_IMAGE_URLS.CLERIC_3, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN], rarity: 'Epic' },
    { id: 'p1_022', name: 'Comandante', type: UNIT_TYPES.WARRIOR, mana: 8, attack: 8, defense: 7, image: CARD_IMAGE_URLS.WARRIOR_3, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.LIFESTEAL], rarity: 'Epic' },
    { id: 'p1_023', name: 'Dragão', type: UNIT_TYPES.ARCHER, mana: 8, attack: 9, defense: 8, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.BATTLECRY_DAMAGE_ALL], rarity: 'Epic' },

    // Lendárias (custo 9-10)
    { id: 'p1_024', name: 'Titã Dourado', type: UNIT_TYPES.WARRIOR, mana: 9, attack: 9, defense: 9, image: CARD_IMAGE_URLS.WARRIOR, effects: [CARD_EFFECTS.TAUNT, CARD_EFFECTS.SHIELD_FIRST_TURN], rarity: 'Legendary' },
    { id: 'p1_025', name: 'Fênix', type: UNIT_TYPES.ARCHER, mana: 9, attack: 10, defense: 7, image: CARD_IMAGE_URLS.ARCHER_3, effects: [CARD_EFFECTS.DEATHRATTLE_DAMAGE, CARD_EFFECTS.LIFESTEAL], rarity: 'Legendary' },
    { id: 'p1_026', name: 'Anjo Guardião', type: UNIT_TYPES.CLERIC, mana: 9, attack: 0, defense: 10, healValue: 8, image: CARD_IMAGE_URLS.CLERIC, effects: [CARD_EFFECTS.TAUNT], rarity: 'Legendary' },
    { id: 'p1_027', name: 'Rei Lendário', type: UNIT_TYPES.WARRIOR, mana: 10, attack: 10, defense: 10, image: CARD_IMAGE_URLS.WARRIOR_2, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.TAUNT, CARD_EFFECTS.BATTLECRY_BUFF_ALLIES], rarity: 'Legendary' },
    { id: 'p1_028', name: 'Arqueiro Divino', type: UNIT_TYPES.ARCHER, mana: 10, attack: 12, defense: 8, image: CARD_IMAGE_URLS.ARCHER_2, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.BATTLECRY_DAMAGE_ALL], rarity: 'Legendary' },
    { id: 'p1_029', name: 'Oráculo', type: UNIT_TYPES.CLERIC, mana: 8, attack: 0, defense: 8, healValue: 7, image: CARD_IMAGE_URLS.CLERIC_3, effects: [CARD_EFFECTS.BATTLECRY_DRAW], rarity: 'Epic' },
    { id: 'p1_030', name: 'Berserker', type: UNIT_TYPES.WARRIOR, mana: 5, attack: 7, defense: 3, image: CARD_IMAGE_URLS.WARRIOR_3, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.DEATHRATTLE_DAMAGE], rarity: 'Rare' },
  ],
  P2: [
    // Mesmo esquema para o P2, mas com tema dark/evil
    { id: 'p2_001', name: 'Esqueleto', type: UNIT_TYPES.WARRIOR, mana: 1, attack: 1, defense: 2, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.TAUNT] },
    { id: 'p2_002', name: 'Lançador Dardo', type: UNIT_TYPES.ARCHER, mana: 1, attack: 2, defense: 1, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_DAMAGE_ALL] },
    { id: 'p2_003', name: 'Vampiro', type: UNIT_TYPES.CLERIC, mana: 1, attack: 0, defense: 2, healValue: 2, image: CARD_IMAGE_URLS.CLERIC, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_004', name: 'Zumbi', type: UNIT_TYPES.WARRIOR, mana: 2, attack: 2, defense: 3, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE] },
    { id: 'p2_005', name: 'Aranha Gigante', type: UNIT_TYPES.ARCHER, mana: 2, attack: 3, defense: 2, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.LIFESTEAL] },
    { id: 'p2_006', name: 'Orc Guerreiro', type: UNIT_TYPES.WARRIOR, mana: 3, attack: 3, defense: 4, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE] },
    { id: 'p2_007', name: 'Golem', type: UNIT_TYPES.WARRIOR, mana: 3, attack: 2, defense: 5, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.TAUNT] },
    { id: 'p2_008', name: 'Necromante', type: UNIT_TYPES.CLERIC, mana: 3, attack: 0, defense: 4, healValue: 3, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_009', name: 'Lich', type: UNIT_TYPES.CLERIC, mana: 4, attack: 0, defense: 5, healValue: 4, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_010', name: 'Cavaleiro das Trevas', type: UNIT_TYPES.WARRIOR, mana: 4, attack: 4, defense: 5, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN] },
    { id: 'p2_011', name: 'Feiticeiro', type: UNIT_TYPES.ARCHER, mana: 4, attack: 5, defense: 3, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.LIFESTEAL] },
    { id: 'p2_012', name: 'Bruxo', type: UNIT_TYPES.CLERIC, mana: 4, attack: 0, defense: 5, healValue: 4, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_DRAW] },
    { id: 'p2_013', name: 'Senhor Orc', type: UNIT_TYPES.WARRIOR, mana: 5, attack: 4, defense: 6, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.BATTLECRY_BUFF_ALLIES] },
    { id: 'p2_014', name: 'Devorador', type: UNIT_TYPES.ARCHER, mana: 5, attack: 6, defense: 4, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.DEATHRATTLE_DAMAGE] },
    { id: 'p2_015', name: 'Sumo Bruxo', type: UNIT_TYPES.CLERIC, mana: 5, attack: 0, defense: 6, healValue: 4, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.TAUNT] },
    { id: 'p2_016', name: 'Abominação', type: UNIT_TYPES.WARRIOR, mana: 6, attack: 6, defense: 6, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE] },
    { id: 'p2_017', name: 'Demônio', type: UNIT_TYPES.ARCHER, mana: 6, attack: 7, defense: 5, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN] },
    { id: 'p2_018', name: 'Arqui-Lich', type: UNIT_TYPES.CLERIC, mana: 6, attack: 0, defense: 7, healValue: 5, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_019', name: 'General Morto-Vivo', type: UNIT_TYPES.WARRIOR, mana: 7, attack: 7, defense: 7, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.TAUNT, CARD_EFFECTS.BATTLECRY_BUFF_ALLIES] },
    { id: 'p2_020', name: 'Invocador Sombrio', type: UNIT_TYPES.ARCHER, mana: 7, attack: 6, defense: 6, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_DRAW] },
    { id: 'p2_021', name: 'Gárgula', type: UNIT_TYPES.WARRIOR, mana: 7, attack: 6, defense: 8, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.SHIELD_FIRST_TURN] },
    { id: 'p2_022', name: 'Lorde das Sombras', type: UNIT_TYPES.WARRIOR, mana: 8, attack: 8, defense: 7, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.LIFESTEAL] },
    { id: 'p2_023', name: 'Dragão Negro', type: UNIT_TYPES.ARCHER, mana: 8, attack: 9, defense: 8, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.BATTLECRY_DAMAGE_ALL] },
    { id: 'p2_024', name: 'Titã das Trevas', type: UNIT_TYPES.WARRIOR, mana: 9, attack: 9, defense: 9, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.TAUNT, CARD_EFFECTS.SHIELD_FIRST_TURN] },
    { id: 'p2_025', name: 'Hidra', type: UNIT_TYPES.ARCHER, mana: 9, attack: 10, defense: 7, image: CARD_IMAGE_URLS.BEAST, effects: [CARD_EFFECTS.DEATHRATTLE_DAMAGE, CARD_EFFECTS.LIFESTEAL] },
    { id: 'p2_026', name: 'Anjo Caído', type: UNIT_TYPES.CLERIC, mana: 9, attack: 0, defense: 10, healValue: 8, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.TAUNT, CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_027', name: 'Rei Lich', type: UNIT_TYPES.WARRIOR, mana: 10, attack: 10, defense: 10, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.TAUNT, CARD_EFFECTS.BATTLECRY_BUFF_ALLIES] },
    { id: 'p2_028', name: 'Arqueiro das Trevas', type: UNIT_TYPES.ARCHER, mana: 10, attack: 12, defense: 8, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.BATTLECRY_DAMAGE_ALL] },
    { id: 'p2_029', name: 'Oráculo Sombrio', type: UNIT_TYPES.CLERIC, mana: 8, attack: 0, defense: 8, healValue: 7, image: CARD_IMAGE_URLS.DARK_MAGE, effects: [CARD_EFFECTS.BATTLECRY_DRAW, CARD_EFFECTS.BATTLECRY_HEAL_TARGET] },
    { id: 'p2_030', name: 'Destruidor', type: UNIT_TYPES.WARRIOR, mana: 5, attack: 7, defense: 3, image: CARD_IMAGE_URLS.DARK_WARRIOR, effects: [CARD_EFFECTS.CHARGE, CARD_EFFECTS.DEATHRATTLE_DAMAGE] },
  ],
}

export const HERO_POWER_OPTIONS = {
  P1: [
    {
      id: "p1_fireblast",
      name: "Fireblast",
      cost: 1,
      requiresTarget: true,
      effect: "damage",
      amount: 5,
      icon: "🔥",
      description: "Causa 5 de dano a um alvo"
    },
    {
      id: "p1_divine_healing",
      name: "Cura Divina",
      cost: 1,
      requiresTarget: true,
      effect: "heal_target",
      amount: 5,
      icon: "✨",
      description: "Cura 5 de vida a qualquer alvo (herói ou unidade)"
    },
    {
      id: "p1_armor",
      name: "Fortificar",
      cost: 0,
      requiresTarget: false,
      effect: "armor",
      amount: 4,
      icon: "🛡️",
      description: "Ganha 3 de armadura"
    },
    {
      id: "p1_draw",
      name: "Concentração",
      cost: 2,
      requiresTarget: false,
      effect: "draw",
      amount: 2,
      icon: "📖",
      description: "Compra 2 cartas"
    },
    {
      id: "p1_charge",
      name: "Ímpeto",
      cost: 0,
      requiresTarget: false,
      effect: "charge_melee",
      amount: 1,
      icon: "⚡",
      description: "Suas unidades corpo a corpo ganham Charge neste turno"
    },
    {
      id: "p1_damage_all",
      name: "Tempestade",
      cost: 1,
      requiresTarget: false,
      effect: "damage_all_enemies",
      amount: 2,
      icon: "⚡",
      description: "Causa 3 de dano a todas unidades inimigas"
    },
    {
      id: "p1_mana_boost",
      name: "Cristal Arcano",
      cost: 0,
      requiresTarget: false,
      effect: "mana_boost",
      amount: 1,
      icon: "💎",
      description: "Ganha 2 de mana temporária neste turno"
    },
    {
      id: "p1_resurrect",
      name: "Ressurreição",
      cost: 1,
      requiresTarget: false,
      effect: "draw_from_graveyard",
      amount: 1,
      icon: "🔄",
      description: "Retorna uma unidade aleatória morta para sua mão"
    },
  ],

  P2: [
    {
      id: "p2_fireblast",
      name: "Fireblast",
      cost: 1,
      requiresTarget: true,
      effect: "damage",
      amount: 5,
      icon: "🔥",
      description: "Causa 5 de dano a um alvo"
    },
    {
      id: "p2_divine_healing",
      name: "Cura Divina",
      cost: 1,
      requiresTarget: true,
      effect: "heal_target",
      amount: 5,
      icon: "✨",
      description: "Cura 5 de vida a qualquer alvo (herói ou unidade)"
    },
    {
      id: "p2_armor",
      name: "Fortificar",
      cost: 0,
      requiresTarget: false,
      effect: "armor",
      amount: 4,
      icon: "🛡️",
      description: "Ganha 4 de armadura"
    },
    {
      id: "p2_draw",
      name: "Concentração",
      cost: 2,
      requiresTarget: false,
      effect: "draw",
      amount: 2,
      icon: "📖",
      description: "Compra 2 cartas"
    },
    {
      id: "p2_charge",
      name: "Ímpeto",
      cost: 0,
      requiresTarget: false,
      effect: "charge_melee",
      amount: 1,
      icon: "⚡",
      description: "Suas unidades corpo a corpo ganham Charge neste turno"
    },
    {
      id: "p2_damage_all",
      name: "Tempestade",
      cost: 1,
      requiresTarget: false,
      effect: "damage_all_enemies",
      amount: 2,
      icon: "⚡",
      description: "Causa 3 de dano a todas unidades inimigas"
    },
    {
      id: "p2_mana_boost",
      name: "Cristal Arcano",
      cost: 0,
      requiresTarget: false,
      effect: "mana_boost",
      amount: 1,
      icon: "💎",
      description: "Ganha 1 de mana temporária neste turno"
    },
    {
      id: "p2_resurrect",
      name: "Ressurreição",
      cost: 1,
      requiresTarget: false,
      effect: "draw_from_graveyard",
      amount: 1,
      icon: "🔄",
      description: "Retorna uma unidade aleatória morta para sua mão"
    },
  ]
}

// Habilidades Passivas do Herói
export const HERO_PASSIVE_OPTIONS = {
  P1: [
    {
      id: "passive_hp_boost",
      name: "Vigor Inabalável",
      icon: "❤️",
      description: "Suas unidades têm +3 de vida",
      effect: { stat: 'defense', value: 3 }
    },
    {
      id: "passive_atk_boost",
      name: "Fúria de Batalha",
      icon: "⚔️",
      description: "Suas unidades têm +3 de ataque",
      effect: { stat: 'attack', value: 3 }
    },
    {
      id: "passive_mana_regen",
      name: "Maestria Arcana",
      icon: "💎",
      description: "Comece com +1 de mana máxima",
      effect: { stat: 'maxMana', value: 1 }
    },
    {
      id: "passive_card_draw",
      name: "Sabedoria Antiga",
      icon: "📚",
      description: "Compre 3 carta extra no início",
      effect: { stat: 'startingHand', value: 3}
    },
    {
      id: "passive_armor_start",
      name: "Armadura Celestial",
      icon: "🛡️",
      description: "Comece com 15 de armadura",
      effect: { stat: 'startingArmor', value: 15 }
    },
    {
      id: "passive_hp_hero",
      name: "Vitalidade Suprema",
      icon: "💪",
      description: "Comece com +15 de vida",
      effect: { stat: 'startingHP', value: 15 }
    },
    {
      id: "passive_cheaper_minions",
      name: "Eficiência Tática",
      icon: "💰",
      description: "Suas unidades custam -1 (mín. 1)",
      effect: { stat: 'manaCost', value: -1 }
    },
    {
      id: "passive_charge_melee",
      name: "Ímpeto Guerreiro",
      icon: "⚡",
      description: "Suas unidades melee têm Charge",
      effect: { stat: 'meleeCharge', value: true }
    },
    {
      id: "passive_ranged_damage",
      name: "Precisão Letal",
      icon: "🎯",
      description: "Suas unidades ranged têm +4 ataque",
      effect: { stat: 'rangedAttack', value: 4 }
    },
    {
      id: "passive_hero_power_cheap",
      name: "Poder Divino",
      icon: "✨",
      description: "Seus poderes custam -1 (mín. 0)",
      effect: { stat: 'heroPowerCost', value: -1 }
    },
  ],
  P2: [
    {
      id: "passive_hp_boost_p2",
      name: "Vigor das Trevas",
      icon: "💀",
      description: "Suas unidades têm +3 de vida",
      effect: { stat: 'defense', value: 3 }
    },
    {
      id: "passive_atk_boost_p2",
      name: "Fúria Sombria",
      icon: "⚔️",
      description: "Suas unidades têm +3 de ataque",
      effect: { stat: 'attack', value: 3 }
    },
    {
      id: "passive_mana_regen_p2",
      name: "Magia Negra",
      icon: "🌑",
      description: "Comece com +1 de mana máxima",
      effect: { stat: 'maxMana', value: 1 }
    },
    {
      id: "passive_card_draw_p2",
      name: "Conhecimento Profano",
      icon: "📖",
      description: "Compre 3 carta extra no início",
      effect: { stat: 'startingHand', value: 3 }
    },
    {
      id: "passive_armor_start_p2",
      name: "Escudo das Sombras",
      icon: "🛡️",
      description: "Comece com 15 de armadura",
      effect: { stat: 'startingArmor', value: 15 }
    },
    {
      id: "passive_hp_hero_p2",
      name: "Resistência Morta-Viva",
      icon: "💀",
      description: "Comece com +15 de vida",
      effect: { stat: 'startingHP', value: 15 }
    },
    {
      id: "passive_cheaper_minions_p2",
      name: "Pacto Sombrio",
      icon: "💰",
      description: "Suas unidades custam -1 (mín. 1)",
      effect: { stat: 'manaCost', value: -1 }
    },
    {
      id: "passive_charge_melee_p2",
      name: "Ímpeto Profano",
      icon: "⚡",
      description: "Suas unidades melee têm Charge",
      effect: { stat: 'meleeCharge', value: true }
    },
    {
      id: "passive_ranged_damage_p2",
      name: "Maldição Letal",
      icon: "🎯",
      description: "Suas unidades ranged têm +4 ataque",
      effect: { stat: 'rangedAttack', value: 4 }
    },
    {
      id: "passive_hero_power_cheap_p2",
      name: "Poder das Trevas",
      icon: "☠️",
      description: "Seus poderes custam -1 (mín. 0)",
      effect: { stat: 'heroPowerCost', value: -1 }
    },
  ]
}
