// src/services/analysisService.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from './aiService';
import { ImageProcessingService } from './imageProcessing';
import { RemoteSensingIntent } from '../types';

/**
 * Core helper to process a raw image buffer together with a natural language prompt.
 * It performs:
 *   1. Saves the buffer to a temporary file within the project.
 *   2. Classifies the user intent using the rule‑based AIService.
 *   3. Executes the matching algorithmic analysis.
 *   4. Runs the multimodal Gemini reasoning (or demo fallback) to generate a
 *      natural language answer.
 * Returns a unified result that can be merged into the final AnalysisResult.
 */
export async function processImageAndPrompt(imageBuffer: Buffer, prompt: string) {
  // Ensure a temp directory exists for intermediate image files.
  const tmpDir = path.resolve(__dirname, '../../tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Write the incoming buffer to a uniquely‑named PNG file.
  const tempFile = path.join(tmpDir, `${uuidv4()}.png`);
  fs.writeFileSync(tempFile, imageBuffer);

  // Determine the remote‑sensing intent.
  const intent: RemoteSensingIntent = AIService.classifyIntent(prompt);

  // Dispatch to the appropriate algorithmic service.
  let algoResult;
  switch (intent) {
    case 'WATER_DETECTION':
    case 'FLOOD_ANALYSIS':
      algoResult = await ImageProcessingService.analyzeWater(tempFile);
      break;
    case 'VEGETATION_ANALYSIS':
    case 'AGRICULTURE_ANALYSIS':
      algoResult = await ImageProcessingService.analyzeVegetation(tempFile);
      break;
    case 'URBAN_AREA_DETECTION':
      algoResult = await ImageProcessingService.analyzeUrban(tempFile);
      break;
    case 'SAR_ANALYSIS':
      algoResult = await ImageProcessingService.analyzeSAR(tempFile);
      break;
    case 'LAND_COVER_CLASSIFICATION':
      algoResult = await ImageProcessingService.analyzeLandCover(tempFile);
      break;
    case 'CHANGE_DETECTION':
    case 'IMAGE_COMPARISON':
      // Change detection requires two images; in the single‑image shortcut we fallback.
      // Users should call the dedicated /analyze/change‑detection endpoint for dual images.
      algoResult = await ImageProcessingService.analyzeWater(tempFile);
      break;
    default:
      // Generic visual question – run a basic water detection as a safe default.
      algoResult = await ImageProcessingService.analyzeWater(tempFile);
  }

  // Run the Vision‑Language AI to synthesize a response.
  const aiResponse = await AIService.analyzeWithAI(
    prompt,
    intent,
    algoResult,
    { primaryPath: tempFile },
    {}
  );

  // Clean up the temporary file to avoid storage bloat.
  try {
    fs.unlinkSync(tempFile);
  } catch (_) {
    // Non‑critical if cleanup fails.
  }

  // Return a combined object – callers can merge this with the full AnalysisResult.
  return {
    ...aiResponse,
    metrics: algoResult.metrics,
    layers: algoResult.layers,
  };
}
