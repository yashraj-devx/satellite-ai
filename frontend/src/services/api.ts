import { AnalysisResult, ConfigStatus, HistoryEntry, ImageMetadata, RemoteSensingIntent, SampleDataset } from '../types';

const API_BASE = '/api';

export class ApiService {
  /**
   * Fetch sample datasets
   */
  public static async getSamples(): Promise<SampleDataset[]> {
    try {
      const res = await fetch(`${API_BASE}/samples`);
      if (!res.ok) throw new Error('Failed to load sample datasets');
      const data = await res.json();
      return data.samples || [];
    } catch (err) {
      console.error('getSamples error:', err);
      return [];
    }
  }

  /**
   * Upload image files
   */
  public static async uploadImages(files: File[], role: 'primary' | 'before' | 'after' | 'sar' = 'primary'): Promise<ImageMetadata[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('role', role);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload images');
    }

    const data = await res.json();
    return data.images || [];
  }

  /**
   * Submit natural language remote sensing query
   */
  public static async submitQuery(params: {
    query: string;
    images?: {
      primary?: ImageMetadata;
      before?: ImageMetadata;
      after?: ImageMetadata;
      sar?: ImageMetadata;
    };
    sampleId?: string;
    forcedIntent?: RemoteSensingIntent;
  }): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || err.details || 'Remote sensing analysis failed');
    }

    const data = await res.json();
    return data.result;
  }

  /**
   * Fetch analysis history
   */
  public static async getHistory(): Promise<HistoryEntry[]> {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      return data.history || [];
    } catch (err) {
      console.error('getHistory error:', err);
      return [];
    }
  }

  /**
   * Delete an item from history
   */
  public static async deleteHistoryItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  /**
   * Fetch backend configuration & AI status
   */
  public static async getConfigStatus(): Promise<ConfigStatus> {
    try {
      const res = await fetch(`${API_BASE}/config/status`);
      if (!res.ok) throw new Error('Failed to fetch config status');
      return await res.json();
    } catch (err) {
      return {
        demoMode: true,
        apiConfigured: false,
        provider: 'Google Gemini Vision AI',
        model: 'gemini-3.6-flash',
        version: '1.0.0 (ISRO SIH #26167 Edition)',
      };
    }
  }

  /**
   * Test a Gemini API key live
   */
  public static async testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/config/test-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return await res.json();
  }
}
