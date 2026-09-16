import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardOverview } from '../../src/components/DashboardOverview';
import { SUPPORTED_COUNTRIES } from '../../src/data/jurisdictions';
import { SAMPLE_CONTRACT_PRESETS } from '../../src/data/sampleContracts';

describe('DashboardOverview Component DOM & Metric Tests', () => {
  const mockCountry = SUPPORTED_COUNTRIES['IN'];
  const mockClauses = SAMPLE_CONTRACT_PRESETS[0].clauses;

  it('should render bento metrics grid, remediation scores, and priority clauses', () => {
    const handleSelectClause = vi.fn();

    render(
      <DashboardOverview
        clauses={mockClauses}
        activeCountry={mockCountry}
        onSelectClause={handleSelectClause}
        beforeScore={20}
        afterScore={85}
      />
    );

    // Verify Remediation Score metrics
    expect(screen.getByText('Remediation Score')).toBeDefined();
    expect(screen.getByText('85/100')).toBeDefined();

    // Verify Active Country Badge
    const indiaBadges = screen.getAllByText(/India/i);
    expect(indiaBadges.length).toBeGreaterThan(0);

    // Verify Top Priority Action Required Section
    expect(screen.getByText(/Top Priority Risk Items Requiring Advocate Review/i)).toBeDefined();
  });
});
