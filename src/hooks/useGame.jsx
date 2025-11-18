import { useContext } from 'react'
import GameContext from '../context/GameContext'

export default function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  const { state, dispatch } = ctx

  const playCard = (cardId, playerKey = 'player1') => dispatch({ type: 'PLAY_CARD', payload: { cardId, playerKey } })
  const endTurn = () => dispatch({ type: 'END_TURN' })
  const drawCard = (playerKey = 'player1', count = 1) => dispatch({ type: 'DRAW_CARD', payload: { playerKey, count } })

  return { state, dispatch, playCard, endTurn, drawCard }
}
