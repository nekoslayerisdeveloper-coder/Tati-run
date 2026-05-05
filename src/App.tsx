/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameView from './components/GameView';
import { PlayerCustomization } from './types';

export default function App() {
  const [view, setView] = useState<'setup' | 'game'>('setup');
  const [customization, setCustomization] = useState<PlayerCustomization>({
    photoUrl: null,
    loseSoundUrl: null,
    attackSoundUrl: null,
  });

  const handleStart = (data: PlayerCustomization) => {
    setCustomization(data);
    setView('game');
  };

  const handleExit = () => {
    setView('setup');
  };

  return (
    <div className="w-full h-screen">
      {view === 'setup' ? (
        <SetupScreen onStart={handleStart} />
      ) : (
        <GameView customization={customization} onExit={handleExit} />
      )}
    </div>
  );
}

