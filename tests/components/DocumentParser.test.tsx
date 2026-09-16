import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentParser } from '../../src/components/DocumentParser';

describe('DocumentParser Component DOM & Interactivity Tests', () => {
  it('should render document AI upload dropzone and preset contract selectors', () => {
    const handleParseText = vi.fn();
    const handleLoadPreset = vi.fn();

    render(
      <DocumentParser
        onParseText={handleParseText}
        onLoadPreset={handleLoadPreset}
        isAuditing={false}
        currentFileName="SAMPLE CONTRACT"
      />
    );

    // Verify Title and Subtitle
    expect(screen.getByText(/Document AI & OCR Parsing Engine/i)).toBeDefined();

    // Verify Preset Buttons exist
    const presetElements = screen.getAllByText(/HIGH-RISK/i);
    expect(presetElements.length).toBeGreaterThan(0);

    // Click Preset contract button
    const presetBtn = presetElements[0].closest('button');
    if (presetBtn) {
      fireEvent.click(presetBtn);
      expect(handleLoadPreset).toHaveBeenCalled();
    }
  });

  it('should display auditing state when isAuditing is true', () => {
    render(
      <DocumentParser
        onParseText={vi.fn()}
        onLoadPreset={vi.fn()}
        isAuditing={true}
        currentFileName="AUDITING CONTRACT"
      />
    );

    const auditElements = screen.getAllByText(/Auditing.../i);
    expect(auditElements.length).toBeGreaterThan(0);
  });
});
