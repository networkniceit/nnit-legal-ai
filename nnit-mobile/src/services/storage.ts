import * as SecureStore from 'expo-secure-store';

// Offline cache using in-memory + SecureStore fallback
const memCache: Record<string, string> = {};

export const Storage = {
  async set(key: string, value: string): Promise<void> {
    memCache[key] = value;
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },

  async get(key: string): Promise<string | null> {
    if (memCache[key]) return memCache[key];
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    delete memCache[key];
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    await Storage.set(key, JSON.stringify(value));
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await Storage.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};

// Offline chat history cache
export const ChatCache = {
  async save(messages: unknown[]): Promise<void> {
    await Storage.setJSON('offline_chat', messages);
  },
  async load(): Promise<unknown[]> {
    return (await Storage.getJSON<unknown[]>('offline_chat')) ?? [];
  },
};

// Auth token
export const AuthStore = {
  async saveToken(token: string): Promise<void> {
    await Storage.set('auth_token', token);
  },
  async getToken(): Promise<string | null> {
    return Storage.get('auth_token');
  },
  async clearToken(): Promise<void> {
    await Storage.delete('auth_token');
  },
};
