import React, { useEffect, useRef, useState } from 'react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef(null)
  const intervalRef = useRef(null)
  
  const playBackgroundMusic = () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      
      // Música ambiente medieval dark - acordes menores e misteriosos - VOLUME AUMENTADO
      const notes = [
        { freq: 130.81, time: 0, duration: 2 },    // C3
        { freq: 155.56, time: 2, duration: 2 },    // Eb3
        { freq: 174.61, time: 4, duration: 2 },    // F3
        { freq: 196.00, time: 6, duration: 2 },    // G3
        { freq: 130.81, time: 8, duration: 2 },    // C3
        { freq: 146.83, time: 10, duration: 2 },   // D3
        { freq: 174.61, time: 12, duration: 2 },   // F3
        { freq: 155.56, time: 14, duration: 2 },   // Eb3
      ]
      
      const masterGain = ctx.createGain()
      masterGain.gain.value = 0.15 // Volume aumentado de 0.08 para 0.15
      masterGain.connect(ctx.destination)
      
      const playSequence = () => {
        notes.forEach(note => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const filter = ctx.createBiquadFilter()
          
          filter.type = 'lowpass'
          filter.frequency.value = 800
          
          osc.type = 'sine'
          osc.frequency.value = note.freq
          
          osc.connect(filter)
          filter.connect(gain)
          gain.connect(masterGain)
          
          const startTime = ctx.currentTime + note.time
          gain.gain.setValueAtTime(0, startTime)
          gain.gain.linearRampToValueAtTime(0.4, startTime + 0.1)
          gain.gain.linearRampToValueAtTime(0, startTime + note.duration)
          
          osc.start(startTime)
          osc.stop(startTime + note.duration)
        })
      }
      
      playSequence()
      
      // Loop contínuo
      intervalRef.current = setInterval(() => {
        if (audioContextRef.current?.state === 'running') {
          playSequence()
        }
      }, 16000)
      
      setIsPlaying(true)
    } catch (err) {
      console.log('Audio context error:', err)
    }
  }
  
  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      setIsPlaying(false)
    }
  }
  
  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic()
    } else {
      playBackgroundMusic()
    }
  }
  
  // Inicia música automaticamente ao montar o componente
  useEffect(() => {
    // Pequeno delay para garantir que o contexto de áudio seja criado após interação do usuário
    const timer = setTimeout(() => {
      playBackgroundMusic()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])
  
  return (
    <button 
      className="music-toggle" 
      onClick={toggleMusic}
      title={isPlaying ? 'Desligar música' : 'Ligar música'}
    >
      {isPlaying ? '🔊' : '🔇'}
    </button>
  )
}