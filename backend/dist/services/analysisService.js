"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImageAndPrompt = processImageAndPrompt;
// src/services/analysisService.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const aiService_1 = require("./aiService");
const imageProcessing_1 = require("./imageProcessing");
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
async function processImageAndPrompt(imageBuffer, prompt) {
    // Ensure a temp directory exists for intermediate image files.
    const tmpDir = path_1.default.resolve(__dirname, '../../tmp');
    if (!fs_1.default.existsSync(tmpDir)) {
        fs_1.default.mkdirSync(tmpDir, { recursive: true });
    }
    // Write the incoming buffer to a uniquely‑named PNG file.
    const tempFile = path_1.default.join(tmpDir, `${(0, uuid_1.v4)()}.png`);
    fs_1.default.writeFileSync(tempFile, imageBuffer);
    // Determine the remote‑sensing intent.
    const intent = aiService_1.AIService.classifyIntent(prompt);
    // Dispatch to the appropriate algorithmic service.
    let algoResult;
    switch (intent) {
        case 'WATER_DETECTION':
        case 'FLOOD_ANALYSIS':
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeWater(tempFile);
            break;
        case 'VEGETATION_ANALYSIS':
        case 'AGRICULTURE_ANALYSIS':
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeVegetation(tempFile);
            break;
        case 'URBAN_AREA_DETECTION':
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeUrban(tempFile);
            break;
        case 'SAR_ANALYSIS':
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeSAR(tempFile);
            break;
        case 'LAND_COVER_CLASSIFICATION':
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeLandCover(tempFile);
            break;
        case 'CHANGE_DETECTION':
        case 'IMAGE_COMPARISON':
            // Change detection requires two images; in the single‑image shortcut we fallback.
            // Users should call the dedicated /analyze/change‑detection endpoint for dual images.
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeWater(tempFile);
            break;
        default:
            // Generic visual question – run a basic water detection as a safe default.
            algoResult = await imageProcessing_1.ImageProcessingService.analyzeWater(tempFile);
    }
    // Run the Vision‑Language AI to synthesize a response.
    const aiResponse = await aiService_1.AIService.analyzeWithAI(prompt, intent, algoResult, { primaryPath: tempFile }, {});
    // Clean up the temporary file to avoid storage bloat.
    try {
        fs_1.default.unlinkSync(tempFile);
    }
    catch (_) {
        // Non‑critical if cleanup fails.
    }
    // Return a combined object – callers can merge this with the full AnalysisResult.
    return {
        ...aiResponse,
        metrics: algoResult.metrics,
        layers: algoResult.layers,
    };
}
