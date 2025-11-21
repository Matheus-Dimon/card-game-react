import React, { useEffect, useState } from 'react'
import './AnimationLayer.css'

export default function AnimationLayer({ animation, onComplete }) {
  const [animatedElement, setAnimatedElement] = useState(null)

  useEffect(() => {
    if (!animation.active || !animation.startRect || !animation.endRect) {
      setAnimatedElement(null)
      return
    }

    // Create projectile element
    const projectile = document.createElement('div')
    projectile.className = `animation-projectile ${animation.projectile || 'default'}`
    projectile.style.position = 'absolute'
    projectile.style.left = `${animation.startRect.left + animation.startRect.width / 2}px`
    projectile.style.top = `${animation.startRect.top + animation.startRect.height / 2}px`
    projectile.style.zIndex = '1000'

    // Calculate target position
    const targetX = animation.endRect.left + animation.endRect.width / 2
    const targetY = animation.endRect.top + animation.endRect.height / 2

    // Set CSS custom properties for animation
    projectile.style.setProperty('--target-x', `${targetX - (animation.startRect.left + animation.startRect.width / 2)}px`)
    projectile.style.setProperty('--target-y', `${targetY - (animation.startRect.top + animation.startRect.height / 2)}px`)
    projectile.style.setProperty('--duration', `${animation.duration || 1000}ms`)

    document.body.appendChild(projectile)

    // Start animation
    projectile.style.animation = `projectile-move ${animation.duration || 1000}ms ease-in-out`

    // Show damage/heal number
    if (animation.damage !== undefined && animation.damage !== null) {
      const damageEl = document.createElement('div')
      damageEl.className = animation.damage > 0 ? 'animation-damage' : 'animation-heal'
      damageEl.textContent = Math.abs(animation.damage)
      damageEl.style.position = 'absolute'
      damageEl.style.left = `${targetX}px`
      damageEl.style.top = `${targetY}px`
      damageEl.style.zIndex = '1001'

      document.body.appendChild(damageEl)

      // Animate damage number
      setTimeout(() => {
        damageEl.style.transform = 'translateY(-50px)'
        damageEl.style.opacity = '0'
      }, 100)

      // Remove damage element after animation
      setTimeout(() => {
        if (damageEl.parentNode) {
          damageEl.parentNode.removeChild(damageEl)
        }
      }, 800)
    }

    // Remove projectile after animation
    const timeout = setTimeout(() => {
      if (projectile.parentNode) {
        projectile.parentNode.removeChild(projectile)
      }
      // Call onComplete with callback action
      if (onComplete && animation.callbackAction) {
        onComplete(animation.callbackAction)
      }
    }, animation.duration || 1000)

    return () => {
      clearTimeout(timeout)
      if (projectile.parentNode) {
        projectile.parentNode.removeChild(projectile)
      }
    }
  }, [animation, onComplete])

  return null
}
