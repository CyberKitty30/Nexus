/**
 * AnalysisCache Service
 * High-performance, in-memory LRU cache for document analysis & OCR results
 * to ensure maximum client-side efficiency and instantaneous response times.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AnalysisCacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries = 50;
  private readonly ttlMs = 1000 * 60 * 30; // 30 minutes TTL

  /**
   * Generates a deterministic, non-negative hash key for document text and jurisdiction
   */
  private generateKey(text: string, jurisdiction: string): string {
    let hash = 0;
    const combined = `${jurisdiction}:${text}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash >>>= 0; // Convert to unsigned 32-bit integer
    }
    return `analysis_${hash}_${combined.length}`;
  }

  /**
   * Retrieve cached result if available and fresh.
   * Refreshes insertion order to maintain true LRU behavior.
   */
  public get<T>(text: string, jurisdiction: string): T | null {
    const key = this.generateKey(text, jurisdiction);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position in Map to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data as T;
  }

  /**
   * Store analysis result in cache with LRU eviction policy.
   */
  public set<T>(text: string, jurisdiction: string, data: T): void {
    const key = this.generateKey(text, jurisdiction);

    // If key already exists, delete so it gets re-added at the end (most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest (least recently used) entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const analysisCache = new AnalysisCacheService();
