"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const analysisController_1 = require("../controllers/analysisController");
const router = (0, express_1.Router)();
// Multer storage setup
const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `sat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid image file type. Supported formats: JPG, PNG, WebP, GeoTIFF.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter,
});
// Routes
router.post('/upload', upload.array('images', 5), analysisController_1.AnalysisController.uploadImages);
router.post('/query', analysisController_1.AnalysisController.queryAnalysis);
// Specific analysis shortcuts
router.post('/analyze/water', (req, res) => {
    req.body.forcedIntent = 'WATER_DETECTION';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
router.post('/analyze/vegetation', (req, res) => {
    req.body.forcedIntent = 'VEGETATION_ANALYSIS';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
router.post('/analyze/change-detection', (req, res) => {
    req.body.forcedIntent = 'CHANGE_DETECTION';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
router.post('/analyze/urban', (req, res) => {
    req.body.forcedIntent = 'URBAN_AREA_DETECTION';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
router.post('/analyze/sar', (req, res) => {
    req.body.forcedIntent = 'SAR_ANALYSIS';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
router.post('/analyze/landcover', (req, res) => {
    req.body.forcedIntent = 'LAND_COVER_CLASSIFICATION';
    return analysisController_1.AnalysisController.queryAnalysis(req, res);
});
// Datasets & History
router.get('/samples', analysisController_1.AnalysisController.getSamples);
router.get('/history', analysisController_1.AnalysisController.getHistory);
router.get('/history/:id', analysisController_1.AnalysisController.getHistoryItem);
router.delete('/history/:id', analysisController_1.AnalysisController.deleteHistoryItem);
// Config & Health
router.get('/config/status', analysisController_1.AnalysisController.getConfigStatus);
router.post('/config/test-api-key', analysisController_1.AnalysisController.testApiKey);
router.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'SatQuery AI Engine' });
});
exports.default = router;
