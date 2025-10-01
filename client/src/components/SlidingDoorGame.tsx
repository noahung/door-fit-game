import React from "react";
import { useSlidingDoor } from "@/lib/stores/useSlidingDoor";
import { GameCanvas } from "./GameCanvas";
import { GameSettings } from "./GameSettings";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const SlidingDoorGame: React.FC = () => {
  const { gamePhase, setGamePhase } = useSlidingDoor();

  if (gamePhase === "settings") {
    return <GameSettings />;
  }

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

        <div className="text-center mt-8">
          <Button
            onClick={() => setGamePhase("settings")}
            variant="outline"
            size="lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
