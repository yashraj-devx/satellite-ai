// src/controllers/queryController.ts
import { Request, Response } from 'express';
import { processImageAndPrompt } from '../services/analysisService';

/**
 * Handles the /api/query POST request.
 * Expects an image buffer and a natural language prompt.
 * Returns a JSON response containing analysis results.
 */
export async function handleQuery(imageBuffer: Buffer, prompt: string) {
  try {
    // Delegate to the analysis service which will perform image processing
    // and interact with the generative AI model.
    const result = await processImageAndPrompt(imageBuffer, prompt);
    return result;
  } catch (error) {
    console.error('Error in handleQuery:', error);
    // Propagate the error upward; the route will catch and send a 500.
    throw error;
  }
}
