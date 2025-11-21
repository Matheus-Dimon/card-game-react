import React from 'react'
import { motion } from 'framer-motion'

export default function Hero({
  name = 'Hero',
  hp = 30,
  mana = 0,
  armor = 0,
  image,
  onClick,
  isTargetable = false,
  heroKey = 'player'
}) {

  return (
    <motion.div
      data-hero={heroKey}
      className={`hero ${isTargetable ? 'targetable' : ''}`}
      onClick={onClick}
    >
      <img src={image} alt={name} className="hero-img" />

      <div className="hero-info">
        <div className="hero-name">{name}</div>

        <div className="hero-stats">
          <div className="stat-hp">
            ❤️ <strong>{hp}</strong>
          </div>
          {armor > 0 && (
            <div className="stat-armor">
              🛡️ <strong>{armor}</strong>
            </div>
          )}
        </div>

        <div className="hero-resources" aria-hidden>
          <div className="hero-mana-container">
            <div className="hero-crystal" />
            <div className="hero-mana-counter">{mana}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
