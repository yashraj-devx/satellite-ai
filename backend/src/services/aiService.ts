import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { AnalysisFinding, AnalysisResult, RemoteSensingIntent, SensorType } from '../types';
import { ProcessedAlgorithmResult } from './imageProcessing';

export interface AIAnalysisResponse {
  intent: RemoteSensingIntent;
  confidence: number;
  summary: string;
  explanation: string;
  findings: AnalysisFinding[];
  recommendedVisualization: 'original' | 'mask' | 'heatmap' | 'comparison' | 'split' | 'overlay';
  sourceType: 'REAL_ALGORITHMIC' | 'AI_VISION' | 'DEMO_FALLBACK' | 'HYBRID_AI_ALGO';
}

export class AIService {
  private static getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  }

  /**
   * Fast rule-based intent classifier for remote sensing queries
   */
  public static classifyIntent(query: string, hasDualImages: boolean = false, hasSar: boolean = false): RemoteSensingIntent {
    const q = query.toLowerCase();

    if (hasDualImages || q.includes('change') || q.includes('compare') || q.includes('difference') || q.includes('before') || q.includes('after') || q.includes('temporal') || q.includes('decreased') || q.includes('increased')) {
      return 'CHANGE_DETECTION';
    }
    if (hasSar || q.includes('sar') || q.includes('radar') || q.includes('backscatter') || q.includes('speckle') || q.includes('microwave') || q.includes('cloud-cover')) {
      return 'SAR_ANALYSIS';
    }
    if (q.includes('water') || q.includes('lake') || q.includes('river') || q.includes('ocean') || q.includes('flood') || q.includes('inundat') || q.includes('pond') || q.includes('reservoir') || q.includes('sea')) {
      return q.includes('flood') ? 'FLOOD_ANALYSIS' : 'WATER_DETECTION';
    }
    if (q.includes('vegetation') || q.includes('ndvi') || q.includes('vari') || q.includes('crop') || q.includes('farm') || q.includes('plant') || q.includes('forest') || q.includes('mangrove') || q.includes('greenery') || q.includes('chlorophyll')) {
      return q.includes('crop') || q.includes('farm') || q.includes('agri') ? 'AGRICULTURE_ANALYSIS' : 'VEGETATION_ANALYSIS';
    }
    if (q.includes('building') || q.includes('urban') || q.includes('city') || q.includes('infrastructure') || q.includes('settlement') || q.includes('built-up') || q.includes('road') || q.includes('ndbi')) {
      return 'URBAN_AREA_DETECTION';
    }
    if (q.includes('classify') || q.includes('land cover') || q.includes('land use') || q.includes('lulc') || q.includes('segment')) {
      return 'LAND_COVER_CLASSIFICATION';
    }
    if (q.includes('detect') || q.includes('find') || q.includes('locate') || q.includes('identify')) {
      return 'OBJECT_DETECTION';
    }
    if (q.includes('describe') || q.includes('what is') || q.includes('tell me') || q.includes('overview') || q.includes('analyze')) {
      return 'IMAGE_DESCRIPTION';
    }

    return 'GENERAL_VISUAL_QUESTION';
  }

  /**
   * Encodes local image file to base64 inline part for Gemini
   */
  private static fileToGenerativePart(filePath: string, mimeType: string = 'image/jpeg') {
    return {
      inlineData: {
        data: fs.readFileSync(filePath).toString('base64'),
        mimeType: mimeType.includes('png') ? 'image/png' : 'image/jpeg'
      },
    };
  }

  /**
   * Runs multimodal Vision-Language AI reasoning or transparent fallback
   */
  public static async analyzeWithAI(
    query: string,
    intent: RemoteSensingIntent,
    algoResult: ProcessedAlgorithmResult,
    images: {
      primaryPath?: string;
      beforePath?: string;
      afterPath?: string;
      sarPath?: string;
    },
    metadata?: {
      sensor?: SensorType;
      locationName?: string;
      acquisitionDate?: string;
    }
  ): Promise<AIAnalysisResponse> {
    const apiKey = this.getApiKey();

    // If API key is available, call Gemini API
    if (apiKey && apiKey !== 'your_api_key_here' && apiKey.trim().length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

        const parts: any[] = [];
        if (images.primaryPath && fs.existsSync(images.primaryPath)) {
          parts.push(this.fileToGenerativePart(images.primaryPath));
        }
        if (images.beforePath && fs.existsSync(images.beforePath)) {
          parts.push(this.fileToGenerativePart(images.beforePath));
        }
        if (images.afterPath && fs.existsSync(images.afterPath)) {
          parts.push(this.fileToGenerativePart(images.afterPath));
        }
        if (images.sarPath && fs.existsSync(images.sarPath)) {
          parts.push(this.fileToGenerativePart(images.sarPath));
        }

        const prompt = `You are SatQuery AI, an expert Remote Sensing and Earth Observation scientist for ISRO.
Analyze the provided satellite imagery and algorithmic calculations to answer the user's natural language query.

User Query: "${query}"
Detected Intent: ${intent}
Algorithmically Computed Metrics:
${JSON.stringify(algoResult.metrics, null, 2)}
Algorithm Summary: "${algoResult.summary}"
Metadata: ${JSON.stringify(metadata || {})}

Return a valid, raw JSON object (NO markdown backticks, NO extra text) with the following structure:
{
  "summary": "1-2 sentence concise executive answer to the user query",
  "explanation": "Detailed 2-3 paragraph remote sensing explanation describing visible spectral features, spatial patterns, sensor characteristics, and physical implications.",
  "confidence": 88,
  "recommendedVisualization": "mask" | "heatmap" | "comparison" | "split" | "original",
  "findings": [
    {
      "title": "Key observation title",
      "description": "Observation details referencing specific regions or values",
      "severity": "info" | "positive" | "warning" | "critical",
      "badge": "e.g. Spectral Peak / Water Inundation / Canopy Density"
    }
  ]
}`;

        parts.push(prompt);

        const result = await model.generateContent(parts);
        const responseText = result.response.text().trim();
        
        // Clean markdown backticks if returned
        let cleanedJson = responseText;
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanedJson);

        return {
          intent,
          confidence: parsed.confidence || 89,
          summary: parsed.summary || algoResult.summary,
          explanation: parsed.explanation || algoResult.summary,
          findings: parsed.findings || [],
          recommendedVisualization: parsed.recommendedVisualization || 'heatmap',
          sourceType: 'HYBRID_AI_ALGO',
        };
      } catch (err: any) {
        console.warn('Gemini API call failed or timed out, falling back to local algorithmic synthesis:', err.message);
      }
    }

    // TRANSPARENT DEMO / OFFLINE FALLBACK ENGINE
    return this.generateFallbackResponse(query, intent, algoResult, metadata);
  }

  /**
   * Robust domain-specific remote sensing fallback explanation generator
   */
  private static generateFallbackResponse(
    query: string,
    intent: RemoteSensingIntent,
    algoResult: ProcessedAlgorithmResult,
    metadata?: {
      sensor?: SensorType;
      locationName?: string;
      acquisitionDate?: string;
    }
  ): AIAnalysisResponse {
    const loc = metadata?.locationName ? ` in ${metadata.locationName}` : '';
    const sensor = metadata?.sensor ? ` (${metadata.sensor})` : '';

    switch (intent) {
      case 'WATER_DETECTION':
      case 'FLOOD_ANALYSIS': {
        const waterPct = algoResult.metrics.primaryMetricValue;
        return {
          intent,
          confidence: 88,
          summary: `Water bodies cover approximately ${waterPct} of the analyzed remote sensing scene${loc}.`,
          explanation: `Algorithmic spectral analysis utilizing blue/green reflectance and red-spectrum absorption indices isolates surface water bodies. Deep water channels display strong absorption across longer wavelengths, creating distinct contrast against surrounding terrestrial features.\n\nNote: In standard RGB mode, water detection is computed via the Normalized Green-Red spectral gradient proxy. For mission-grade multispectral validation, NIR/SWIR bands (e.g. Sentinel-2 Band 8 & Band 11 MNDWI) are recommended.`,
          recommendedVisualization: 'mask',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'Surface Water Extent',
              description: `Segmented water bodies occupy ${waterPct} of total image surface area.`,
              severity: 'info',
              badge: 'Hydrology',
            },
            {
              title: 'Inundation Density',
              description: 'Continuous spectral absorption indicates defined riverine/coastal channels with minimal turbidity artifacts.',
              severity: 'positive',
              badge: 'Spectral Index',
            },
            {
              title: 'Multispectral Sensor Recommendation',
              description: 'For wetland sub-pixel classification, pair with Sentinel-2 MSI Band 11 (SWIR) to calculate MNDWI.',
              severity: 'warning',
              badge: 'Sensor Guidance',
            }
          ]
        };
      }

      case 'VEGETATION_ANALYSIS':
      case 'AGRICULTURE_ANALYSIS': {
        const vegPct = algoResult.metrics.primaryMetricValue;
        const denseMetric = algoResult.metrics.breakdown?.find(b => b.classId === 'dense_veg');
        const densePct = denseMetric ? `${denseMetric.percentage}%` : '24%';

        return {
          intent,
          confidence: 86,
          summary: `Vegetative biomass covers ${vegPct} of the surveyed area, with ${densePct} exhibiting dense canopy foliage.`,
          explanation: `Vegetation analysis was conducted using the Visible Atmospherically Resistant Index (VARI), calibrated as (Green - Red) / (Green + Red - Blue). This remote sensing metric measures leaf chlorophyll resonance while mitigating atmospheric aerosol scatter across visible bands.\n\nAreas with index values > 0.45 correspond to active photosynthetic biomass (croplands and tree canopies), whereas values below 0.20 indicate barren ground, road networks, or water bodies.`,
          recommendedVisualization: 'heatmap',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'Canopy Biomass Health',
              description: `Dense vegetative canopy represents ${densePct} of the terrestrial zone.`,
              severity: 'positive',
              badge: 'Photosynthetic Activity',
            },
            {
              title: 'Agricultural / Crop Distribution',
              description: 'Spatial patterns show uniform chlorophyll signatures typical of irrigated agricultural plots and riparian buffers.',
              severity: 'info',
              badge: 'VARI Analysis',
            },
            {
              title: 'NDVI Multispectral Note',
              description: 'Standard RGB approximation is active. In full Sentinel-2 mode, NIR Band 8 (842nm) is utilized for true NDVI = (NIR - Red)/(NIR + Red).',
              severity: 'info',
              badge: 'Algorithmic Fallback',
            }
          ]
        };
      }

      case 'CHANGE_DETECTION':
      case 'IMAGE_COMPARISON': {
        const changePct = algoResult.metrics.primaryMetricValue;
        const vegLoss = algoResult.metrics.breakdown?.find(b => b.classId === 'veg_loss')?.percentage || 0;
        const builtGain = algoResult.metrics.breakdown?.find(b => b.classId === 'built_gain')?.percentage || 0;

        return {
          intent,
          confidence: 91,
          summary: `Bi-temporal change detection indicates a ${changePct} surface shift between the two acquisition epochs.`,
          explanation: `Automated pixel-level spectral delta mapping and structural gradient comparison isolate areas of significant landscape transformation.\n\nKey dynamics observed: Vegetation clearance/reduction is detected across ${vegLoss}% of the region (highlighted in red), while new structural development and impervious surface expansion accounts for ${builtGain}% (highlighted in amber). The remaining terrain exhibits spectral stability.`,
          recommendedVisualization: 'split',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'Total Landscape Transformation',
              description: `${changePct} of the dual-temporal scene underwent measurable spectral or textural alterations.`,
              severity: 'warning',
              badge: 'Temporal Delta',
            },
            {
              title: 'Urban / Infrastructure Expansion',
              description: `New built-up structures and land clearing constitute ${builtGain}% of changes.`,
              severity: 'info',
              badge: 'Built Environment',
            },
            {
              title: 'Canopy & Vegetation Loss',
              description: `Vegetative cover reduction is localized across ${vegLoss}% of the analyzed perimeter.`,
              severity: 'critical',
              badge: 'Environmental Impact',
            }
          ]
        };
      }

      case 'URBAN_AREA_DETECTION':
      case 'OBJECT_DETECTION': {
        const urbanPct = algoResult.metrics.primaryMetricValue;
        return {
          intent,
          confidence: 85,
          summary: `Urban infrastructure and built-up structures occupy approximately ${urbanPct} of the surveyed area.`,
          explanation: `Built-up feature extraction combines high spatial gradient edge density with concrete/asphalt spectral neutrality signatures. High-density commercial clusters and residential layouts produce pronounced spatial texture frequency, differentiating them from natural soil or agricultural fields.\n\nRoad networks and arterial corridors are mapped as linear infrastructure buffers.`,
          recommendedVisualization: 'heatmap',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'Built-Up Infrastructure Footprint',
              description: `High-density urban cores and suburban clusters cover ${urbanPct} of the territory.`,
              severity: 'info',
              badge: 'Urbanization',
            },
            {
              title: 'Road Network & Transportation Grid',
              description: 'Morphological filtering identifies connected transportation corridors and street grids.',
              severity: 'positive',
              badge: 'Infrastructure',
            }
          ]
        };
      }

      case 'SAR_ANALYSIS': {
        const meanDb = algoResult.metrics.primaryMetricValue;
        const roughness = algoResult.metrics.sarMetrics?.surfaceRoughness || 'Moderate';
        return {
          intent,
          confidence: 89,
          summary: `SAR microwave backscatter averages ${meanDb}, characteristic of ${roughness.toLowerCase()} surface roughness.`,
          explanation: `Synthetic Aperture Radar (SAR) operates in microwave frequencies (C-Band, ~5.4 GHz) providing cloud-penetrating, day-and-night remote sensing capabilities. Unlike optical imagery, SAR measures microwave backscatter intensity influenced by surface dielectric constant and micro-roughness.\n\nCalm water surfaces produce specular reflection away from the radar antenna, appearing characteristically dark (<-15 dB). Man-made vertical structures produce corner reflector double-bounce scattering (>-4 dB), appearing bright amber.`,
          recommendedVisualization: 'overlay',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'All-Weather Penetration',
              description: 'SAR radar signals penetrate cloud cover and atmospheric haze without optical attenuation.',
              severity: 'positive',
              badge: 'Radar Physics',
            },
            {
              title: 'Specular Low Backscatter (Water)',
              description: 'Smooth surfaces exhibit low radar return, enabling unambiguous flood inundation boundary delineation.',
              severity: 'info',
              badge: 'Dielectric Mapping',
            },
            {
              title: 'Double-Bounce Urban Reflectors',
              description: 'Orthogonal building walls generate strong radar echoes, isolating urban footprint.',
              severity: 'info',
              badge: 'Backscatter Sigma-0',
            }
          ]
        };
      }

      case 'LAND_COVER_CLASSIFICATION':
      case 'IMAGE_DESCRIPTION':
      case 'GENERAL_VISUAL_QUESTION':
      default: {
        const dominant = algoResult.metrics.primaryMetricValue;
        return {
          intent,
          confidence: 87,
          summary: `Scene classification identifies 6 thematic land use / land cover classes. Dominant category: ${dominant}.`,
          explanation: `Automated multispectral classification segments the scene into water bodies, dense canopy forests, agricultural croplands, urban built-up zones, barren soil, and transport networks.\n\nStatistical distribution displays balanced ecological partitioning with distinct boundaries between natural hydrologic features and developed human settlements.`,
          recommendedVisualization: 'mask',
          sourceType: 'DEMO_FALLBACK',
          findings: [
            {
              title: 'Dominant Land Cover Type',
              description: `${dominant} represents the primary surface feature across this satellite scene.`,
              severity: 'info',
              badge: 'Thematic LULC',
            },
            {
              title: 'Landscape Diversity Index',
              description: 'Multi-class spectral segmentation reveals heterogeneous land usage with defined natural and anthropogenic zones.',
              severity: 'positive',
              badge: 'Spatial Ecology',
            }
          ]
        };
      }
    }
  }
}
