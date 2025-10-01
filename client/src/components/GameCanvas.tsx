import React, { useRef, useEffect, useState } from "react";
import { useSlidingDoor } from "@/lib/stores/useSlidingDoor";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const houseImageRef = useRef<HTMLImageElement | null>(null);
  const doorImageRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
  }>>([]);

  const {
    settings,
    gamePhase,
    doorPosition,
    doorDirection,
    stats,
    setDoorPosition,
    setDoorDirection,
    setGamePhase,
    resetGame,
    setAnimationId,
    startAttempt,
    recordSuccess,
    recordFailure,
    resetStats,
  } = useSlidingDoor();

  const {
    setHitSound,
    setSuccessSound,
    playHit,
    playSuccess,
    isMuted,
    toggleMute,
  } = useAudio();

  // Initialize sounds
  useEffect(() => {
    const hitAudio = new Audio("/door-fit-game/sounds/hit.mp3");
    const successAudio = new Audio("/door-fit-game/sounds/success.mp3");
    
    hitAudio.preload = 'auto';
    successAudio.preload = 'auto';
    hitAudio.load();
    successAudio.load();
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    
    console.log("Audio initialized");
  }, [setHitSound, setSuccessSound]);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const houseImg = new Image();
      const doorImg = new Image();
      let houseLoaded = false;
      let doorLoaded = false;

      const checkBothLoaded = () => {
        if (houseLoaded && doorLoaded) {
          houseImageRef.current = houseImg;
          doorImageRef.current = doorImg;
          setImagesLoaded(true);
          console.log("Both images loaded successfully");
        }
      };

      if (settings.houseImageUrl) {
        houseImg.onload = () => {
          houseLoaded = true;
          checkBothLoaded();
        };
        houseImg.onerror = () => {
          console.error("Failed to load house image");
        };
        houseImg.src = settings.houseImageUrl;
      } else {
        houseLoaded = true;
      }

      if (settings.doorImageUrl) {
        doorImg.onload = () => {
          doorLoaded = true;
          checkBothLoaded();
        };
        doorImg.onerror = () => {
          console.error("Failed to load door image");
        };
        doorImg.src = settings.doorImageUrl;
      } else {
        doorLoaded = true;
      }

      checkBothLoaded();
    };

    loadImages();
  }, [settings.houseImageUrl, settings.doorImageUrl]);

  // Timer countdown for timed mode
  useEffect(() => {
    if (gamePhase !== "playing" || settings.gameMode !== "timed") return;
    if (stats.timedModeTimeLeft === null || stats.timedModeTimeLeft <= 0) return;

    const timerId = setInterval(() => {
      useSlidingDoor.setState((state) => {
        const newTimeLeft = (state.stats.timedModeTimeLeft ?? 0) - 1;
        
        if (newTimeLeft <= 0) {
          // Time's up!
          setTimeout(() => state.setGamePhase("failure"), 0);
          return {
            stats: {
              ...state.stats,
              timedModeTimeLeft: 0,
            },
          };
        }
        
        return {
          stats: {
            ...state.stats,
            timedModeTimeLeft: newTimeLeft,
          },
        };
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [gamePhase, settings.gameMode, stats.timedModeTimeLeft]);

  // Animation loop
  useEffect(() => {
    if (gamePhase !== "playing" || !imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const animate = () => {
      // Update door position
      const newPosition = doorPosition + doorDirection * settings.doorSpeed;
      const canvasWidth = settings.houseWidth;
      const maxPosition = canvasWidth - settings.doorWidth;

      // Reverse direction if hitting boundaries
      if (newPosition <= 0 || newPosition >= maxPosition) {
        setDoorDirection(doorDirection * -1 as 1 | -1);
        setDoorPosition(Math.max(0, Math.min(newPosition, maxPosition)));
      } else {
        setDoorPosition(newPosition);
      }

      // Draw the scene
      drawScene(ctx);

      animationFrameId = requestAnimationFrame(animate);
      setAnimationId(animationFrameId);
    };

    animationFrameId = requestAnimationFrame(animate);
    setAnimationId(animationFrameId);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gamePhase, imagesLoaded, doorPosition, doorDirection, settings]);

  // Draw scene
  const drawScene = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw house
    if (houseImageRef.current && settings.houseImageUrl) {
      ctx.drawImage(
        houseImageRef.current,
        0,
        0,
        settings.houseWidth,
        settings.houseHeight
      );
    } else {
      // Draw placeholder house
      ctx.fillStyle = "#8B7355";
      ctx.fillRect(0, 0, settings.houseWidth, settings.houseHeight);
      ctx.fillStyle = "#654321";
      ctx.fillRect(50, 50, settings.houseWidth - 100, settings.houseHeight - 100);
    }

    // Draw success area (semi-transparent in playing mode)
    if (gamePhase === "playing" || gamePhase === "ready") {
      ctx.fillStyle = "rgba(244, 116, 33, 0.2)"; // Orange with transparency
      ctx.strokeStyle = "rgba(244, 116, 33, 0.6)"; // Orange border
      ctx.lineWidth = 3;
      ctx.fillRect(
        settings.successAreaX,
        settings.successAreaY,
        settings.successAreaWidth,
        settings.successAreaHeight
      );
      ctx.strokeRect(
        settings.successAreaX,
        settings.successAreaY,
        settings.successAreaWidth,
        settings.successAreaHeight
      );
    }

    // Calculate door Y position (center vertically within success area)
    const doorY = settings.successAreaY + (settings.successAreaHeight - settings.doorHeight) / 2;

    // Draw door
    if (doorImageRef.current && settings.doorImageUrl) {
      ctx.drawImage(
        doorImageRef.current,
        doorPosition,
        doorY,
        settings.doorWidth,
        settings.doorHeight
      );
    } else {
      // Draw placeholder door
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(doorPosition, doorY, settings.doorWidth, settings.doorHeight);
      ctx.fillStyle = "#654321";
      ctx.fillRect(
        doorPosition + 10,
        doorY + 10,
        settings.doorWidth - 20,
        settings.doorHeight - 20
      );
      // Door handle
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(doorPosition + settings.doorWidth - 30, doorY + settings.doorHeight / 2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw feedback overlay for success/failure
    if (gamePhase === "success") {
      ctx.fillStyle = "rgba(244, 116, 33, 0.3)"; // Orange overlay
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw success border
      ctx.strokeStyle = "#f47421";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    } else if (gamePhase === "failure") {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw failure border with shake effect
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    }
  };

  // Create particles
  const createParticles = (color: string, count: number = 50) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const newParticles = Array.from({ length: count }, () => ({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color,
      size: Math.random() * 6 + 2,
      life: 1.0,
    }));
    
    setParticles(newParticles);
  };

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animationId = requestAnimationFrame(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3, // gravity
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    });
    
    return () => cancelAnimationFrame(animationId);
  }, [particles]);

  // Initial draw when not playing
  useEffect(() => {
    if (gamePhase !== "playing" && imagesLoaded) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawScene(ctx);
    }
  }, [gamePhase, imagesLoaded, settings]);

  // Draw particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [particles]);

  // Check if door is in success area
  const checkSuccess = () => {
    const doorLeft = doorPosition;
    const doorRight = doorPosition + settings.doorWidth;
    const successLeft = settings.successAreaX;
    const successRight = settings.successAreaX + settings.successAreaWidth;

    // Calculate overlap
    const overlapLeft = Math.max(doorLeft, successLeft);
    const overlapRight = Math.min(doorRight, successRight);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);
    
    const overlapPercentage = (overlapWidth / settings.doorWidth) * 100;

    console.log(`Door position: ${doorPosition}, Overlap: ${overlapPercentage.toFixed(2)}%`);

    return overlapPercentage >= settings.successThreshold;
  };

  // Handle click/tap to stop door
  const handleCanvasClick = () => {
    if (gamePhase === "playing") {
      const isSuccess = checkSuccess();
      
      if (isSuccess) {
        console.log("Success! Door aligned correctly");
        playSuccess();
        recordSuccess();
        createParticles("#00ff00", 60); // Green particles for success
        
        // Check game mode behavior
        if (settings.gameMode === "timed") {
          // In timed mode, continue playing after success
          setTimeout(() => {
            setDoorPosition(0);
            setDoorDirection(1);
            startAttempt();
          }, 500);
        } else if (settings.gameMode === "limited") {
          // Check if we're out of attempts
          const attemptsLeft = (stats.limitedModeAttemptsLeft ?? 0) - 1;
          useSlidingDoor.setState((state) => ({
            stats: {
              ...state.stats,
              limitedModeAttemptsLeft: attemptsLeft,
            },
          }));
          
          if (attemptsLeft <= 0) {
            setGamePhase("success");
          } else {
            // Continue playing
            setTimeout(() => {
              setDoorPosition(0);
              setDoorDirection(1);
              startAttempt();
            }, 500);
          }
        } else {
          // Classic mode - stop on success
          setGamePhase("success");
          
          // Redirect after a delay
          if (settings.successRedirectUrl) {
            setTimeout(() => {
              window.location.href = settings.successRedirectUrl;
            }, 2000);
          }
        }
      } else {
        console.log("Failure! Door not aligned");
        playHit();
        recordFailure();
        createParticles("#ff0000", 40); // Red particles for failure
        
        // Check game mode behavior
        if (settings.gameMode === "timed") {
          // In timed mode, continue playing after failure
          setTimeout(() => {
            setDoorPosition(0);
            setDoorDirection(1);
            startAttempt();
          }, 500);
        } else if (settings.gameMode === "limited") {
          // Check if we're out of attempts
          const attemptsLeft = (stats.limitedModeAttemptsLeft ?? 0) - 1;
          useSlidingDoor.setState((state) => ({
            stats: {
              ...state.stats,
              limitedModeAttemptsLeft: attemptsLeft,
            },
          }));
          
          if (attemptsLeft <= 0) {
            setGamePhase("failure");
          } else {
            // Continue playing
            setTimeout(() => {
              setDoorPosition(0);
              setDoorDirection(1);
              startAttempt();
            }, 500);
          }
        } else {
          // Classic mode - stop on failure
          setGamePhase("failure");
        }
      }
    }
  };

  // Start game
  const handleStart = () => {
    console.log("Starting game");
    setDoorPosition(0);
    setDoorDirection(1);
    startAttempt();
    
    // Initialize game mode specific counters
    if (settings.gameMode === "timed") {
      useSlidingDoor.setState((state) => ({
        stats: {
          ...state.stats,
          timedModeTimeLeft: settings.timedModeDuration,
        },
      }));
    } else if (settings.gameMode === "limited") {
      useSlidingDoor.setState((state) => ({
        stats: {
          ...state.stats,
          limitedModeAttemptsLeft: settings.limitedModeAttempts,
        },
      }));
    }
    
    setGamePhase("playing");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2 sm:p-4 w-full">
      <div className="relative w-full max-w-[600px]">
        <canvas
          ref={canvasRef}
          width={settings.houseWidth}
          height={settings.houseHeight}
          onClick={handleCanvasClick}
          className="border-4 border-gray-200 rounded-2xl cursor-pointer touch-none shadow-2xl w-full h-auto"
        />
        
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 hover:bg-white rounded-xl border-2 border-gray-200 hover:border-[#f47421] z-10 shadow-lg transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-gray-600" /> : <Volume2 className="w-4 h-4 text-[#f47421]" />}
        </Button>
        
        {gamePhase === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
            <Button
              size="lg"
              onClick={handleStart}
              className="text-lg sm:text-xl px-6 py-4 sm:px-8 sm:py-6 bg-[#f47421] hover:bg-[#e56610] text-white font-bold shadow-xl rounded-2xl border-2 border-[#f47421] transition-all duration-200 transform hover:scale-105"
            >
              🚪 Start Game
            </Button>
          </div>
        )}
        
        {gamePhase === "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f47421] bg-opacity-90 rounded-2xl p-4">
            <div className="text-white text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">SUCCESS!</div>
            <div className="text-white text-lg sm:text-xl mb-2 sm:mb-4">Perfect alignment!</div>
            {settings.successRedirectUrl && (
              <div className="text-white text-sm">Redirecting...</div>
            )}
            {!settings.successRedirectUrl && (
              <Button 
                onClick={resetGame} 
                className="mt-2 sm:mt-4 bg-white hover:bg-gray-100 text-[#f47421] font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-xl border-2 border-white shadow-lg transition-all duration-200"
              >
                🎮 Play Again
              </Button>
            )}
          </div>
        )}
        
        {gamePhase === "failure" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-90 rounded-2xl p-4">
            <div className="text-white text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">TRY AGAIN!</div>
            <div className="text-white text-lg sm:text-xl mb-2 sm:mb-4">Door not aligned correctly</div>
            <Button 
              onClick={resetGame} 
              className="mt-2 sm:mt-4 bg-white hover:bg-gray-100 text-red-600 font-bold px-4 py-2 sm:px-6 sm:py-2 rounded-xl border-2 border-white shadow-lg transition-all duration-200"
            >
              🔄 Try Again
            </Button>
          </div>
        )}
      </div>
      
      {gamePhase === "playing" && (
        <div className="space-y-2 w-full max-w-md">
          <div className="bg-orange-50 border-2 border-[#f47421] rounded-xl px-4 py-3 text-center shadow-md">
            <p className="text-[#f47421] font-semibold">
              Click or tap to stop the door when it aligns with the target area!
            </p>
          </div>
          
          {/* Timed Mode Timer */}
          {settings.gameMode === "timed" && stats.timedModeTimeLeft !== null && (
            <div className="bg-orange-50 border-2 border-[#f47421] rounded-xl px-4 py-2 text-center shadow-md">
              <p className="text-[#f47421] font-bold text-lg">
                ⏱️ Time Left: {stats.timedModeTimeLeft}s
              </p>
            </div>
          )}
          
          {/* Limited Mode Attempts */}
          {settings.gameMode === "limited" && stats.limitedModeAttemptsLeft !== null && (
            <div className="bg-orange-50 border-2 border-[#f47421] rounded-xl px-4 py-2 text-center shadow-md">
              <p className="text-[#f47421] font-bold text-lg">
                🎯 Attempts Left: {stats.limitedModeAttemptsLeft}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Stats Display */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 shadow-lg w-full max-w-[600px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">📊 Game Statistics</h3>
          {stats.attempts > 0 && (
            <Button
              onClick={() => {
                if (window.confirm("Reset all statistics? This cannot be undone.")) {
                  resetStats();
                }
              }}
              variant="outline"
              size="sm"
              className="rounded-lg border-[#f47421] text-[#f47421] hover:bg-orange-50 text-xs sm:text-sm"
            >
              Reset Stats
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-blue-50 rounded-xl p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Attempts</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.attempts}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Successes</p>
            <p className="text-lg sm:text-2xl font-bold text-[#f47421]">{stats.successes}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Best Time</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">
              {stats.bestTime !== null ? `${(stats.bestTime / 1000).toFixed(2)}s` : "-"}
            </p>
          </div>
        </div>
        {stats.attempts > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-block bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl px-3 py-2 sm:px-4 sm:py-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                Success Rate: <span className="text-[#f47421] text-base sm:text-lg">{((stats.successes / stats.attempts) * 100).toFixed(1)}%</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
