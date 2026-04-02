import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../lib/api';

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    // Clear console error to keep test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('performs a GET request with correct headers', async () => {
    const mockResponse = { data: 'test-data' };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await api.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test-endpoint'),
        expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        })
    );
    expect(result).toEqual(mockResponse);
  });

  it('includes Authorization header if token exists', async () => {
    localStorage.getItem.mockReturnValue('mock-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await api.get('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    );
  });

  it('performs a POST request with body', async () => {
    const postBody = { name: 'New Item' };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1, ...postBody }),
    });

    await api.post('/items', postBody);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postBody),
      })
    );
  });

  it('throws error on non-ok response', async () => {
    const errorDetail = 'Invalid request';
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: errorDetail }),
    });

    await expect(api.get('/bad-request')).rejects.toThrow(errorDetail);
  });

  it('handles 204 No Content', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await api.delete('/item/1');
    expect(result).toBeNull();
  });

  it('handles FormData in requests', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'text/plain' }));

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    // When passing FormData, we shouldn't manually set Content-Type
    await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: formData,
      })
    );
  });
});
