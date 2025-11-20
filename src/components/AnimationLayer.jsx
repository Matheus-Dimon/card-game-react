import React, { useEffect, useRef, useState } from 'react'

export default function AnimationLayer({ animation, onComplete }) {
  const [running, setRunning] = useState(false)
  const elRef = useRef(null)
  const [particles, setParticles] = useState([])
  const [damagePop, setDamagePop] = useState(null)

  useEffect(() => {
    let rafId = null
    let cleanupTimeout = null
    if (!animation || !animation.active) return
    const duration = animation.duration || 500
    const isMelee = animation.isMelee

    if (animation.startRect && animation.endRect) {
      setRunning(true)
      setParticles([])
      setDamagePop(null)

      const s = animation.startRect
      const e = animation.endRect
      const startX = s.left + s.width / 2 + (window.scrollX || 0)
      const startY = s.top + s.height / 2 + (window.scrollY || 0)
      const endX = e.left + e.width / 2 + (window.scrollX || 0)
      const endY = e.top + e.height / 2 + (window.scrollY || 0)

      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2

      const startTime = performance.now()

      const draw = (now) => {
        const t = Math.min(1, (now - startTime) / duration)
        const inv = 1 - t
        const x = inv * inv * startX + 2 * inv * t * midX + t * t * endX
        const y = inv * inv * startY + 2 * inv * t * midY + t * t * endY

        if (elRef.current) {
          const scale = isMelee ? 1 : (1 - 0.15 * t)
          const opacity = isMelee ? 1 : (1 - t)
          elRef.current.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0) scale(${scale})`
          elRef.current.style.opacity = `${opacity}`
        }

        if (t < 1) {
          rafId = requestAnimationFrame(draw)
        } else {
          // For melee, add hit effect to target
          if (isMelee && animation.targetEl) {
            const originalTransform = animation.targetEl.style.transform
            let shakeCount = 0
            const shake = () => {
              animation.targetEl.style.transform = `${originalTransform} translateX(${shakeCount % 2 === 0 ? -5 : 5}px)`
              shakeCount++
              if (shakeCount < 5) {
                setTimeout(shake, 50)
              } else {
                animation.targetEl.style.transform = originalTransform
              }
            }
            shake()
          }

          // spawn particles and damage pop (React-managed)
          const newParticles = Array.from({ length: 6 }).map(() => ({
            id: Math.random().toString(36).slice(2),
            x: endX + (Math.random() - 0.5) * 60,
            y: endY + (Math.random() - 0.5) * 40,
            scale: 0.6 + Math.random() * 0.8,
            ttl: 700 + Math.floor(Math.random() * 300),
          }))
          setParticles(newParticles)
          setDamagePop({ id: 'dmg', x: endX, y: endY, value: animation.damage != null ? animation.damage : '-' })

          cleanupTimeout = setTimeout(() => {
            setParticles([])
            setDamagePop(null)
            setRunning(false)
            onComplete && onComplete(animation.callbackAction)
          }, 900)
        }
      }

      rafId = requestAnimationFrame(draw)
      return () => {
        if (rafId) cancelAnimationFrame(rafId)
        if (cleanupTimeout) clearTimeout(cleanupTimeout)
      }
    }

    // fallback
    setRunning(true)
    const tt = setTimeout(() => {
      setRunning(false)
      onComplete && onComplete(animation.callbackAction)
    }, animation.duration || 400)
    return () => clearTimeout(tt)
  }, [animation, onComplete])

  if (!animation || !animation.active) return null

  // projectile element selection based on animation.projectile
  const projectileEl = (() => {
    if (animation.cardImage) return <img src={animation.cardImage} style={{width: 100, height: 145, objectFit: 'cover'}} alt="" />
    if (animation.element) return animation.element
    const type = animation.projectile || 'stone'
    if (type === 'arrow') return <div className="projectile arrow" />
    if (type === 'spark') return <div className="projectile spark-proj" />
    return <div className="projectile stone-proj" />
  })()

  return (
    <div className={`animation-layer ${running ? 'visible' : ''}`}>
      <div ref={elRef} className="anim-element">{projectileEl}</div>
      {particles.map(p => (
        <div key={p.id} className="spark" style={{ left: p.x, top: p.y, transform: `translate3d(-50%,-50%,0) scale(${p.scale})`, position: 'absolute' }} />
      ))}
      {damagePop && (
        <div className="damage-pop" style={{ left: damagePop.x, top: damagePop.y, position: 'absolute' }}>{damagePop.value}</div>
      )}
    </div>
  )
}
