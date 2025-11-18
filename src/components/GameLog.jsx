import React from 'react'

export default function GameLog({ log = [] }) {
  return (
    <div className="game-log">
      <h4>Log</h4>
      <ul>
        {log.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  )
}
