import React, { useContext } from 'react'
import { GameProvider } from '../context/GameContext'
import Board from '../components/Board'
import DeckSetup from '../components/DeckSetup'
import HeroPowerSetup from '../components/HeroPowerSetup'
import GameContext from '../context/GameContext'
import ErrorBoundary from '../components/ErrorBoundary'
import GlobalErrorCatcher from '../components/GlobalErrorCatcher'

function InnerApp() {
  const { state, dispatch } = useContext(GameContext)

  if (state.gamePhase === 'SETUP') {
    return (
      <DeckSetup
        onStart={() =>
          dispatch({ type: 'GO_TO_HERO_POWER_OPTIONS' })
        }
      />
    )
  }

  if (state.gamePhase === 'HERO_POWER_OPTIONS') {
    return (
      <HeroPowerSetup
        onStart={() =>
          dispatch({ type: 'START_GAME' })
        }
      />
    )
  }

  return <Board />
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
