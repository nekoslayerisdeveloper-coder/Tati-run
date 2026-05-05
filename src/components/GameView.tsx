import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerCustomization } from '../types';
import { RefreshCcw, Home, Skull, Swords } from 'lucide-react';

interface GameViewProps {
  customization: PlayerCustomization;
  onExit: () => void;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 0.8; // Percentage of height
const PLAYER_X = 50;
const OBSTACLE_SPEED = 5;
const NINJA_ATTACK_RANGE = 100;

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'poop' | 'ninja';
  hp?: number;
}

export default function GameView({ customization, onExit }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [poopsAvoided, setPoopsAvoided] = useState(0);
  const [isNinjaPhase, setIsNinjaPhase] = useState(false);
  const [attackAnimation, setAttackAnimation] = useState(false);

  // Game state refs for the loop
  const gameStateRef = useRef({
    playerY: 0,
    playerVelocityY: 0,
    isJumping: false,
    obstacles: [] as Entity[],
    frameCount: 0,
    lastObstacleTime: 0,
    isGameOver: false,
    poopsAvoided: 0,
    ninjaEncounterActive: false,
  });

  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const attackSoundRef = useRef<HTMLAudioElement | null>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1.2;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Initialize resources
  useEffect(() => {
    if (customization.photoUrl) {
      const img = new Image();
      img.src = customization.photoUrl;
      playerImgRef.current = img;
    }
    if (customization.loseSoundUrl) {
      loseSoundRef.current = new Audio(customization.loseSoundUrl);
    }
    if (customization.attackSoundUrl) {
      attackSoundRef.current = new Audio(customization.attackSoundUrl);
    }
  }, [customization]);

  const jump = useCallback(() => {
    if (!gameStateRef.current.isJumping && !gameStateRef.current.isGameOver) {
      gameStateRef.current.playerVelocityY = JUMP_FORCE;
      gameStateRef.current.isJumping = true;
      speak('pooo');
    }
  }, []);

  const attack = useCallback(() => {
    if (gameStateRef.current.isGameOver) return;
    
    setAttackAnimation(true);
    setTimeout(() => setAttackAnimation(false), 300);
    
    if (attackSoundRef.current) {
        attackSoundRef.current.currentTime = 0;
        attackSoundRef.current.play().catch(() => {});
    } else {
        speak('teri maki');
    }

    // Check for ninja hits
    gameStateRef.current.obstacles.forEach(obs => {
      if (obs.type === 'ninja' && Math.abs(obs.x - PLAYER_X) < NINJA_ATTACK_RANGE) {
        obs.hp = (obs.hp || 0) - 1;
      }
    });
  }, []);

  const handleAction = useCallback(() => {
    if (gameStateRef.current.ninjaEncounterActive) {
      attack();
    } else {
      jump();
    }
  }, [attack, jump]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleAction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  const resetGame = () => {
    gameStateRef.current = {
      playerY: 0,
      playerVelocityY: 0,
      isJumping: false,
      obstacles: [],
      frameCount: 0,
      lastObstacleTime: 0,
      isGameOver: false,
      poopsAvoided: 0,
      ninjaEncounterActive: false,
    };
    setGameOver(false);
    setScore(0);
    setPoopsAvoided(0);
    setIsNinjaPhase(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      if (gameStateRef.current.isGameOver) return;

      const width = canvas.width;
      const height = canvas.height;
      const groundLevel = height * GROUND_Y;

      // Update Player
      gameStateRef.current.playerY += gameStateRef.current.playerVelocityY;
      gameStateRef.current.playerVelocityY += GRAVITY;

      if (gameStateRef.current.playerY >= 0) {
        gameStateRef.current.playerY = 0;
        gameStateRef.current.playerVelocityY = 0;
        gameStateRef.current.isJumping = false;
      }

      // Check ninja phase status (After 5 poops)
      const ninjaPhase = gameStateRef.current.poopsAvoided >= 5;
      if (ninjaPhase !== isNinjaPhase) setIsNinjaPhase(ninjaPhase);

      // Spawn Obstacles
      gameStateRef.current.frameCount++;
      // MUCH FASTER SPAWN in ninja phase
      const spawnRate = ninjaPhase ? 50 : 100; 
      
      if (gameStateRef.current.frameCount - gameStateRef.current.lastObstacleTime > spawnRate) {
        // Ninja Probability is 80% once the phase starts
        const type = ninjaPhase && Math.random() > 0.2 ? 'ninja' : 'poop';
        gameStateRef.current.obstacles.push({
          x: width,
          y: groundLevel - (type === 'ninja' ? 60 : 40),
          width: type === 'ninja' ? 50 : 40,
          height: type === 'ninja' ? 60 : 40,
          type: type,
          hp: type === 'ninja' ? 1 : undefined
        });
        gameStateRef.current.lastObstacleTime = gameStateRef.current.frameCount;
      }

      // Update Obstacles
      gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obs => {
        obs.x -= OBSTACLE_SPEED;

        // Collision Check
        const playerBox = {
          x: PLAYER_X,
          y: groundLevel + gameStateRef.current.playerY - 50,
          w: 50,
          h: 50
        };

        const collision = (
          playerBox.x < obs.x + obs.width &&
          playerBox.x + playerBox.w > obs.x &&
          playerBox.y < obs.y + obs.height &&
          playerBox.y + playerBox.h > obs.y
        );

        if (collision) {
          gameStateRef.current.isGameOver = true;
          setGameOver(true);
          if (loseSoundRef.current) {
            loseSoundRef.current.play().catch(() => {});
          } else {
            speak('madar chod');
          }
        }

        // Score indexing
        if (obs.x + obs.width < PLAYER_X && !(obs as any).passed) {
          (obs as any).passed = true;
          setScore(s => s + 1);
          if (obs.type === 'poop') {
            gameStateRef.current.poopsAvoided++;
            setPoopsAvoided(gameStateRef.current.poopsAvoided);
          }
        }

        // Remove if dead or offscreen
        const isDeadNinja = obs.type === 'ninja' && (obs.hp || 0) <= 0;
        if (isDeadNinja) setScore(s => s + 5);
        return obs.x > -100 && !isDeadNinja;
      });

      // UI state for ninja help
      const hasNinjaNear = gameStateRef.current.obstacles.some(o => o.type === 'ninja' && o.x < width * 0.8);
      gameStateRef.current.ninjaEncounterActive = hasNinjaNear;

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Sky
      ctx.fillStyle = '#A0E7E5'; // Teal sky from theme
      ctx.fillRect(0, 0, width, height);
      
      // Backdrop dots
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let x = 0; x < width; x += 30) {
        for (let y = 0; y < height; y += 30) {
           ctx.beginPath();
           ctx.arc(x, y, 1, 0, Math.PI * 2);
           ctx.fill();
        }
      }

      // Ground
      ctx.fillStyle = '#6BCB77'; // Green ground from theme
      ctx.fillRect(0, groundLevel, width, height - groundLevel);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, groundLevel, width, height - groundLevel);

      // Player
      ctx.save();
      const playerDrawY = groundLevel + gameStateRef.current.playerY - 60;
      if (playerImgRef.current) {
        ctx.drawImage(playerImgRef.current, PLAYER_X, playerDrawY, 60, 60);
      } else {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(PLAYER_X, playerDrawY, 60, 60);
      }
      
      // Attack indicator
      if (attackAnimation) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(PLAYER_X + 30, playerDrawY + 30, 45, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Obstacles
      gameStateRef.current.obstacles.forEach(obs => {
        if (obs.type === 'poop') {
          ctx.font = '30px serif';
          ctx.fillText('💩', obs.x, obs.y + 30);
        } else {
          ctx.font = '40px serif';
          ctx.fillText('🥷', obs.x, obs.y + 40);
        }
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isNinjaPhase, attackAnimation]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-brand-teal" onClick={(e) => {
      // Prevent full-screen click if target is a button
      if ((e.target as HTMLElement).closest('button')) return;
      handleAction();
    }}>
      <canvas 
        ref={canvasRef} 
        className="block"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-4 pointer-events-none">
        <div className="bg-white border-4 border-black p-2 sm:p-4 shadow-brutal-sm">
          <div className="text-[8px] sm:text-[10px] font-black uppercase opacity-40 text-black">Obstacles Passed</div>
          <div className="text-2xl sm:text-4xl font-black italic text-black">{poopsAvoided.toString().padStart(5, '0')}</div>
        </div>
        <div className="bg-brand-red text-white border-4 border-black p-2 sm:p-4 shadow-brutal-sm">
          <div className="text-[8px] sm:text-[10px] font-black uppercase opacity-60 text-white">Current Score</div>
          <div className="text-2xl sm:text-4xl font-black italic text-white">{score.toString().padStart(6, '0')}</div>
        </div>
        {isNinjaPhase && (
           <div className="bg-black text-white border-4 border-black p-2 sm:p-4 shadow-brutal-sm flex flex-col justify-center">
             <div className="text-[8px] font-black uppercase text-brand-red">NINJA PHASE</div>
             <div className="flex items-center gap-2 text-xl sm:text-2xl font-black italic">
               <Swords size={20} className="text-brand-red" />
               ACTIVE
             </div>
           </div>
        )}
      </div>

      {/* Control Buttons */}
      {!gameOver && (
        <div className="absolute bottom-4 sm:bottom-8 left-0 w-full px-4 sm:px-8 flex justify-between items-center pointer-events-auto">
          <button 
            onMouseDown={(e) => { e.stopPropagation(); jump(); }}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); jump(); }}
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white border-4 sm:border-8 border-black shadow-brutal flex flex-col items-center justify-center active:translate-y-2 active:shadow-none transition-all z-40"
          >
            <div className="text-2xl sm:text-4xl">🚀</div>
            <span className="font-black text-[10px] sm:text-sm uppercase italic">JUMP</span>
          </button>

          <button 
            onMouseDown={(e) => { e.stopPropagation(); attack(); }}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); attack(); }}
            className={`w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 sm:border-8 border-black shadow-brutal flex flex-col items-center justify-center active:translate-y-2 active:shadow-none transition-all z-40 ${isNinjaPhase ? 'bg-brand-red animate-bounce' : 'bg-gray-100'}`}
          >
            <div className="text-2xl sm:text-4xl text-black">⚔️</div>
            <span className="font-black text-[10px] sm:text-sm uppercase italic text-black">FIGHT</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {gameStateRef.current.ninjaEncounterActive && !gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, x: '-50%', y: 20 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: '-50%', y: 20 }}
            className="absolute bottom-48 left-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <div className="bg-white border-4 border-black p-6 shadow-brutal flex flex-col items-center gap-2">
                <Swords size={48} className="text-brand-red" />
                <span className="font-black text-2xl bg-black text-white px-6 py-2 transform -skew-x-12 italic">NINJA NEARBY!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-brand-yellow/90 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border-4 sm:border-8 border-black shadow-brutal-lg p-6 sm:p-10 max-w-sm sm:max-w-md w-full text-center space-y-6 sm:space-y-8 relative"
            >
              <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 bg-black text-white px-4 sm:px-6 py-1 sm:py-2 font-black text-lg sm:text-xl uppercase italic transform -rotate-2 w-max">
                Mission Failed
              </div>

              <div className="flex justify-center">
                <div className="text-7xl sm:text-9xl transform -rotate-12 drop-shadow-brutal-sm">💩</div>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-4xl sm:text-6xl font-black text-black italic tracking-tighter leading-none">SPLATT!!</h2>
                <p className="text-lg sm:text-xl font-bold bg-black text-brand-yellow px-2 w-fit mx-auto uppercase">Stinky Situation</p>
              </div>
              
              <div className="py-4 sm:py-6 bg-brand-teal border-4 border-black shadow-brutal-sm">
                <p className="text-black text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">Final Record</p>
                <p className="text-4xl sm:text-6xl font-black text-black italic">{score}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:pt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onExit(); // This goes back to Setup Screen
                  }}
                  className="flex items-center justify-center gap-2 py-4 sm:py-5 border-4 border-black bg-black text-white font-black uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl"
                >
                  <RefreshCcw size={24} />
                  Main Menu / Restart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  }
      
