import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApiKeyModal } from '../../src/components/ApiKeyModal';

describe('ApiKeyModal Component DOM Tests', () => {
  it('should render modal dialog when isOpen is true', () => {
    const handleClose = vi.fn();
    const handleSaveKey = vi.fn();

    render(
      <ApiKeyModal
        isOpen={true}
        onClose={handleClose}
        apiKey=""
        onSaveApiKey={handleSaveKey}
      />
    );

    // Verify Modal Title
    expect(screen.getByText('Google Gemini API Settings')).toBeDefined();

    // Verify API Key Input Field
    const input = screen.getByPlaceholderText(/AIzaSy.../i);
    expect(input).toBeDefined();

    // Type API key into input
    fireEvent.change(input, { target: { value: 'AIzaSyTestApiKey12345678901234567890' } });

    // Click Save API Key button
    const saveBtn = screen.getByText(/Save Settings/i).closest('button');
    if (saveBtn) {
      fireEvent.click(saveBtn);
      expect(handleSaveKey).toHaveBeenCalledWith('AIzaSyTestApiKey12345678901234567890');
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('should not render modal dialog when isOpen is false', () => {
    render(
      <ApiKeyModal
        isOpen={false}
        onClose={vi.fn()}
        apiKey=""
        onSaveApiKey={vi.fn()}
      />
    );

    expect(screen.queryByPlaceholderText(/AIzaSy.../i)).toBeNull();
  });
});
