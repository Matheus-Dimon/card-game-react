import React, { useContext } from 'react'
import { GameProvider, GameContext } from '../context/GameContext'
import DeckSetup from '../components/DeckSetup'
import HeroPowerSetup from '../components/HeroPowerSetup'
import PassiveSkillsSetup from '../components/PassiveSkillsSetup'
import ErrorBoundary from '../components/ErrorBoundary'
import GlobalErrorCatcher from '../components/GlobalErrorCatcher'
import BackgroundMusic from '../components/BackgroundMusic'
import StartMenu from './StartMenu'
import Board from '../components/Board'
function InnerApp() {
  const { state, dispatch } = useContext(GameContext)

  if (state.gamePhase === 'START_MENU') {
    return (
      <>
        <StartMenu />
        <BackgroundMusic />
      </>
    )
  }

  if (state.gamePhase === 'PASSIVE_SKILLS') {
    return (
      <>
        <PassiveSkillsSetup />
        <BackgroundMusic />
      </>
    )
  }

  if (state.gamePhase === 'SETUP') {
    return (
      <>
        <DeckSetup />
        <BackgroundMusic />
      </>
    )
  }

  if (state.gamePhase === 'HERO_POWER_OPTIONS') {
    return (
      <>
        <HeroPowerSetup />
        <BackgroundMusic />
      </>
    )
  }

  return (
    <>
      <Board />
      <BackgroundMusic />
    </>
  )
}

export default function AppScreen() {
  return (
    <GameProvider>
      <ErrorBoundary>
        <InnerApp />
        <GlobalErrorCatcher />
      </ErrorBoundary>
    </GameProvider>
  )
}
