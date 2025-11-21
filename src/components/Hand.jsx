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
    hidden: {
      x: 200,
      y: 50,
      scale: 0.8,
      opacity: 0,
      rotateY: 45,
      transformOrigin: 'center'
    },
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.8
      }
    },
    exit: {
      x: -300,
      y: -100,
      scale: 0.9,
      opacity: 0,
      rotate: -20,
      rotateY: -30,
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  }

  return (
    <motion.div className="hand" variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {cards.map((c, index) => (
          <motion.div
            key={c.id}
            data-card-id={c.id}
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
