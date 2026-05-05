import React, { useState, useRef } from 'react';
import { Camera, Music, Upload, Play, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { PlayerCustomization } from '../types';

interface SetupScreenProps {
  onStart: (customization: PlayerCustomization) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [customization, setCustomization] = useState<PlayerCustomization>({
    photoUrl: null,
    loseSoundUrl: null,
    attackSoundUrl: null,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const loseSoundInputRef = useRef<HTMLInputElement>(null);
  const attackSoundInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof PlayerCustomization) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomization(prev => ({ ...prev, [key]: url }));
    }
  };

  const isReady = customization.photoUrl !== null;

  return (
    <div className="min-h-screen bg-brand-yellow flex flex-col items-center justify-center p-2 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-brand-yellow flex flex-col select-none"
      >
        {/* Header Section */}
        <div className="flex justify-between items-end mb-2 sm:mb-8 border-b-4 sm:border-b-8 border-black pb-2 sm:pb-4">
          <div className="flex flex-col">
            <motion.h1 
              animate={{ rotate: [-0.5, 0.5, -0.5] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-4xl sm:text-8xl font-black text-black leading-none italic tracking-tighter"
              style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
              TATI RUN
            </motion.h1>
            <p className="text-[10px] sm:text-xl font-bold bg-black text-brand-yellow px-2 w-fit uppercase mt-1 sm:mt-2">
              The Endless saga
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-sm font-black uppercase mb-1 tracking-widest text-black">Version 2.4.1</div>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-black"></div>
              <div className="w-4 h-4 rounded-full bg-black opacity-20"></div>
              <div className="w-4 h-4 rounded-full bg-black opacity-20"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8">
          {/* Left Column: Character Engine */}
          <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">
            <div className="bg-white border-4 border-black shadow-brutal p-3 sm:p-6 flex flex-col items-center justify-center relative min-h-[220px] sm:min-h-[350px]">
              <div className="absolute -top-3 left-4 bg-brand-green border-2 border-black px-2 py-0.5 font-black text-[10px] uppercase text-black">
                Character
              </div>
              
              <div 
                onClick={() => photoInputRef.current?.click()}
                className={`w-24 h-24 sm:w-44 sm:h-44 rounded-full border-4 sm:border-8 border-dotted flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden mb-3 sm:mb-6 ${customization.photoUrl ? 'border-black' : 'border-gray-200 bg-gray-50 hover:border-black'}`}
              >
                {customization.photoUrl ? (
                  <img src={customization.photoUrl} alt="Character" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <span className="text-2xl sm:text-5xl mb-1">🤳</span>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 text-center px-2">Select Photo</span>
                  </>
                )}
              </div>

              <button 
                onClick={() => photoInputRef.current?.click()}
                className="w-full bg-brand-red border-2 sm:border-4 border-black py-2 sm:py-4 text-sm sm:text-2xl font-black text-white shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase italic"
              >
                Change Face
              </button>
              
              <input 
                ref={photoInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'photoUrl')}
              />
            </div>

            {/* Sound Forge */}
            <div className="bg-brand-blue border-4 border-black shadow-brutal p-3 sm:p-5">
              <h3 className="font-black text-white uppercase mb-2 sm:mb-4 flex items-center gap-2 text-xs sm:text-base">
                <span className="text-lg sm:text-2xl">🔊</span> Sound Forge
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3">
                <div className="bg-white border-2 border-black p-2 sm:p-3 flex justify-between items-center group cursor-pointer" onClick={() => loseSoundInputRef.current?.click()}>
                  <div className="flex flex-col">
                    <span className="font-bold uppercase text-[8px] sm:text-[11px] text-black">Lose:</span>
                    <span className="text-[7px] sm:text-[10px] font-mono text-gray-400 truncate max-w-[60px] sm:max-w-[120px]">
                      {customization.loseSoundUrl ? 'Set' : 'Def'}
                    </span>
                  </div>
                  <Check className={`w-3 h-3 sm:w-5 sm:h-5 ${customization.loseSoundUrl ? 'text-brand-green' : 'text-gray-200'}`} />
                </div>

                <div className="bg-white border-2 border-black p-2 sm:p-3 flex justify-between items-center group cursor-pointer" onClick={() => attackSoundInputRef.current?.click()}>
                  <div className="flex flex-col">
                    <span className="font-bold uppercase text-[8px] sm:text-[11px] text-black">Atk:</span>
                    <span className="text-[7px] sm:text-[10px] font-mono text-gray-400 truncate max-w-[60px] sm:max-w-[120px]">
                      {customization.attackSoundUrl ? 'Set' : 'Def'}
                    </span>
                  </div>
                  <Check className={`w-3 h-3 sm:w-5 sm:h-5 ${customization.attackSoundUrl ? 'text-brand-green' : 'text-gray-200'}`} />
                </div>

                <input ref={loseSoundInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileChange(e, 'loseSoundUrl')} />
                <input ref={attackSoundInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileChange(e, 'attackSoundUrl')} />
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Start */}
          <div className="md:col-span-8 flex flex-col gap-4 sm:gap-6">
            <div className="hidden sm:block flex-1 bg-brand-teal border-4 border-black shadow-brutal-lg relative overflow-hidden min-h-[300px] sm:min-h-[400px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
              
              <div className="absolute top-4 sm:top-10 left-4 sm:left-10 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="bg-white border-4 border-black p-2 sm:p-4 shadow-brutal-sm">
                  <div className="text-[8px] sm:text-[10px] font-black uppercase opacity-40 text-black">Obstacles Passed</div>
                  <div className="text-xl sm:text-4xl font-black italic text-black">00000</div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full h-16 sm:h-24 bg-brand-green border-t-4 border-black"></div>
              
              <div className="absolute bottom-16 sm:bottom-24 left-10 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 bg-white border-4 border-black rounded-xl flex items-center justify-center text-4xl sm:text-6xl shadow-xl transform -rotate-6">
                {customization.photoUrl ? <img src={customization.photoUrl} className="w-full h-full object-cover" /> : '🤔'}
              </div>

              <div className="absolute bottom-16 sm:bottom-24 left-1/2 text-3xl sm:text-5xl animate-bounce">💩</div>
            </div>

            <div className="h-16 sm:h-28 flex gap-4 sm:gap-6 mt-auto sm:mt-0">
              <button 
                disabled={!isReady}
                onClick={() => onStart(customization)}
                className={`flex-1 text-2xl sm:text-5xl font-black italic tracking-[0.1em] sm:tracking-[0.2em] border-4 border-black transition-all flex items-center justify-center gap-2 sm:gap-4 ${isReady ? 'bg-black text-white hover:bg-brand-red hover:text-black cursor-pointer shadow-brutal' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                START GAME <span className="text-xl sm:text-4xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
