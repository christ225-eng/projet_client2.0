import { create } from "zustand";

/**
 * Player identity — set on the /pseudo screen, held for the whole session,
 * attached to the score before posting to Google Sheets.
 */
interface PlayerState {
  pseudo: string;
  setPseudo: (pseudo: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  pseudo: "",
  setPseudo: (pseudo) => set({ pseudo: pseudo.trim() }),
  reset: () => set({ pseudo: "" }),
}));
