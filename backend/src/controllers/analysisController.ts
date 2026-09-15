import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIService } from '../services/aiService';
import { GeoMetadataService } from '../services/geoMetadata';
import { HistoryStore } from '../services/historyStore';
import { ImageProcessingService } from '../services/imageProcessing';
import { SampleDataService } from '../services/sampleDataService';
import { AnalysisResult, ImageMetadata, RemoteSensingIntent } from '../types';

export class AnalysisController {
  /**
   * Helper to resolve local filesystem path from URL or relative path
   */
  private static resolveLocalPath(urlOrPath: string): string | undefined {
    if (!urlOrPath) return undefined;
    if (fs.existsSync(urlOrPath)) return urlOrPath;

    // Handle /samples/filename.jpg
    if (urlOrPath.startsWith('/samples/')) {
      const samplePath = path.join(__dirname, '../../public', urlOrPath);
      if (fs.existsSync(samplePath)) return samplePath;
      const rootSamplePath = path.join(__dirname, '../../../frontend/public', urlOrPath);
      if (fs.existsSync(rootSamplePath)) return rootSamplePath;
    }

    // Handle /uploads/filename.jpg
    if (urlOrPath.startsWith('/uploads/')) {
      const uploadPath = path.join(__dirname, '../../public', urlOrPath);
      if (fs.existsSync(uploadPath)) return uploadPath;
    }

    return undefined;
  }

