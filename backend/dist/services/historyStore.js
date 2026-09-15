"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class HistoryStore {
    static filePath = path_1.default.join(__dirname, '../../data/history.json');
    static ensureDataDir() {
        const dir = path_1.default.dirname(this.filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.filePath)) {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        }
    }
    static getAll() {
        try {
            this.ensureDataDir();
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            const items = JSON.parse(raw);
            return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        catch (err) {
            console.error('Failed to read history:', err);
            return [];
        }
    }
    static getById(id) {
        const all = this.getAll();
        return all.find(item => item.id === id);
    }
    static save(result, imageNames, thumbnailUrl) {
        this.ensureDataDir();
        const all = this.getAll();
        const entry = {
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
        fs_1.default.writeFileSync(this.filePath, JSON.stringify(trimmed, null, 2), 'utf-8');
        return entry;
    }
    static delete(id) {
        this.ensureDataDir();
        const all = this.getAll();
        const filtered = all.filter(item => item.id !== id);
        if (filtered.length !== all.length) {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(filtered, null, 2), 'utf-8');
            return true;
        }
        return false;
    }
    static clear() {
        this.ensureDataDir();
        fs_1.default.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
}
exports.HistoryStore = HistoryStore;
