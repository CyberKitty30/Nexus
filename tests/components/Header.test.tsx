import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../../src/components/Header';
import { SUPPORTED_COUNTRIES } from '../../src/data/jurisdictions';

describe('Header Component DOM Tests', () => {
  const mockCountry = SUPPORTED_COUNTRIES['IN'];

  it('should render brand title, jurisdiction badge, and export action buttons', () => {
    const handleOpenJurisdiction = vi.fn();
    const handleOpenApiKey = vi.fn();
    const handleExportReport = vi.fn();

    render(
      <Header
        activeCountry={mockCountry}
        onOpenJurisdictionModal={handleOpenJurisdiction}
        onOpenApiKeyModal={handleOpenApiKey}
        onExportReport={handleExportReport}
        hasApiKey={false}
      />
    );

    // Verify title rendering
    expect(screen.getByText('NEXUS AI')).toBeDefined();

    // Verify jurisdiction badge rendering
    expect(screen.getByText(/India/i)).toBeDefined();

    // Click Jurisdiction selector button
    const jurisdictionBtn = screen.getByText(/India/i).closest('button');
    if (jurisdictionBtn) {
      fireEvent.click(jurisdictionBtn);
      expect(handleOpenJurisdiction).toHaveBeenCalledTimes(1);
    }

    // Click Export Executive Report button
    const exportBtn = screen.getByText('Export Audit Report').closest('button');
    if (exportBtn) {
      fireEvent.click(exportBtn);
      expect(handleExportReport).toHaveBeenCalledTimes(1);
    }
  });

  it('should display active API key badge when key is set', () => {
    render(
      <Header
        activeCountry={mockCountry}
        onOpenJurisdictionModal={vi.fn()}
        onOpenApiKeyModal={vi.fn()}
        onExportReport={vi.fn()}
        hasApiKey={true}
      />
    );

    expect(screen.getByText('Gemini 1.5 Active')).toBeDefined();
  });
});
