import React, { useState, useEffect } from 'react';
import { NostrProvider } from './context/NostrContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { GameProvider, useGame } from './context/GameContext';
import Login from './components/Login';
import { HallwayView } from './components/Hallway/HallwayView';
import { TableView } from './components/Table/TableView';
import { ProfileModal } from './components/Profile/ProfileModal';

const MainNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('deceit_name'));
  const { roomCode, gameState } = useGame();
  const { isProfileModalOpen, setIsProfileModalOpen } = useProfile();

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505]">
      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col">
        {roomCode && gameState !== 'none' ? <TableView /> : <HallwayView />}
      </div>

      {/* Global Profile Customizer Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <NostrProvider>
      <ProfileProvider>
        <GameProvider>
          <MainNavigator />
        </GameProvider>
      </ProfileProvider>
    </NostrProvider>
  );
}

export default App;
