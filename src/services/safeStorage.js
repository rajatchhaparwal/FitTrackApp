/**
 * AsyncStorage with in-memory fallback so the app still runs
 * if the native module is missing (e.g. before a rebuild).
 */
const memory = {};

let asyncStorage = null;

try {
  asyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  asyncStorage = null;
}

export async function storageGetItem(key) {
  if (asyncStorage) {
    try {
      return await asyncStorage.getItem(key);
    } catch {
      // fall through to memory
    }
  }
  return memory[key] ?? null;
}

export async function storageSetItem(key, value) {
  memory[key] = value;
  if (asyncStorage) {
    try {
      await asyncStorage.setItem(key, value);
    } catch {
      // memory fallback already set
    }
  }
}

export async function storageRemoveItem(key) {
  delete memory[key];
  if (asyncStorage) {
    try {
      await asyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
