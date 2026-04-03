import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { edgeAIAvailability, isEdgeAIReady, smartSplitEdge, scanReceiptEdge } from '../utils/edgeAI';

describe('edgeAI.js', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('edgeAIAvailability', () => {
    it('returns "unavailable" when window.ai is not defined', async () => {
      vi.stubGlobal('window', { ai: undefined });
      const result = await edgeAIAvailability();
      expect(result).toBe('unavailable');
    });

    it('returns "readily" when availability() resolves as such', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: vi.fn().mockResolvedValue('readily'),
          },
        },
      });
      const result = await edgeAIAvailability();
      expect(result).toBe('readily');
    });

    it('falls back to capabilities() for older API', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: undefined,
            capabilities: vi.fn().mockResolvedValue({ available: 'readily' }),
          },
        },
      });
      const result = await edgeAIAvailability();
      expect(result).toBe('readily');
    });

    it('returns "unavailable" if capabilities shows "no"', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: undefined,
            capabilities: vi.fn().mockResolvedValue({ available: 'no' }),
          },
        },
      });
      const result = await edgeAIAvailability();
      expect(result).toBe('unavailable');
    });

    it('returns "unavailable" if the API throws', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: vi.fn().mockRejectedValue(new Error('API error')),
          },
        },
      });
      const result = await edgeAIAvailability();
      expect(result).toBe('unavailable');
    });
  });

  describe('isEdgeAIReady', () => {
    it('returns true when availability is "readily"', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: vi.fn().mockResolvedValue('readily'),
          },
        },
      });
      expect(await isEdgeAIReady()).toBe(true);
    });

    it('returns false for "after-download" or "unavailable"', async () => {
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            availability: vi.fn().mockResolvedValue('after-download'),
          },
        },
      });
      expect(await isEdgeAIReady()).toBe(false);
    });
  });

  describe('smartSplitEdge', () => {
    it('creates a session, prompts it, and destroys it', async () => {
      const mockDestroy = vi.fn();
      const mockPrompt = vi.fn().mockResolvedValue('{"split_plan": {}, "clarification_needed": false, "clarification_question": null}');
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            create: vi.fn().mockResolvedValue({ prompt: mockPrompt, destroy: mockDestroy }),
          },
        },
      });

      const result = await smartSplitEdge({ instruction: 'Split equally', membersInfo: 'Alice, Bob' });
      expect(mockPrompt).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
      expect(result).toHaveProperty('split_plan');
    });

    it('destroys session even if prompt throws', async () => {
      const mockDestroy = vi.fn();
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            create: vi.fn().mockResolvedValue({
              prompt: vi.fn().mockRejectedValue(new Error('Prompt failed')),
              destroy: mockDestroy,
            }),
          },
        },
      });

      await expect(smartSplitEdge({ instruction: 'Split', membersInfo: 'Alice' })).rejects.toThrow('Prompt failed');
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('scanReceiptEdge', () => {
    it('creates a session with image prompt and parses response', async () => {
      const mockDestroy = vi.fn();
      const ocrResponse = '{"merchant": "Starbucks", "date": "2024-01-01", "total_amount": 500, "items": []}';
      const mockPrompt = vi.fn().mockResolvedValue(ocrResponse);
      vi.stubGlobal('window', {
        ai: {
          languageModel: {
            create: vi.fn().mockResolvedValue({ prompt: mockPrompt, destroy: mockDestroy }),
          },
        },
      });

      const fakeFile = new Blob(['image data'], { type: 'image/jpeg' });
      const result = await scanReceiptEdge(fakeFile);

      expect(mockPrompt).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
      expect(result.merchant).toBe('Starbucks');
      expect(result.total_amount).toBe(500);
    });
  });
});
