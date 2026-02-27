import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import L from "leaflet";

// Fix broken default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_LAT = -1.2833;
const DEFAULT_LNG = 36.8172; // Nairobi centre

const purpleIcon = L.divIcon({
    className: "",
    html: `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:#7c3aed;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(124,58,237,0.45);
    transform:rotate(-45deg);
  "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

export interface AddressResult {
    address: string;
    lat: number;
    lng: number;
}

interface Props {
    value: string;
    onChange: (result: AddressResult) => void;
    placeholder?: string;
}

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
        );
        const d = await res.json();
        return d.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
};

const AddressPicker = ({ value, onChange, placeholder = "Search your delivery address…" }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build map once
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [DEFAULT_LAT, DEFAULT_LNG],
            zoom: 13,
            scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
            icon: purpleIcon,
            draggable: true,
        }).addTo(map);

        marker.on("dragend", async () => {
            const { lat, lng } = marker.getLatLng();
            const addr = await reverseGeocode(lat, lng);
            setInputValue(addr);
            onChange({ address: addr, lat, lng });
        });

        map.on("click", async (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            const addr = await reverseGeocode(lat, lng);
            setInputValue(addr);
            onChange({ address: addr, lat, lng });
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    const moveTo = (lat: number, lng: number, addr: string) => {
        mapRef.current?.setView([lat, lng], 16);
        markerRef.current?.setLatLng([lat, lng]);
        setInputValue(addr);
        onChange({ address: addr, lat, lng });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setInputValue(v);
        if (debounce.current) clearTimeout(debounce.current);
        if (!v.trim()) { setSuggestions([]); setShowSuggestions(false); return; }

        debounce.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&countrycodes=ke&limit=5`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            } catch { setSuggestions([]); }
            finally { setSearching(false); }
        }, 400);
    };

    const pick = (s: Suggestion) => {
        setShowSuggestions(false);
        moveTo(parseFloat(s.lat), parseFloat(s.lon), s.display_name);
    };

    return (
        <div className="space-y-3">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                {searching
                    ? <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    : inputValue && (
                        <button type="button" onClick={() => { setInputValue(""); setSuggestions([]); setShowSuggestions(false); }}
                            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition">
                            <X className="h-4 w-4" />
                        </button>
                    )
                }
                <input
                    value={inputValue}
                    onChange={handleInput}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-9 h-12 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                {showSuggestions && (
                    <ul className="absolute z-[2000] w-full mt-1 bg-background border border-border rounded-xl shadow-luxury overflow-hidden">
                        {suggestions.map((s) => (
                            <li key={s.place_id} onMouseDown={() => pick(s)}
                                className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/70 transition text-sm border-b border-border last:border-0">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="line-clamp-2 text-foreground">{s.display_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-border shadow-soft relative" style={{ height: 260 }}>
                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
                    <span className="bg-black/60 text-white text-xs rounded-full px-3 py-1.5">
                        Tap map or drag the pin to your exact location
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AddressPicker;
