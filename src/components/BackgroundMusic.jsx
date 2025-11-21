import React, { useEffect, useRef, useState } from 'react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const playBackgroundMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => console.log('Audio play error:', err))
    }
  }

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause()
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
    if (audioRef.current) {
      // Tentativa de tocar a música automaticamente
      audioRef.current.volume = 0.15
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.log('Auto-play failed, user interaction required:', err)
        setIsPlaying(false)
      })
    }
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        src="/src/SoundEffects/background.mp3"
        loop={true}
        preload="auto"
      />
      <button
        className="music-toggle"
        onClick={toggleMusic}
        title={isPlaying ? 'Desligar música' : 'Ligar música'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </>
  )
}
