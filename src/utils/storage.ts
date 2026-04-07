import type { PersistedTournamentState } from '../types/tournament';

export const STORAGE_KEY = 'wc26-prediction-tool:v1';
export const STORAGE_VERSION = 1;

export const readPersistedTournament = (): PersistedTournamentState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedTournamentState;
    if (parsed.version !== STORAGE_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const writePersistedTournament = (payload: PersistedTournamentState) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const clearPersistedTournament = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
