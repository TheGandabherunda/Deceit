import React, { useState, useEffect } from 'react';
import { NostrProvider } from './context/NostrContext';
import { GameProvider, useGame } from './context/GameContext';
import Login from './components/Login';
import { HallwayView } from './components/Hallway/HallwayView';
import { TableView } from './components/Table/TableView';

const MainNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('deceit_name'));
  const { roomCode, gameState } = useGame();

  useEffect(() => {
    const handleNameChange = (e) => {
      if (e.detail) {
        setIsLoggedIn(true);
      }
    };
    window.addEventListener('deceit:name-change', handleNameChange);
    return () => window.removeEventListener('deceit:name-change', handleNameChange);
  }, []);

  if (!isLoggedIn) {
    return <Login onComplete={() => setIsLoggedIn(true)} />;
  }

  if (roomCode && gameState !== 'none') {
    return <TableView />;
  }

  return <HallwayView />;
};

function App() {
  return (
    <NostrProvider>
      <GameProvider>
        <MainNavigator />
      </GameProvider>
    </NostrProvider>
  );
}

export default App;
