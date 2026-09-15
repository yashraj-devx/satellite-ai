import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { SampleDataset } from '../types';

export class SampleDataGenerator {
  /**
   * Generates realistic synthetic satellite imagery for out-of-the-box demo & tests
   */
  public static async generateSampleImages(outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const size = 512;

    // 1. Sundarbans Optical (Estuary & Mangroves)
    const sundarbansPath = path.join(outputDir, 'sundarbans_sentinel2.jpg');
    if (!fs.existsSync(sundarbansPath)) {
      const buf = Buffer.alloc(size * size * 3);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 3;
          // Sine-wave river estuary
          const river1 = Math.sin(x * 0.02 + y * 0.015) * 50 + 200;
          const river2 = Math.cos(x * 0.03 - y * 0.02) * 60 + 340;
          const isWater = Math.abs(y - river1) < 32 || Math.abs(x - river2) < 28 || (x > 380 && y > 350);

          if (isWater) {
            // Water: Deep Cyan/Blue with slight sediment
            buf[idx] = 15 + Math.floor(Math.random() * 10);     // R
            buf[idx + 1] = 65 + Math.floor(Math.random() * 20); // G
            buf[idx + 2] = 120 + Math.floor(Math.random() * 25); // B
          } else {
            // Mangrove Forest / Vegetation: Rich dark emerald
            const noise = Math.random() * 30;
            buf[idx] = 25 + Math.floor(noise * 0.6);
            buf[idx + 1] = 115 + Math.floor(noise);
            buf[idx + 2] = 45 + Math.floor(noise * 0.5);
          }
        }
      }
      await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).jpeg({ quality: 90 }).toFile(sundarbansPath);
    }

    // 2. Sentinel-1 SAR Radar (Brahmaputra Flood Basin)
    const sarPath = path.join(outputDir, 'brahmaputra_sar_s1.jpg');
    if (!fs.existsSync(sarPath)) {
      const buf = Buffer.alloc(size * size * 3);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 3;
          const river = Math.sin(y * 0.02) * 60 + 256;
          const isFloodWater = Math.abs(x - river) < 70 || (y > 350 && x < 200);

          if (isFloodWater) {
            // Specular reflection -> very dark with speckle noise
            const speckle = Math.random() * 25;
            const val = Math.floor(10 + speckle);
            buf[idx] = val; buf[idx + 1] = val; buf[idx + 2] = val;
          } else {
            // Diffuse ground scattering + double bounce points
            const isDoubleBounce = Math.random() < 0.03 && x > 300;
            if (isDoubleBounce) {
              buf[idx] = 250; buf[idx + 1] = 240; buf[idx + 2] = 220; // High radar reflection
            } else {
              const speckle = (Math.random() * 60) + 70;
              buf[idx] = Math.floor(speckle);
              buf[idx + 1] = Math.floor(speckle * 1.05);
              buf[idx + 2] = Math.floor(speckle);
            }
          }
        }
      }
      await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).jpeg({ quality: 90 }).toFile(sarPath);
    }

    // 3. Bengaluru 2018 (Before: More Greenery)
    const bglr2018Path = path.join(outputDir, 'bengaluru_2018_before.jpg');
    if (!fs.existsSync(bglr2018Path)) {
      const buf = Buffer.alloc(size * size * 3);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 3;
          const isUrbanCenter = x < 220 && y < 220;
          const isLake = (x - 300) ** 2 + (y - 300) ** 2 < 1600;

          if (isLake) {
            buf[idx] = 10; buf[idx + 1] = 50; buf[idx + 2] = 110;
          } else if (isUrbanCenter) {
            buf[idx] = 160 + Math.floor(Math.random() * 30);
            buf[idx + 1] = 145 + Math.floor(Math.random() * 25);
            buf[idx + 2] = 135 + Math.floor(Math.random() * 25);
          } else {
            // Agricultural / Tree Canopy
            buf[idx] = 40 + Math.floor(Math.random() * 25);
            buf[idx + 1] = 135 + Math.floor(Math.random() * 35);
            buf[idx + 2] = 45 + Math.floor(Math.random() * 20);
          }
        }
      }
      await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).jpeg({ quality: 90 }).toFile(bglr2018Path);
    }

    // 4. Bengaluru 2024 (After: Urban Expansion & Green Loss)
    const bglr2024Path = path.join(outputDir, 'bengaluru_2024_after.jpg');
    if (!fs.existsSync(bglr2024Path)) {
      const buf = Buffer.alloc(size * size * 3);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 3;
          const isUrbanExpansion = x < 420 && y < 400; // Expanded significantly
          const isLake = (x - 300) ** 2 + (y - 300) ** 2 < 900; // Shrinking lake

          if (isLake) {
            buf[idx] = 25; buf[idx + 1] = 60; buf[idx + 2] = 100;
          } else if (isUrbanExpansion) {
            // High concrete and red tile buildings + roads
            const isRoad = x % 70 < 8 || y % 70 < 8;
            if (isRoad) {
              buf[idx] = 80; buf[idx + 1] = 80; buf[idx + 2] = 85;
            } else {
              buf[idx] = 185 + Math.floor(Math.random() * 35);
              buf[idx + 1] = 150 + Math.floor(Math.random() * 25);
              buf[idx + 2] = 130 + Math.floor(Math.random() * 25);
            }
          } else {
            buf[idx] = 50 + Math.floor(Math.random() * 25);
            buf[idx + 1] = 120 + Math.floor(Math.random() * 30);
            buf[idx + 2] = 50 + Math.floor(Math.random() * 20);
          }
        }
      }
      await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).jpeg({ quality: 90 }).toFile(bglr2024Path);
    }

    // 5. Punjab Agriculture (Crop NDVI patterns)
    const punjabPath = path.join(outputDir, 'punjab_agriculture_s2.jpg');
    if (!fs.existsSync(punjabPath)) {
      const buf = Buffer.alloc(size * size * 3);
      const grid = 64;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 3;
          const cellX = Math.floor(x / grid);
          const cellY = Math.floor(y / grid);
          const fieldType = (cellX * 7 + cellY * 13) % 5;

          const isCanal = Math.abs(x - 256) < 6;
          if (isCanal) {
            buf[idx] = 10; buf[idx + 1] = 80; buf[idx + 2] = 140;
          } else if (fieldType === 0) {
            // Vigorously growing healthy wheat (Emerald)
            buf[idx] = 15; buf[idx + 1] = 160 + Math.floor(Math.random() * 20); buf[idx + 2] = 40;
          } else if (fieldType === 1) {
            // Moderate crop (Lime)
            buf[idx] = 60; buf[idx + 1] = 180 + Math.floor(Math.random() * 20); buf[idx + 2] = 50;
          } else if (fieldType === 2) {
            // Golden maturing crop
            buf[idx] = 190; buf[idx + 1] = 175; buf[idx + 2] = 40;
          } else if (fieldType === 3) {
            // Tilled soil
            buf[idx] = 150; buf[idx + 1] = 110; buf[idx + 2] = 70;
          } else {
            // Fallow land
            buf[idx] = 170; buf[idx + 1] = 140; buf[idx + 2] = 90;
          }
        }
      }
      await sharp(buf, { raw: { width: size, height: size, channels: 3 } }).jpeg({ quality: 90 }).toFile(punjabPath);
    }
  }
}

