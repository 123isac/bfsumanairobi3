import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

const DEFAULT_LAT = -1.2833;
const DEFAULT_LNG = 36.8172; // Nairobi

export interface AddressResult {
    address: string;
    lat: number;
    lng: number;
}

interface AddressPickerProps {
    value: string;
    onChange: (result: AddressResult) => void;
    placeholder?: string;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const AddressPicker = ({
    value,
    onChange,
    placeholder = "Search your delivery address…",
}: AddressPickerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialise map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        import("leaflet").then((L) => {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current!, {
                center: [DEFAULT_LAT, DEFAULT_LNG],
                zoom: 13,
                zoomControl: true,
                scrollWheelZoom: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Purple draggable marker
            const purpleIcon = L.divIcon({
                className: "",
                html: `<div style="
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          background:#7c3aed;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          transform:rotate(-45deg);margin-top:-14px;
        "></div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 28],
            });

            const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
                icon: purpleIcon,
                draggable: true,
            }).addTo(map);

            // Reverse-geocode on drag end
            marker.on("dragend", async () => {
                const pos = marker.getLatLng();
                const addr = await reverseGeocode(pos.lat, pos.lng);
                setInputValue(addr);
                onChange({ address: addr, lat: pos.lat, lng: pos.lng });
            });

            // Click on map to move pin
            map.on("click", async (e: any) => {
                marker.setLatLng(e.latlng);
                const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
                setInputValue(addr);
                onChange({ address: addr, lat: e.latlng.lat, lng: e.latlng.lng });
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=ke&limit=5`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data: NominatimResult[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const selectSuggestion = (item: NominatimResult) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setInputValue(item.display_name);
        setShowSuggestions(false);
        onChange({ address: item.display_name, lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
        }
    };

    const clearInput = () => {
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                {isSearching && (
                    <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {!isSearching && inputValue && (
                    <button
                        type="button"
                        onClick={clearInput}
                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                <input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-9 h-12 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-[2000] w-full mt-1 bg-background border border-border rounded-xl shadow-luxury overflow-hidden">
                        {suggestions.map((s) => (
                            <li
                                key={s.place_id}
                                onMouseDown={() => selectSuggestion(s)}
                                className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/70 transition text-sm border-b border-border last:border-0"
                            >
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-foreground line-clamp-2">{s.display_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div
                className="rounded-xl overflow-hidden border border-border shadow-soft relative"
                style={{ height: "260px" }}
            >
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
                    <span className="bg-black/60 text-white text-xs rounded-full px-3 py-1">
                        Tap map or drag pin to set exact location
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AddressPicker;
