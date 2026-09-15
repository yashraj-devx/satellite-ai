"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuery = handleQuery;
const analysisService_1 = require("../services/analysisService");
/**
 * Handles the /api/query POST request.
 * Expects an image buffer and a natural language prompt.
 * Returns a JSON response containing analysis results.
 */
async function handleQuery(imageBuffer, prompt) {
    try {
        // Delegate to the analysis service which will perform image processing
        // and interact with the generative AI model.
        const result = await (0, analysisService_1.processImageAndPrompt)(imageBuffer, prompt);
        return result;
    }
    catch (error) {
        console.error('Error in handleQuery:', error);
        // Propagate the error upward; the route will catch and send a 500.
        throw error;
    }
}
