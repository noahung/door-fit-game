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
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
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
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
      ctx.lineWidth = 2;
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
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw success border
      ctx.strokeStyle = "#00ff00";
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
        setGamePhase("success");
        
        // Redirect after a delay
        if (settings.successRedirectUrl) {
          setTimeout(() => {
            window.location.href = settings.successRedirectUrl;
          }, 2000);
        }
      } else {
        console.log("Failure! Door not aligned");
        playHit();
        recordFailure();
        setGamePhase("failure");
      }
    }
  };

  // Start game
  const handleStart = () => {
    console.log("Starting game");
    setDoorPosition(0);
    setDoorDirection(1);
    startAttempt();
    setGamePhase("playing");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={settings.houseWidth}
          height={settings.houseHeight}
          onClick={handleCanvasClick}
          className="border-4 border-gray-800 cursor-pointer touch-none shadow-2xl"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white z-10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        
        {gamePhase === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Button
              size="lg"
              onClick={handleStart}
              className="text-xl px-8 py-6"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gamePhase === "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500 bg-opacity-80">
            <div className="text-white text-4xl font-bold mb-4">SUCCESS!</div>
            <div className="text-white text-xl mb-4">Perfect alignment!</div>
            {settings.successRedirectUrl && (
              <div className="text-white text-sm">Redirecting...</div>
            )}
            {!settings.successRedirectUrl && (
              <Button onClick={resetGame} className="mt-4">
                Play Again
              </Button>
            )}
          </div>
        )}
        
        {gamePhase === "failure" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-80">
            <div className="text-white text-4xl font-bold mb-4">TRY AGAIN!</div>
            <div className="text-white text-xl mb-4">Door not aligned correctly</div>
            <Button onClick={resetGame} className="mt-4">
              Retry
            </Button>
          </div>
        )}
      </div>
      
      {gamePhase === "playing" && (
        <div className="bg-blue-100 border border-blue-400 rounded px-4 py-3 text-center">
          <p className="text-blue-800 font-semibold">
            Click or tap to stop the door when it aligns with the green area!
          </p>
        </div>
      )}
      
      {/* Stats Display */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Game Statistics</h3>
          {stats.attempts > 0 && (
            <Button
              onClick={() => {
                if (window.confirm("Reset all statistics? This cannot be undone.")) {
                  resetStats();
                }
              }}
              variant="outline"
              size="sm"
            >
              Reset Stats
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Attempts</p>
            <p className="text-2xl font-bold text-blue-600">{stats.attempts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Successes</p>
            <p className="text-2xl font-bold text-green-600">{stats.successes}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Best Time</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.bestTime !== null ? `${(stats.bestTime / 1000).toFixed(2)}s` : "-"}
            </p>
          </div>
        </div>
        {stats.attempts > 0 && (
          <div className="mt-3 text-center text-sm text-gray-600">
            Success Rate: {((stats.successes / stats.attempts) * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};
