import { GEOCODING_ENDPOINT, REVERSE_GEOCODING_ENDPOINT } from "$lib/constants/ApiConstants.js";
import type ApiResponse from "./ApiResponse.ts";

const GEOCODING_MAX_RETRIES = 3;
const GEOCODING_WAIT_TIME_MS = 1200;
const USER_AGENT = 'Scribe/1.0';

export interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
    importance: number;
    address: {
        amenity?: string;
        highway: string;
        road: string;
        city: string;
        city_district: string;
        state_district: string;
        state: string;
        country: string;
        country_code: string;
        postcode: string;
    },
    formatted_address: string;
}

const formatAddress = (address: GeocodingResult['address']) => {
    const { amenity, road, city, postcode, country } = address;
    const firstPart = amenity ? amenity : road;

    if (!firstPart || !city || !postcode || !country) {
        return null;
    }

    return `${firstPart}, ${city}, ${postcode}, ${country}`;
}

export const geocodingApi = async (search: string, languageCode: string, totalRetries: number = 0): Promise<ApiResponse<GeocodingResult[]>> => {
    try {
        const request = await fetch(GEOCODING_ENDPOINT(search), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': languageCode,
                'User-Agent': USER_AGENT,
            },
        });

        const status = request.status;
        let response: GeocodingResult[] | null = null;

        if (request.ok) {
            response = await request.json() as GeocodingResult[];
            
            // Generate formatted address for each result
            response.forEach(result => {
                result.formatted_address = formatAddress(result.address) || result.display_name;
            });
        }
        
        return {
            data: response,
            status,
        };
    } catch {
        // Most likely being rate limited
        if (totalRetries > GEOCODING_MAX_RETRIES) {
            return {
                data: null,
                status: 425,
            }
        }

        // We retry the request after a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(geocodingApi(search, languageCode, totalRetries + 1));
            }, GEOCODING_WAIT_TIME_MS);
        });
    }
};

export const reverseGeocodingApi = async (lat: number, lng: number, languageCode: string, totalRetries: number = 0): Promise<ApiResponse<GeocodingResult>> => {
    try {
        const request = await fetch(REVERSE_GEOCODING_ENDPOINT(lat, lng), {
            method: 'GET',
            headers: {
                'Accept-Language': languageCode,
                'User-Agent': USER_AGENT,
            },
        });

        const status = request.status;
        let response: GeocodingResult | null = null;

        if (request.ok) {
            response = await request.json() as GeocodingResult;

            // Generate formatted address
            response.formatted_address = formatAddress(response.address) || response.display_name;
        }

        return {
            data: response,
            status,
        };
    } catch {
        // Most likely being rate limited
        if (totalRetries > GEOCODING_MAX_RETRIES) {
            return {
                data: null,
                status: 425,
            }
        }

        // We retry the request after a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(reverseGeocodingApi(lat, lng, languageCode, totalRetries + 1));
            }, GEOCODING_WAIT_TIME_MS);
        });
    }
    
};
