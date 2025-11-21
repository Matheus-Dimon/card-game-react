import React from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import CardTooltip from './CardTooltip'

export default function Card({ card, isField = false, onClick, className = '', selected = false, isTargetable = false, playable = false, hasRedBorder = false }) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const cardRef = React.useRef(null)
  const collisionCooldownRef = React.useRef(0)

  // Physics-based positioning for collision avoidance
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const rotation = useMotionValue(0)

  // Smooth physics animation
  const smoothX = useSpring(x, { damping: 25, stiffness: 300 })
  const smoothY = useSpring(y, { damping: 25, stiffness: 300 })
  const smoothScale = useSpring(scale, { dumping: 20, stiffness: 200 })
  const smoothRotation = useSpring(rotation, { dumping: 30, stiffness: 400 })

  const attack = card.attack || card.currentAttack || 0
  const defense = card.defense || 0
  const heal = card.healValue || card.currentHeal || 0
  const sizeClass = isField ? 'card-field' : 'card-hand'

  const getEffectIcons = () => {
    if (!card.effects || card.effects.length === 0) return null
    return card.effects.map((eff, idx) => {
      let icon = ''
      if (eff.effect === 'CHARGE') icon = '⚡'
      if (eff.effect === 'TAUNT') icon = '🛡️'
      if (eff.effect === 'LIFESTEAL') icon = '💉'
      if (eff.effect === 'IMMUNE_FIRST_TURN') icon = '✨'
      if (eff.effect === 'DAMAGE_ALL_ENEMIES') icon = '💥'
      if (eff.effect === 'HEAL_HERO') icon = '💚'
      if (eff.effect === 'DRAW_CARD') icon = '📖'
      if (eff.effect === 'BUFF_ALL_ALLIES') icon = '💪'
      if (eff.effect === 'DAMAGE_RANDOM_ENEMY') icon = '🎲'

      return icon ? (
        <span key={idx} className="effect-icon" title={eff.description}>
          {icon}
        </span>
      ) : null
    })
  }

  // Collision detection and physics simulation
  React.useLayoutEffect(() => {
    if (!isField || !cardRef.current) return

    const checkCollisions = () => {
      const currentRect = cardRef.current.getBoundingClientRect()
      const otherCards = document.querySelectorAll('[data-card-id]:not([data-card-id="' + card.id + '"])')


      otherCards.forEach(otherCardEl => {
        if (!otherCardEl) return
        const otherRect = otherCardEl.getBoundingClientRect()

        // Check for overlap
        const overlapX = Math.max(0, Math.min(currentRect.right, otherRect.right) - Math.max(currentRect.left, otherRect.left))
        const overlapY = Math.max(0, Math.min(currentRect.bottom, otherRect.bottom) - Math.max(currentRect.top, otherRect.top))

        if (overlapX > 20 && overlapY > 20) { // Significant overlap detected
          const centerX1 = currentRect.left + currentRect.width / 2
          const centerY1 = currentRect.top + currentRect.height / 2
          const centerX2 = otherRect.left + otherRect.width / 2
          const centerY2 = otherRect.top + otherRect.height / 2

          const dx = centerX1 - centerX2
          const dy = centerY1 - centerY2
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = currentRect.width * 0.8

          if (distance < minDistance && Date.now() - collisionCooldownRef.current > 300) {
            collisionCooldownRef.current = Date.now()

            // Calculate repulsion force
            const force = Math.min(30, (minDistance - distance) * 0.5)
            const angle = Math.atan2(dy, dx)

            x.set(-(force) * Math.cos(angle))
            y.set(-(force) * Math.sin(angle))
            rotation.set(Math.sin(Date.now() * 0.01) * 5)

            // Visual collision effect
            scale.set(1.1)
            setTimeout(() => {
              scale.set(1)
              rotation.set(0)
            }, 200)

            // Trigger collision particles
            if (cardRef.current) {
              const event = new CustomEvent('cardCollision', {
                detail: {
                  x: centerX1,
                  y: centerY1,
                  type: 'repulse'
                }
              })
              document.dispatchEvent(event)
            }
          }
        }
      })
    }

    const interval = setInterval(checkCollisions, 50) // Check collisions 20 times per second
    return () => clearInterval(interval)
  }, [isField, card.id, x, y, scale, rotation])

  return (
    <motion.div
      ref={cardRef}
      data-card-id={card.id}
      onClick={() => onClick && onClick(card)}
      className={`card ${sizeClass} ${className} ${selected ? 'selected' : ''} ${isTargetable ? 'target-highlight' : ''} ${isField && card.canAttack ? 'unit-attackable' : ''} ${isField && !card.canAttack ? 'unit-unattackable' : ''} ${playable ? 'playable' : 'not-playable'} ${hasRedBorder ? 'card-red-border' : ''}`}
      style={{
        x: smoothX,
        y: smoothY,
        scale: smoothScale,
        rotate: smoothRotation
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      whileHover={{
        scale: 1.08,
        y: isField ? -8 : -8,
        rotateY: -2,
        rotateX: 2,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        y: isField ? -2 : -2,
        rotateY: 0,
        rotateX: -5,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {showTooltip && <CardTooltip card={card} />}
      <div className="card-frame" style={{backgroundImage: card.type.backgroundImage ? `url(${card.type.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <img
          src={card.image}
          alt={card.name}
          onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=300&fit=crop&q=80')}
        />
        <div className="card-mana">{card.mana}</div>
        <div className="card-type">{card.type.name.charAt(0)}</div>

        {!isField && (
          <div className="card-stats-overlay">
            <div className="card-name">{card.name}</div>
            <div className="card-stats-row">
              {heal > 0 ? (
                <div className="stat-item heal-stat">
                  💚 {heal}
                </div>
              ) : (
                <div className="stat-item atk-stat">
                  ⚔️ {attack}
                </div>
              )}
              <div className="stat-item def-stat">
                🛡️ {defense}
              </div>
            </div>
            {card.effects && card.effects.length > 0 && (
              <div className="card-effects-hand">
                {getEffectIcons()}
              </div>
            )}
          </div>
        )}

        {isField && (
          <>
            <div className="card-stats">
              {heal > 0 ? (
                <span className="heal">💚 {heal}</span>
              ) : (
                <span className="atk">⚔️ {attack}</span>
              )}
              <span className="def">🛡️ {defense}</span>
            </div>
            {card.effects && card.effects.length > 0 && (
              <div className="card-effects-field">
                {getEffectIcons()}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