  /**
   * POST /api/upload
   */
  public static async uploadImages(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      if (!files || (Array.isArray(files) && files.length === 0)) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const fileList: Express.Multer.File[] = Array.isArray(files) 
        ? files 
        : Object.values(files).flat();

      const metadataList: ImageMetadata[] = [];

      for (const file of fileList) {
        const url = `/uploads/${file.filename}`;
        const role = (req.body.role as any) || 'primary';
        const meta = await GeoMetadataService.extractMetadata(
          file.path,
          file.originalname,
          url,
          file.size,
          role
        );
        metadataList.push(meta);
      }

      res.json({
        success: true,
        count: metadataList.length,
        images: metadataList,
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to process uploaded images', details: err.message });
    }
  }

  /**
   * POST /api/query - Main natural language assistant pipeline
   */
  public static async queryAnalysis(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    try {
      const { query, images, sampleId, forcedIntent } = req.body;

      if (!query && !forcedIntent) {
        res.status(400).json({ error: 'Query or analysis intent is required' });
        return;
      }

      let primaryImage: ImageMetadata | undefined = images?.primary;
      let beforeImage: ImageMetadata | undefined = images?.before;
      let afterImage: ImageMetadata | undefined = images?.after;
      let sarImage: ImageMetadata | undefined = images?.sar;

      // If sampleId is provided, populate images from sample dataset
      if (sampleId) {
        const samples = SampleDataService.getSamples();
        const sample = samples.find(s => s.id === sampleId);
        if (sample) {
          if (sample.images.primary && !primaryImage) {
            primaryImage = {
              id: `sample_${sample.id}_primary`,
              filename: path.basename(sample.images.primary),
              path: sample.images.primary,
              url: sample.images.primary,
              width: 512,
              height: 512,
              format: 'JPEG',
              channels: 3,
              sizeBytes: 150000,
              uploadedAt: new Date().toISOString(),
              geospatial: sample.geospatial,
              role: 'primary',
            };
          }
          if (sample.images.before && !beforeImage) {
            beforeImage = {
              id: `sample_${sample.id}_before`,
              filename: path.basename(sample.images.before),
              path: sample.images.before,
              url: sample.images.before,
              width: 512,
              height: 512,
              format: 'JPEG',
              channels: 3,
              sizeBytes: 150000,
              uploadedAt: new Date().toISOString(),
              geospatial: sample.geospatial,
              role: 'before',
            };
          }
          if (sample.images.after && !afterImage) {
            afterImage = {
              id: `sample_${sample.id}_after`,
              filename: path.basename(sample.images.after),
              path: sample.images.after,
              url: sample.images.after,
              width: 512,
              height: 512,
              format: 'JPEG',
              channels: 3,
              sizeBytes: 150000,
              uploadedAt: new Date().toISOString(),
              geospatial: sample.geospatial,
              role: 'after',
            };
          }
          if (sample.images.sar && !sarImage) {
            sarImage = {
              id: `sample_${sample.id}_sar`,
              filename: path.basename(sample.images.sar),
              path: sample.images.sar,
              url: sample.images.sar,
              width: 512,
              height: 512,
              format: 'JPEG',
              channels: 3,
              sizeBytes: 150000,
              uploadedAt: new Date().toISOString(),
              geospatial: sample.geospatial,
              role: 'sar',
            };
          }
        }
      }

      // Determine intent
      const hasDual = Boolean(beforeImage && afterImage);
      const hasSar = Boolean(sarImage);
      const intent: RemoteSensingIntent = forcedIntent || AIService.classifyIntent(query || '', hasDual, hasSar);

      // Resolve disk paths
      const primaryDiskPath = AnalysisController.resolveLocalPath(primaryImage?.path || primaryImage?.url || '');
      const beforeDiskPath = AnalysisController.resolveLocalPath(beforeImage?.path || beforeImage?.url || '');
      const afterDiskPath = AnalysisController.resolveLocalPath(afterImage?.path || afterImage?.url || '');
      const sarDiskPath = AnalysisController.resolveLocalPath(sarImage?.path || sarImage?.url || '');

      const activeDiskPath = primaryDiskPath || beforeDiskPath || sarDiskPath;

      if (!activeDiskPath) {
        res.status(400).json({ error: 'Please upload or select a satellite image to analyze.' });
        return;
      }

      // Step 1: Run Algorithmic Image Analysis
      const algoResult = await ImageProcessingService.executeAnalysis(intent, {
        primaryPath: primaryDiskPath,
        beforePath: beforeDiskPath,
        afterPath: afterDiskPath,
        sarPath: sarDiskPath,
      });

      // Step 2: Run Multimodal AI Vision-Language reasoning or contextual fallback
      const aiResult = await AIService.analyzeWithAI(
        query || `Execute ${intent} analysis`,
        intent,
        algoResult,
        {
          primaryPath: primaryDiskPath,
          beforePath: beforeDiskPath,
          afterPath: afterDiskPath,
          sarPath: sarDiskPath,
        },
        {
          sensor: primaryImage?.geospatial.sensor || sarImage?.geospatial.sensor,
          locationName: primaryImage?.geospatial.hasCoordinates ? 'Surveyed Sector' : undefined,
          acquisitionDate: primaryImage?.geospatial.acquisitionDate,
        }
      );

      const processingTimeMs = Date.now() - startTime;

      // Construct final unified result
      const finalResult: AnalysisResult = {
        id: `analysis_${Date.now()}_${uuidv4().substring(0, 8)}`,
        timestamp: new Date().toISOString(),
        query: query || `Algorithmic ${intent.replace(/_/g, ' ')}`,
        intent,
        confidence: aiResult.confidence,
        summary: aiResult.summary,
        explanation: aiResult.explanation,
        findings: aiResult.findings,
        metrics: algoResult.metrics,
        layers: algoResult.layers,
        recommendedVisualization: aiResult.recommendedVisualization,
        sourceType: aiResult.sourceType,
        processingTimeMs,
        images: {
          primary: primaryImage,
          before: beforeImage,
          after: afterImage,
          sar: sarImage,
        },
        geospatial: primaryImage?.geospatial || sarImage?.geospatial || beforeImage?.geospatial,
      };

      // Save to history store
      const imageNames = [
        primaryImage?.filename,
        beforeImage?.filename,
        afterImage?.filename,
        sarImage?.filename,
      ].filter(Boolean) as string[];

      const thumb = primaryImage?.url || beforeImage?.url || sarImage?.url || '/samples/sundarbans_sentinel2.jpg';
      HistoryStore.save(finalResult, imageNames, thumb);

      res.json({
        success: true,
        result: finalResult,
      });
    } catch (err: any) {
      console.error('Query analysis error:', err);
      res.status(500).json({ error: 'Failed to complete satellite analysis', details: err.message });
    }
  }

  /**
   * GET /api/samples
   */
  public static getSamples(_req: Request, res: Response): void {
    const samples = SampleDataService.getSamples();
    res.json({ success: true, count: samples.length, samples });
  }

  /**
   * GET /api/history
   */
  public static getHistory(_req: Request, res: Response): void {
    const history = HistoryStore.getAll();
    res.json({ success: true, count: history.length, history });
  }

  /**
   * GET /api/history/:id
   */
  public static getHistoryItem(req: Request, res: Response): void {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = HistoryStore.getById(id);
    if (!item) {
      res.status(404).json({ error: 'Analysis record not found' });
      return;
    }
    res.json({ success: true, entry: item });
  }

  /**
   * DELETE /api/history/:id
   */
  public static deleteHistoryItem(req: Request, res: Response): void {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = HistoryStore.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Analysis record not found' });
      return;
    }
    res.json({ success: true, message: 'Record deleted' });
  }

  /**
   * POST /api/config/test-api-key
   */
  public static async testApiKey(req: Request, res: Response): Promise<void> {
    const { apiKey } = req.body;
    if (!apiKey) {
      res.status(400).json({ success: false, message: 'API key is required' });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const result = await model.generateContent('Respond with only "OK" to confirm ISRO satellite AI connection.');
      const text = result.response.text().trim();
      res.json({ success: true, message: 'Gemini API key is valid and connected!', response: text });
    } catch (err: any) {
      res.status(400).json({ success: false, message: 'API key validation failed', error: err.message });
    }
  }

  /**
   * GET /api/config/status
   */
  public static getConfigStatus(_req: Request, res: Response): void {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey !== 'your_api_key_here' && apiKey.trim().length > 10);
    
    res.json({
      demoMode: !isConfigured,
      apiConfigured: isConfigured,
      provider: 'Google Gemini Vision AI',
      model: 'gemini-3.6-flash',
      version: '1.0.0 (ISRO SIH #26167 Edition)',
    });
  }
}
