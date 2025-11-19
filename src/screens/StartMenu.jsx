import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import '../styles/styles.css';

const StartMenu = () => {
  const { dispatch } = useContext(GameContext);

  const handleStartClick = () => {
    dispatch({ type: 'GO_TO_PASSIVE_SKILLS' });
  };

  return (
    <div className="start-menu-container">
      <div className="start-menu">
        <h1 className="start-menu-title">Card Game</h1>
        <button className="start-menu-button" onClick={handleStartClick}>
          Start
        </button>
      </div>
    </div>
  );
};

export default StartMenu;
