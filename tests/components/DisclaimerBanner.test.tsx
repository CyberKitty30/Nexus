import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { SUPPORTED_COUNTRIES } from '../../src/data/jurisdictions';

describe('DisclaimerBanner Component DOM & Accessibility Tests', () => {
  it('should render mandatory legal advice disclaimer banner with jurisdiction notice', () => {
    const country = SUPPORTED_COUNTRIES['IN'];

    render(<DisclaimerBanner country={country} />);

    // Verify statutory disclaimer notice
    expect(screen.getByText(/LEGAL DISCLAIMER:/i)).toBeDefined();
    expect(screen.getByText(/India/i)).toBeDefined();
    expect(screen.getByText(/ZERO-HALLUCINATION LEGAL GROUNDING/i)).toBeDefined();
  });
});
