import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'

export default function BattlefieldLane({ cards = [], laneType, playerKey, onCardClick, selectedCardId = null, selectedOwner = null, turnCount }) {
  const laneVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: {
      scale: 0.6,
      opacity: 0,
      y: 30,
      rotateZ: -10,
      rotateY: 20
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateZ: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.7
      }
    },
    exit: {
      scale: 1.3,
      opacity: 0,
      y: -50,
      rotate: -20,
      rotateY: 30,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      },
      filter: "brightness(1.5) hue-rotate(180deg)"
    }
  }

  return (
    <div className={`lane lane-${laneType}`}>
      <div className="lane-header">{laneType === 'melee' ? 'CORPO A CORPO' : 'LONGA DISTÂNCIA'}</div>
      <motion.div className="lane-cards" variants={laneVariants} initial="hidden" animate="visible">
        <AnimatePresence>
          {cards.map(c => {
            const selected = selectedCardId === c.id
            const isTargetable = selectedCardId && selectedOwner && selectedOwner !== playerKey
            const hasRedBorder = (c.turnPlayed === turnCount && !c.effects?.some(e => e.effect === 'CHARGE')) || !c.canAttack
            return (
              <motion.div
                key={c.id}
                data-card-id={c.id}
                variants={cardVariants}
                layout
                layoutId={c.id}
                exit="exit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1.1 }}
              >
                <Card
                  card={c}
                  isField
                  onClick={() => onCardClick && onCardClick(c)}
                  selected={selected}
                  isTargetable={isTargetable}
                  hasRedBorder={hasRedBorder}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
