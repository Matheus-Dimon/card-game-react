import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'

export default function Hand({ cards = [], onPlayCard, playerMana }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: -200, opacity: 0, rotate: -45, transition: { duration: 0.3 } }
  }

  return (
    <motion.div className="hand" variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {cards.map((c, index) => (
          <motion.div
            key={c.id}
            variants={cardVariants}
            layout
            layoutId={c.id}
            exit="exit"
            initial="hidden"
            animate="visible"
            whileHover={{ y: -10 }}
          >
            <Card
              card={c}
              onClick={() => onPlayCard && onPlayCard(c)}
              playable={playerMana >= c.mana}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
