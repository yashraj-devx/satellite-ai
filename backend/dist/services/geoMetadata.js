"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoMetadataService = void 0;
const sharp_1 = __importDefault(require("sharp"));
class GeoMetadataService {
    /**
     * Extracts metadata from image file and infers sensor/geospatial attributes
     */
    static async extractMetadata(filePath, filename, url, fileSizeBytes, role = 'primary') {
        const meta = await (0, sharp_1.default)(filePath).metadata();
        const width = meta.width || 512;
        const height = meta.height || 512;
        const format = meta.format?.toUpperCase() || 'JPEG';
        const channels = meta.channels || 3;
        // Detect sensor from filename heuristics
        const lowerName = filename.toLowerCase();
        let sensor = 'GENERIC_OPTICAL';
        let bandsAvailable = ['Red (665nm)', 'Green (560nm)', 'Blue (490nm)'];
        if (lowerName.includes('sentinel-2') || lowerName.includes('s2') || lowerName.includes('msi')) {
            sensor = 'SENTINEL_2_OPTICAL';
            bandsAvailable = ['B2-Blue (490nm)', 'B3-Green (560nm)', 'B4-Red (665nm)', 'B8-VNIR (842nm)', 'B11-SWIR (1610nm)'];
        }
        else if (lowerName.includes('sar') || lowerName.includes('sentinel-1') || lowerName.includes('s1') || lowerName.includes('c-band')) {
            sensor = 'SENTINEL_1_SAR';
            bandsAvailable = ['C-Band Radar (5.405 GHz)', 'VV Polarization', 'VH Polarization'];
        }
        else if (lowerName.includes('landsat') || lowerName.includes('oli')) {
            sensor = 'LANDSAT_8';
            bandsAvailable = ['B2-Blue', 'B3-Green', 'B4-Red', 'B5-NIR', 'B6-SWIR1'];
        }
        else if (lowerName.includes('cartosat') || lowerName.includes('isro')) {
            sensor = 'CARTOSAT';
            bandsAvailable = ['Panchromatic (0.5m GSD)', 'Multispectral VNIR (2.0m GSD)'];
        }
        else if (lowerName.includes('risat')) {
            sensor = 'RISAT';
            bandsAvailable = ['C-Band SAR', 'Hybrid Polarimetry (RH/RV)'];
        }
        // Coordinates detection
        const geospatial = {
            hasCoordinates: false,
            sensor,
            bandsAvailable,
            crs: 'EPSG:4326 (WGS 84)',
            acquisitionDate: new Date().toISOString().split('T')[0],
            gsdMeters: sensor === 'SENTINEL_2_OPTICAL' ? 10 : sensor === 'CARTOSAT' ? 0.65 : sensor === 'SENTINEL_1_SAR' ? 10 : 15,
        };
        return {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            filename,
            path: filePath,
            url,
            width,
            height,
            format,
            channels,
            sizeBytes: fileSizeBytes,
            uploadedAt: new Date().toISOString(),
            geospatial,
            role,
        };
    }
}
exports.GeoMetadataService = GeoMetadataService;
