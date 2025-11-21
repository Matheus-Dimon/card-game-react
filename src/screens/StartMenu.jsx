import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import BackgroundMusic from '../components/BackgroundMusic';
import '../styles/styles.css';

const StartMenu = () => {
  const { dispatch } = useContext(GameContext);

  const handleStartClick = () => {
    dispatch({ type: 'GO_TO_PASSIVE_SKILLS' });
  };

  return (
    <div className="start-menu-container">
      <BackgroundMusic />
      <div className="start-menu">
        <button className="start-menu-button" onClick={handleStartClick}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartMenu;
