import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AnalysisController } from '../controllers/analysisController';

const router = Router();

// Multer storage setup
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `sat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Supported formats: JPG, PNG, WebP, GeoTIFF.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

// Routes
router.post('/upload', upload.array('images', 5), AnalysisController.uploadImages);
router.post('/query', AnalysisController.queryAnalysis);

// Specific analysis shortcuts
router.post('/analyze/water', (req, res) => {
  req.body.forcedIntent = 'WATER_DETECTION';
  return AnalysisController.queryAnalysis(req, res);
});

router.post('/analyze/vegetation', (req, res) => {
  req.body.forcedIntent = 'VEGETATION_ANALYSIS';
  return AnalysisController.queryAnalysis(req, res);
});

router.post('/analyze/change-detection', (req, res) => {
  req.body.forcedIntent = 'CHANGE_DETECTION';
  return AnalysisController.queryAnalysis(req, res);
});

router.post('/analyze/urban', (req, res) => {
  req.body.forcedIntent = 'URBAN_AREA_DETECTION';
  return AnalysisController.queryAnalysis(req, res);
});

router.post('/analyze/sar', (req, res) => {
  req.body.forcedIntent = 'SAR_ANALYSIS';
  return AnalysisController.queryAnalysis(req, res);
});

router.post('/analyze/landcover', (req, res) => {
  req.body.forcedIntent = 'LAND_COVER_CLASSIFICATION';
  return AnalysisController.queryAnalysis(req, res);
});

// Datasets & History
router.get('/samples', AnalysisController.getSamples);
router.get('/history', AnalysisController.getHistory);
router.get('/history/:id', AnalysisController.getHistoryItem);
router.delete('/history/:id', AnalysisController.deleteHistoryItem);

// Config & Health
router.get('/config/status', AnalysisController.getConfigStatus);
router.post('/config/test-api-key', AnalysisController.testApiKey);
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'SatQuery AI Engine' });
});

export default router;
