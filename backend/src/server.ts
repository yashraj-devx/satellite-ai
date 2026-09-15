// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';
import { SampleDataGenerator } from './services/sampleDataService';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve generated samples and uploaded images from the same public tree used by the API.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRouter);

const startServer = async (): Promise<void> => {
  await SampleDataGenerator.generateSampleImages(path.join(__dirname, '..', 'public', 'samples'));
  app.listen(port, () => {
    console.log(`SatQuery AI backend listening on http://localhost:${port}`);
  });
};

startServer().catch(error => {
  console.error('Failed to initialize backend:', error);
  process.exitCode = 1;
});
