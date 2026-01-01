import { openDB, type IDBPDatabase } from "idb";

type KVDB = {
  kv: {
    key: string;
    value: string;
  };
};

const DB_NAME = "chrona";
const STORE_NAME = "kv";

let dbPromise: Promise<IDBPDatabase<KVDB>> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<KVDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const chronaStorage = {
  async getItem(name: string) {
    try {
      const db = await getDB();
      const value = await db.get(STORE_NAME, name);
      return typeof value === "string" ? value : null;
    } catch {
      return hasLocalStorage() ? window.localStorage.getItem(name) : null;
    }
  },
  async setItem(name: string, value: string) {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, value, name);
    } catch {
      if (hasLocalStorage()) window.localStorage.setItem(name, value);
    }
  },
  async removeItem(name: string) {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, name);
    } catch {
      if (hasLocalStorage()) window.localStorage.removeItem(name);
    }
  },
};
