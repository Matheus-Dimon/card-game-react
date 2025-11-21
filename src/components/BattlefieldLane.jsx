import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'

export default function BattlefieldLane({ cards = [], laneType, playerKey, onCardClick, selectedCardId = null, selectedOwner = null }) {
  const laneVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200 } },
    exit: {
      scale: 1.2,
      opacity: 0,
      y: -30,
      rotate: -15,
      transition: {
        duration: 0.5,
        ease: "easeIn",
        times: [0, 0.3, 1]
      },
      filter: "brightness(2)"
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
            return (
              <motion.div
                key={c.id}
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
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
