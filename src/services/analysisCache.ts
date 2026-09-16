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
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries = 50;
  private ttlMs = 1000 * 60 * 30; // 30 minutes TTL

  /**
   * Generates a deterministic hash key for document text and jurisdiction
   */
  private generateKey(text: string, jurisdiction: string): string {
    let hash = 0;
    const combined = `${jurisdiction}:${text}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `analysis_${hash}_${combined.length}`;
  }

  /**
   * Retrieve cached result if available and fresh
   */
  public get<T>(text: string, jurisdiction: string): T | null {
    const key = this.generateKey(text, jurisdiction);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store analysis result in cache
   */
  public set<T>(text: string, jurisdiction: string, data: T): void {
    const key = this.generateKey(text, jurisdiction);
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache entries
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const analysisCache = new AnalysisCacheService();
