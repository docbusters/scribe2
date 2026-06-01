export const GEOCODING_ENDPOINT = (search: string) => `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(search)}`;
export const REVERSE_GEOCODING_ENDPOINT = (lat: number, lng: number) => `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
