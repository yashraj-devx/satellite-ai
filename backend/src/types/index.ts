export type RemoteSensingIntent =
  | 'WATER_DETECTION'
  | 'VEGETATION_ANALYSIS'
  | 'CHANGE_DETECTION'
  | 'URBAN_AREA_DETECTION'
  | 'LAND_COVER_CLASSIFICATION'
  | 'SAR_ANALYSIS'
  | 'OBJECT_DETECTION'
  | 'IMAGE_DESCRIPTION'
  | 'IMAGE_COMPARISON'
  | 'FLOOD_ANALYSIS'
  | 'AGRICULTURE_ANALYSIS'
  | 'GENERAL_VISUAL_QUESTION';

export type SensorType = 
  | 'SENTINEL_2_OPTICAL'
  | 'SENTINEL_1_SAR'
  | 'LANDSAT_8'
  | 'CARTOSAT'
  | 'RISAT'
  | 'PLANETSCOPE'
  | 'GENERIC_OPTICAL'
  | 'GENERIC_MULTISPECTRAL';

export interface GeospatialMetadata {
  hasCoordinates: boolean;
  latitude?: number;
  longitude?: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  crs?: string;
  gsdMeters?: number;
  acquisitionDate?: string;
  sensor?: SensorType;
  bandsAvailable?: string[];
}

export interface ImageMetadata {
  id: string;
  filename: string;
  path: string;
  url: string;
  width: number;
  height: number;
  format: string;
  channels: number;
  sizeBytes: number;
  uploadedAt: string;
  geospatial: GeospatialMetadata;
  role?: 'primary' | 'before' | 'after' | 'sar' | 'optical';
}

export interface AnalysisLayer {
  id: string;
  name: string;
  type: 'mask' | 'heatmap' | 'overlay' | 'difference';
  dataUrl: string; // Base64 transparent PNG
  description: string;
  colormap?: 'viridis' | 'jet' | 'turbo' | 'ndvi' | 'radar' | 'inundation' | 'urban';
  opacityDefault: number;
}

export interface LandCoverMetric {
  classId: string;
  name: string;
  color: string;
  percentage: number;
  areaKm2Estimated?: number;
  pixelCount: number;
}

export interface AnalysisFinding {
  title: string;
  description: string;
  severity?: 'info' | 'positive' | 'warning' | 'critical';
  badge?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  query: string;
  intent: RemoteSensingIntent;
  confidence: number;
  summary: string;
  explanation: string;
  findings: AnalysisFinding[];
  metrics: {
    primaryMetricName: string;
    primaryMetricValue: number | string;
    unit?: string;
    changePercentage?: number;
    breakdown?: LandCoverMetric[];
    histogram?: { bin: string; count: number; value: number }[];
    vegetationIndexType?: 'NDVI (Calculated)' | 'VARI (RGB Approximation)' | 'NDVI (Simulated Multispectral)';
    waterIndexType?: 'MNDWI' | 'NDWI' | 'RGB Water Index';
    sarMetrics?: {
      meanBackscatterDb: number;
      surfaceRoughness: 'Smooth (Calm Water)' | 'Moderate (Crops/Soil)' | 'High (Urban/Forest)';
      polarizationMode: 'VV' | 'VH' | 'Dual VV+VH';
    };
  };
  layers: AnalysisLayer[];
  recommendedVisualization: 'original' | 'mask' | 'heatmap' | 'comparison' | 'split' | 'overlay';
  sourceType: 'REAL_ALGORITHMIC' | 'AI_VISION' | 'DEMO_FALLBACK' | 'HYBRID_AI_ALGO';
  processingTimeMs: number;
  images: {
    primary?: ImageMetadata;
    before?: ImageMetadata;
    after?: ImageMetadata;
    sar?: ImageMetadata;
  };
  geospatial?: GeospatialMetadata;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  query: string;
  intent: RemoteSensingIntent;
  summary: string;
  thumbnailUrl: string;
  confidence: number;
  primaryMetric: string;
  imageNames: string[];
  result: AnalysisResult;
}

export interface SampleDataset {
  id: string;
  title: string;
  subtitle: string;
  sensor: SensorType;
  locationName: string;
  acquisitionDate: string;
  description: string;
  suggestedQueries: string[];
  mode: 'single' | 'temporal' | 'optical_sar';
  thumbnailUrl: string;
  images: {
    primary?: string;
    before?: string;
    after?: string;
    sar?: string;
  };
  geospatial: GeospatialMetadata;
}
