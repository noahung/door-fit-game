import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DifficultyLevel = "easy" | "medium" | "hard";
export type GameMode = "classic" | "timed" | "limited";

export interface GameSettings {
  houseImageUrl: string | null;
  doorImageUrl: string | null;
  houseWidth: number;
  houseHeight: number;
  doorWidth: number;
  doorHeight: number;
  successAreaX: number;
  successAreaY: number;
  successAreaWidth: number;
  successAreaHeight: number;
  doorSpeed: number;
  successRedirectUrl: string;
  successThreshold: number; // Percentage of overlap required for success (0-100)
  difficulty: DifficultyLevel;
  gameMode: GameMode;
  timedModeDuration: number; // seconds for timed mode
  limitedModeAttempts: number; // max attempts for limited mode
}

export type GamePhase = "settings" | "ready" | "playing" | "success" | "failure";

interface GameStats {
  attempts: number;
  successes: number;
  bestTime: number | null; // in milliseconds
  currentStartTime: number | null;
  timedModeTimeLeft: number | null; // seconds left in timed mode
  limitedModeAttemptsLeft: number | null; // attempts left in limited mode
}

interface SlidingDoorState {
  settings: GameSettings;
  gamePhase: GamePhase;
  doorPosition: number;
  doorDirection: 1 | -1;
  animationId: number | null;
  stats: GameStats;
  
  // Actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  setGamePhase: (phase: GamePhase) => void;
  setDoorPosition: (position: number) => void;
  setDoorDirection: (direction: 1 | -1) => void;
  setAnimationId: (id: number | null) => void;
  resetGame: () => void;
  startAttempt: () => void;
  recordSuccess: () => void;
  recordFailure: () => void;
  resetStats: () => void;
  uploadHouseImage: (file: File) => Promise<void>;
  uploadDoorImage: (file: File) => Promise<void>;
}

// Difficulty presets
export const difficultyPresets = {
  easy: { doorSpeed: 1.5, successThreshold: 70 },
  medium: { doorSpeed: 3, successThreshold: 80 },
  hard: { doorSpeed: 5, successThreshold: 90 },
};

const defaultSettings: GameSettings = {
  houseImageUrl: "/door-fit-game/images/house.jpg",
  doorImageUrl: "/door-fit-game/images/door.jpg",
  houseWidth: 600,
  houseHeight: 400,
  doorWidth: 80,
  doorHeight: 140,
  successAreaX: 260,
  successAreaY: 180,
  successAreaWidth: 80,
  successAreaHeight: 140,
  doorSpeed: 3,
  successRedirectUrl: "",
  successThreshold: 80,
  difficulty: "medium",
  gameMode: "classic",
  timedModeDuration: 30,
  limitedModeAttempts: 5,
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const useSlidingDoor = create<SlidingDoorState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      gamePhase: "settings",
      doorPosition: 0,
      doorDirection: 1,
      animationId: null,
      stats: {
        attempts: 0,
        successes: 0,
        bestTime: null,
        currentStartTime: null,
        timedModeTimeLeft: null,
        limitedModeAttemptsLeft: null,
      },

      updateSettings: (newSettings) => {
        console.log("Updating settings:", newSettings);
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setGamePhase: (phase) => {
        console.log("Game phase changed to:", phase);
        set({ gamePhase: phase });
      },

      setDoorPosition: (position) => {
        set({ doorPosition: position });
      },

      setDoorDirection: (direction) => {
        set({ doorDirection: direction });
      },

      setAnimationId: (id) => {
        set({ animationId: id });
      },

      resetGame: () => {
        const { animationId } = get();
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
        }
        set({
          gamePhase: "ready",
          doorPosition: 0,
          doorDirection: 1,
          animationId: null,
        });
      },

      startAttempt: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            currentStartTime: Date.now(),
          },
        }));
        console.log("Attempt started");
      },

      recordSuccess: () => {
        const { stats } = get();
        const currentTime = Date.now();
        const elapsedTime = stats.currentStartTime 
          ? currentTime - stats.currentStartTime 
          : 0;
        
        const newBestTime = stats.bestTime === null 
          ? elapsedTime 
          : Math.min(stats.bestTime, elapsedTime);

        set((state) => ({
          stats: {
            ...state.stats,
            attempts: state.stats.attempts + 1,
            successes: state.stats.successes + 1,
            bestTime: newBestTime,
            currentStartTime: null,
          },
        }));
        
        console.log(`Success! Time: ${elapsedTime}ms, Best: ${newBestTime}ms`);
      },

      recordFailure: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            attempts: state.stats.attempts + 1,
            currentStartTime: null,
          },
        }));
        console.log("Failure recorded");
      },

      resetStats: () => {
        set({
          stats: {
            attempts: 0,
            successes: 0,
            bestTime: null,
            currentStartTime: null,
            timedModeTimeLeft: null,
            limitedModeAttemptsLeft: null,
          },
        });
        console.log("Stats reset");
      },

      uploadHouseImage: async (file) => {
        try {
          const base64 = await fileToBase64(file);
          set((state) => ({
            settings: {
              ...state.settings,
              houseImageUrl: base64,
            },
          }));
          console.log("House image uploaded successfully");
        } catch (error) {
          console.error("Error uploading house image:", error);
        }
      },

      uploadDoorImage: async (file) => {
        try {
          const base64 = await fileToBase64(file);
          set((state) => ({
            settings: {
              ...state.settings,
              doorImageUrl: base64,
            },
          }));
          console.log("Door image uploaded successfully");
        } catch (error) {
          console.error("Error uploading door image:", error);
        }
      },
    }),
    {
      name: "sliding-door-storage",
      partialize: (state) => ({ settings: state.settings, stats: state.stats }),
      migrate: (persistedState: any) => {
        // Ensure difficulty is always set for legacy storage
        const result: any = {};
        
        if (persistedState?.settings) {
          const s = persistedState.settings;
          result.settings = {
            ...s,
            difficulty: s.difficulty ?? "medium",
            doorSpeed: s.doorSpeed ?? 3,
            successThreshold: s.successThreshold ?? 80,
          };
        }
        
        // Migrate stats with defaults
        if (persistedState?.stats) {
          result.stats = {
            attempts: persistedState.stats.attempts ?? 0,
            successes: persistedState.stats.successes ?? 0,
            bestTime: persistedState.stats.bestTime ?? null,
            currentStartTime: null, // Never persist currentStartTime
          };
        }
        
        return result;
      },
    }
  )
);
