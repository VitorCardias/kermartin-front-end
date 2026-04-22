const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const PROFILE_KEY = 'auth.profile';

const isBrowser = typeof window !== 'undefined';

const safeSessionStorage = {
  getItem(key: string): string | null {
    if (!isBrowser) return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (!isBrowser) return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Ignore write errors (private mode / quota / disabled storage)
    }
  },
  removeItem(key: string): void {
    if (!isBrowser) return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore remove errors
    }
  },
};

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export const authStorage = {
  getAccessToken(): string | null {
    return memoryAccessToken ?? safeSessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return memoryRefreshToken ?? safeSessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    memoryAccessToken = accessToken;
    memoryRefreshToken = refreshToken;
    safeSessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    safeSessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens(): void {
    memoryAccessToken = null;
    memoryRefreshToken = null;
    safeSessionStorage.removeItem(ACCESS_TOKEN_KEY);
    safeSessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  getProfile<T>(): T | null {
    const raw = safeSessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setProfile<T>(profile: T): void {
    safeSessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },
  clearProfile(): void {
    safeSessionStorage.removeItem(PROFILE_KEY);
  },
};
