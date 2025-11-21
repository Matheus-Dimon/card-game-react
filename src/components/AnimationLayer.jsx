import React, { useEffect, useState } from 'react'
import './AnimationLayer.css'

export default function AnimationLayer({ animation, onComplete }) {
  const [animatedElement, setAnimatedElement] = useState(null)

  // Collision particle system
  useEffect(() => {
    const handleCollisionEvent = (event) => {
      const { x, y, type } = event.detail
      if (type === 'repulse') {
        createCollisionEffect(x, y)
      }
    }

    document.addEventListener('cardCollision', handleCollisionEvent)
    return () => document.removeEventListener('cardCollision', handleCollisionEvent)
  }, [])

  const createCollisionEffect = (x, y) => {
    // Create repulsion sparks
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const spark = document.createElement('div')
        spark.className = 'collision-spark'
        spark.style.left = `${x + (Math.random() - 0.5) * 40}px`
        spark.style.top = `${y + (Math.random() - 0.5) * 40}px`

        const angle = Math.random() * Math.PI * 2
        const distance = 20 + Math.random() * 30
        spark.style.setProperty('--target-x', `${Math.cos(angle) * distance}px`)
        spark.style.setProperty('--target-y', `${Math.sin(angle) * distance}px`)

        document.body.appendChild(spark)

        setTimeout(() => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark)
          }
        }, 600)
      }, Math.random() * 100)
    }

    // Small shake effect
    const shakenElements = document.querySelectorAll('.card[data-card-id]')
    shakenElements.forEach(el => {
      el.style.animation = 'card-shake 0.15s ease-out'
      setTimeout(() => el.style.animation = '', 150)
    })
  }

  useEffect(() => {
    if (!animation.active || !animation.startRect || !animation.endRect) {
      setAnimatedElement(null)
      return
    }

    const createParticleEffect = (x, y, count = 8) => {
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div')
        spark.className = 'spark'
        spark.style.left = `${x}px`
        spark.style.top = `${y}px`
        spark.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`)
        spark.style.setProperty('--ty', `${(Math.random() - 0.5) * 100 - 30}px`)

        document.body.appendChild(spark)

        setTimeout(() => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark)
          }
        }, 800)
      }
    }

    const createHealParticleEffect = (x, y) => {
      // Create healing particles - green and glowing
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          const particle = document.createElement('div')
          particle.className = 'heal-particle'
          particle.style.left = `${x + (Math.random() - 0.5) * 60}px`
          particle.style.top = `${y + (Math.random() - 0.5) * 60}px`

          const angle = Math.random() * Math.PI * 2
          const distance = 50 + Math.random() * 100
          particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`)
          particle.style.setProperty('--end-y', `${Math.sin(angle) * distance - 50}px`)

          document.body.appendChild(particle)

          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle)
            }
          }, 1200)
        }, Math.random() * 200)
      }

      // Create healing aura effect
      const aura = document.createElement('div')
      aura.className = 'healing-aura'
      aura.style.left = `${x - 40}px`
      aura.style.top = `${y - 40}px`
      document.body.appendChild(aura)

      setTimeout(() => {
        if (aura.parentNode) {
          aura.parentNode.removeChild(aura)
        }
      }, 1500)
    }

    const createImpactEffect = (x, y) => {
      // Create circular impact burst
      const impact = document.createElement('div')
      impact.className = 'impact-burst'
      impact.style.left = `${x - 25}px`
      impact.style.top = `${y - 25}px`
      document.body.appendChild(impact)

      setTimeout(() => {
        if (impact.parentNode) {
          impact.parentNode.removeChild(impact)
        }
      }, 600)

      // Add screen shake effect to target
      const targetEl = document.elementFromPoint(x, y)
      if (targetEl && targetEl.classList.contains('card')) {
        targetEl.style.animation = 'card-hit 0.3s ease-out'

        setTimeout(() => {
          targetEl.style.animation = ''
        }, 300)
      }
    }

    const createHeroPowerEffect = (x, y, effectType) => {
      const effect = document.createElement('div')
      effect.className = 'hero-power-effect'

      switch(effectType) {
        case 'damage':
          effect.classList.add('fire-effect')
          break
        case 'heal':
        case 'heal_target':
          effect.classList.add('heal-effect')
          break
        case 'draw':
          effect.classList.add('magic-effect')
          break
        case 'armor':
          effect.classList.add('shield-effect')
          break
        default:
          effect.classList.add('default-effect')
      }

      effect.style.left = `${x - 50}px`
      effect.style.top = `${y - 50}px`
      document.body.appendChild(effect)

      setTimeout(() => {
        if (effect.parentNode) {
          effect.parentNode.removeChild(effect)
        }
      }, 1200)
    }

    // Calculate target position (used for projectiles and damage numbers)
    const targetX = animation.endRect.left + animation.endRect.width / 2
    const targetY = animation.endRect.top + animation.endRect.height / 2

    // Create projectile element only if projectile is specified and not 'default' (for ranged/healing, not melee)
    const projectile = (animation.projectile && animation.projectile !== 'default') ? document.createElement('div') : null
    if (projectile) {
      projectile.className = `animation-projectile ${animation.projectile}`
      projectile.style.position = 'absolute'
      projectile.style.left = `${animation.startRect.left + animation.startRect.width / 2}px`
      projectile.style.top = `${animation.startRect.top + animation.startRect.height / 2}px`
      projectile.style.zIndex = '1000'

      // Set CSS custom properties for animation
      projectile.style.setProperty('--target-x', `${targetX - (animation.startRect.left + animation.startRect.width / 2)}px`)
      projectile.style.setProperty('--target-y', `${targetY - (animation.startRect.top + animation.startRect.height / 2)}px`)
      projectile.style.setProperty('--duration', `${animation.duration || 1000}ms`)

      document.body.appendChild(projectile)

      // Start animation
      projectile.style.animation = `projectile-move ${animation.duration || 1000}ms ease-in-out`
    }

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

    // Add enhanced effects at projectile impact
    const impactTimeout = setTimeout(() => {
      // Only create particles for ranged attacks (when projectile is specified)
      if (animation.projectile) {
        createParticleEffect(targetX, targetY)
      }
      createImpactEffect(targetX, targetY)

      // Enhanced effects for healing
      if ((animation.damage || 0) < 0) {
        createHealParticleEffect(targetX, targetY)
      }

      // Enhanced effects for hero powers
      if (animation.heroPowerEffect) {
        createHeroPowerEffect(targetX, targetY, animation.heroPowerEffect)
      }

      if (projectile && projectile.parentNode) {
        projectile.parentNode.removeChild(projectile)
      }

      // Call onComplete with callback action and animation data
      if (onComplete) {
        onComplete(animation.callbackAction, animation)
      }
    }, animation.duration || 1000)

    return () => {
      clearTimeout(impactTimeout)
      if (projectile && projectile.parentNode) {
        projectile.parentNode.removeChild(projectile)
      }
    }
  }, [animation, onComplete])

  return null
}
