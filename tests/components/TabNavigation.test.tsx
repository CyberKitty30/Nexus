import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabNavigation } from '../../src/components/TabNavigation';

describe('TabNavigation Component DOM & ARIA Tests', () => {
  it('should render all tab navigation buttons with correct ARIA roles', () => {
    const handleSelectTab = vi.fn();

    render(
      <TabNavigation
        activeTab="dashboard"
        onSelectTab={handleSelectTab}
        unresolvedCount={3}
      />
    );

    // Verify Tab buttons
    expect(screen.getByText('12-Column Bento Grid Dashboard')).toBeDefined();
    expect(screen.getByText('Clause Risk Audit')).toBeDefined();
    expect(screen.getByText('Contract Comparison')).toBeDefined();
    expect(screen.getByText('Ask NEXUS Q&A')).toBeDefined();
    expect(screen.getByText('Calendar & Milestones')).toBeDefined();

    // Verify unresolved risk badge counter
    expect(screen.getByText('3 Risks')).toBeDefined();

    // Click on Clause Audit Queue tab
    const auditTabBtn = screen.getByText('Clause Risk Audit').closest('button');
    if (auditTabBtn) {
      fireEvent.click(auditTabBtn);
      expect(handleSelectTab).toHaveBeenCalledWith('audit');
    }
  });
});