export class SampleDataService {
  public static getSamples(): SampleDataset[] {
    return [
      {
        id: 'sample_sundarbans',
        title: 'Sundarbans Mangrove Delta',
        subtitle: 'Sentinel-2 MSI Optical VNIR (10m Resolution)',
        sensor: 'SENTINEL_2_OPTICAL',
        locationName: 'Sundarbans Biosphere Reserve, West Bengal',
        acquisitionDate: '2024-11-14',
        description: 'World’s largest contiguous mangrove ecosystem, featuring tidal river networks and dense coastal mangrove canopies.',
        suggestedQueries: [
          'Show water bodies and delta river channels',
          'Calculate NDVI vegetation health in the mangroves',
          'Segment land cover into water, forest, and sand',
          'What is the total water surface percentage?'
        ],
        mode: 'single',
        thumbnailUrl: '/samples/sundarbans_sentinel2.jpg',
        images: {
          primary: '/samples/sundarbans_sentinel2.jpg',
        },
        geospatial: {
          hasCoordinates: true,
          latitude: 21.9497,
          longitude: 88.9007,
          bounds: { north: 22.15, south: 21.75, east: 89.15, west: 88.65 },
          crs: 'EPSG:4326 (WGS 84)',
          gsdMeters: 10,
          acquisitionDate: '2024-11-14',
          sensor: 'SENTINEL_2_OPTICAL',
          bandsAvailable: ['B2-Blue (490nm)', 'B3-Green (560nm)', 'B4-Red (665nm)', 'B8-VNIR (842nm)'],
        }
      },
      {
        id: 'sample_sar_brahmaputra',
        title: 'Brahmaputra Flood Basin SAR',
        subtitle: 'Sentinel-1 C-Band SAR Radar (Cloud Penetrating)',
        sensor: 'SENTINEL_1_SAR',
        locationName: 'Kaziranga & Brahmaputra Basin, Assam',
        acquisitionDate: '2024-07-28',
        description: 'Synthetic Aperture Radar (SAR) microwave acquisition capturing monsoon flood inundation through heavy tropical cloud cover.',
        suggestedQueries: [
          'Analyze SAR radar backscatter and speckle patterns',
          'Detect flooded areas through cloud cover',
          'Explain why water appears dark in SAR radar',
          'Show high-backscatter double-bounce structures'
        ],
        mode: 'optical_sar',
        thumbnailUrl: '/samples/brahmaputra_sar_s1.jpg',
        images: {
          sar: '/samples/brahmaputra_sar_s1.jpg',
          primary: '/samples/brahmaputra_sar_s1.jpg',
        },
        geospatial: {
          hasCoordinates: true,
          latitude: 26.6528,
          longitude: 93.3512,
          bounds: { north: 26.85, south: 26.45, east: 93.65, west: 93.05 },
          crs: 'EPSG:4326 (WGS 84)',
          gsdMeters: 10,
          acquisitionDate: '2024-07-28',
          sensor: 'SENTINEL_1_SAR',
          bandsAvailable: ['C-Band 5.405 GHz', 'VV Polarization', 'VH Polarization'],
        }
      },
      {
        id: 'sample_bengaluru_temporal',
        title: 'Bengaluru Urban Sprawl (2018 vs 2024)',
        subtitle: 'Multi-Temporal Sentinel-2 Pair (6-Year Epoch Delta)',
        sensor: 'SENTINEL_2_OPTICAL',
        locationName: 'Bengaluru Tech Corridor, Karnataka',
        acquisitionDate: '2018-03-12 to 2024-03-15',
        description: 'Multi-temporal dual-satellite comparison showing high-speed urban infrastructure growth, tech park development, and canopy transformation.',
        suggestedQueries: [
          'What changed between 2018 and 2024?',
          'Detect new urban construction and roads',
          'Show areas where vegetation decreased',
          'Compare Before and After satellite images'
        ],
        mode: 'temporal',
        thumbnailUrl: '/samples/bengaluru_2024_after.jpg',
        images: {
          before: '/samples/bengaluru_2018_before.jpg',
          after: '/samples/bengaluru_2024_after.jpg',
          primary: '/samples/bengaluru_2024_after.jpg',
        },
        geospatial: {
          hasCoordinates: true,
          latitude: 12.9716,
          longitude: 77.5946,
          bounds: { north: 13.08, south: 12.86, east: 77.75, west: 77.45 },
          crs: 'EPSG:4326 (WGS 84)',
          gsdMeters: 10,
          acquisitionDate: '2018-03 to 2024-03',
          sensor: 'SENTINEL_2_OPTICAL',
          bandsAvailable: ['B2-Blue', 'B3-Green', 'B4-Red', 'B8-VNIR'],
        }
      },
      {
        id: 'sample_punjab_agri',
        title: 'Punjab Agricultural Croplands',
        subtitle: 'Sentinel-2 MSI Multispectral Crop Vigor',
        sensor: 'SENTINEL_2_OPTICAL',
        locationName: 'Ludhiana Agricultural Belt, Punjab',
        acquisitionDate: '2024-02-18',
        description: 'High-yield agricultural patchwork showing crop phenology variations, irrigated plots, and fallow fields.',
        suggestedQueries: [
          'Calculate NDVI crop vigor and chlorophyll health',
          'Identify healthy green crops vs dry fallow soil',
          'Classify agricultural fields by canopy density',
          'Find irrigation canals and waterways'
        ],
        mode: 'single',
        thumbnailUrl: '/samples/punjab_agriculture_s2.jpg',
        images: {
          primary: '/samples/punjab_agriculture_s2.jpg',
        },
        geospatial: {
          hasCoordinates: true,
          latitude: 30.9010,
          longitude: 75.8573,
          bounds: { north: 31.05, south: 30.75, east: 76.05, west: 75.65 },
          crs: 'EPSG:4326 (WGS 84)',
          gsdMeters: 10,
          acquisitionDate: '2024-02-18',
          sensor: 'SENTINEL_2_OPTICAL',
          bandsAvailable: ['B2-Blue', 'B3-Green', 'B4-Red', 'B8-VNIR', 'B11-SWIR'],
        }
      }
    ];
  }
}
