import { describe, it, expect, beforeEach } from 'vitest';
import { analysisCache } from '../src/services/analysisCache';

describe('AnalysisCache LRU Cache Unit Tests', () => {
  beforeEach(() => {
    analysisCache.clear();
  });

  it('should return null for cache miss', () => {
    const result = analysisCache.get('uncached document text', 'IN');
    expect(result).toBeNull();
  });

  it('should store and retrieve analysis result on cache hit', () => {
    const text = 'Sample Contract Clause text for caching test.';
    const jurisdiction = 'US';
    const mockData = { fileName: 'test.pdf', clauses: [{ id: '1' }] };

    analysisCache.set(text, jurisdiction, mockData);

    const retrieved = analysisCache.get(text, jurisdiction);
    expect(retrieved).toEqual(mockData);
  });

  it('should distinguish cache entries by jurisdiction code', () => {
    const text = 'Identical contract text snippet';
    const mockIN = { jurisdiction: 'IN', score: 90 };
    const mockEU = { jurisdiction: 'EU', score: 40 };

    analysisCache.set(text, 'IN', mockIN);
    analysisCache.set(text, 'EU', mockEU);

    expect(analysisCache.get(text, 'IN')).toEqual(mockIN);
    expect(analysisCache.get(text, 'EU')).toEqual(mockEU);
  });

  it('should clear all entries when clear() is called', () => {
    analysisCache.set('Doc A', 'IN', { id: 'A' });
    analysisCache.set('Doc B', 'EU', { id: 'B' });

    analysisCache.clear();

    expect(analysisCache.get('Doc A', 'IN')).toBeNull();
    expect(analysisCache.get('Doc B', 'EU')).toBeNull();
  });
});
