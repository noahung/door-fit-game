import React, { useEffect } from "react";
import { useSlidingDoor } from "@/lib/stores/useSlidingDoor";
import { GameCanvas } from "./GameCanvas";

export const GameOnly: React.FC = () => {
  const { gamePhase, setGamePhase } = useSlidingDoor();

  // Automatically set game phase to "ready" on mount for iframe use
  useEffect(() => {
    if (gamePhase === "settings") {
      setGamePhase("ready");
    }
  }, [gamePhase, setGamePhase]);

  // Always show the game interface (no settings)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Sliding Door Challenge
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Stop the door at the right position to fit it perfectly!
          </p>
        </div>

        <GameCanvas />
      </div>
    </div>
  );
};