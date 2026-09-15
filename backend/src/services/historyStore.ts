import fs from 'fs';
import path from 'path';
import { AnalysisResult, HistoryEntry } from '../types';

export class HistoryStore {
  private static filePath = path.join(__dirname, '../../data/history.json');

  private static ensureDataDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  public static getAll(): HistoryEntry[] {
    try {
      this.ensureDataDir();
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const items: HistoryEntry[] = JSON.parse(raw);
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.error('Failed to read history:', err);
      return [];
    }
  }

  public static getById(id: string): HistoryEntry | undefined {
    const all = this.getAll();
    return all.find(item => item.id === id);
  }

  public static save(result: AnalysisResult, imageNames: string[], thumbnailUrl: string): HistoryEntry {
    this.ensureDataDir();
    const all = this.getAll();
    
    const entry: HistoryEntry = {
      id: result.id,
      timestamp: result.timestamp,
      query: result.query,
      intent: result.intent,
      summary: result.summary,
      thumbnailUrl: thumbnailUrl || result.images.primary?.url || '/samples/sundarbans_sentinel2.jpg',
      confidence: result.confidence,
      primaryMetric: `${result.metrics.primaryMetricName}: ${result.metrics.primaryMetricValue}`,
      imageNames,
      result,
    };

    all.unshift(entry);
    // Keep last 50 entries
    const trimmed = all.slice(0, 50);
    fs.writeFileSync(this.filePath, JSON.stringify(trimmed, null, 2), 'utf-8');
    return entry;
  }

  public static delete(id: string): boolean {
    this.ensureDataDir();
    const all = this.getAll();
    const filtered = all.filter(item => item.id !== id);
    if (filtered.length !== all.length) {
      fs.writeFileSync(this.filePath, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  }

  public static clear(): void {
    this.ensureDataDir();
    fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
  }
}
