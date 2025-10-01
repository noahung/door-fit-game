import React from "react";
import { useSlidingDoor } from "@/lib/stores/useSlidingDoor";
import { GameCanvas } from "./GameCanvas";

export const GameOnly: React.FC = () => {
  const { gamePhase } = useSlidingDoor();

  // Always show the game interface (no settings)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sliding Door Challenge
          </h1>
          <p className="text-gray-600 text-lg">
            Stop the door at the right position to fit it perfectly!
          </p>
        </div>

        <GameCanvas />
      </div>
    </div>
  );
};