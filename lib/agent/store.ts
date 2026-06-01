import fs from "fs/promises";
import path from "path";
import type { StoredAnalysis } from "@/lib/walrus-write";

// Use the project root or /tmp depending on environment
// Next.js API routes may not have write access to the project root in production,
// but for this codebase, we use a local file for persistence.
const STORE_FILE = path.join(process.cwd(), "suishield-memory.json");

interface MemoryStore {
  mappings: Record<string, StoredAnalysis>;
}

/**
 * Load the persistent memory store from disk
 */
export async function loadStore(): Promise<MemoryStore> {
  try {
    const data = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(data) as MemoryStore;
  } catch (error: unknown) {
    // If file doesn't exist, return empty store
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { mappings: {} };
    }
    console.error("Failed to load memory store:", error);
    return { mappings: {} };
  }
}

/**
 * Save the persistent memory store to disk
 */
export async function saveStore(store: MemoryStore): Promise<void> {
  try {
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save memory store:", error);
  }
}

/**
 * Set a mapping in the persistent store
 */
export async function setMapping(cacheKey: string, analysis: StoredAnalysis): Promise<void> {
  const store = await loadStore();
  store.mappings[cacheKey] = analysis;
  await saveStore(store);
}

/**
 * Get a mapping from the persistent store
 */
export async function getMapping(cacheKey: string): Promise<StoredAnalysis | null> {
  const store = await loadStore();
  return store.mappings[cacheKey] || null;
}
