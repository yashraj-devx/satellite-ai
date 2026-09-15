"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./routes/api"));
const sampleDataService_1 = require("./services/sampleDataService");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve generated samples and uploaded images from the same public tree used by the API.
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use('/api', api_1.default);
const startServer = async () => {
    await sampleDataService_1.SampleDataGenerator.generateSampleImages(path_1.default.join(__dirname, '..', 'public', 'samples'));
    app.listen(port, () => {
        console.log(`SatQuery AI backend listening on http://localhost:${port}`);
    });
};
startServer().catch(error => {
    console.error('Failed to initialize backend:', error);
    process.exitCode = 1;
});
