import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";

// Fix broken default icon paths in bundled Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// BF Suma Nairobi — Kimathi Street, Nairobi CBD
const LAT = -1.2833;
const LNG = 36.8172;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

const purpleIcon = L.divIcon({
    className: "",
    html: `<div style="
    width:34px;height:34px;border-radius:50% 50% 50% 0;
    background:#7c3aed;border:3px solid #fff;
    box-shadow:0 3px 10px rgba(124,58,237,0.5);
    transform:rotate(-45deg);
  "></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -38],
});

const StoreMap = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [LAT, LNG],
            zoom: 16,
            scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        L.marker([LAT, LNG], { icon: purpleIcon })
            .addTo(map)
            .bindPopup(
                `<div style="font-family:sans-serif;min-width:160px;padding:4px 0">
          <b style="color:#7c3aed;font-size:14px">BF Suma Nairobi</b><br/>
          <span style="font-size:12px;color:#666">Kimathi Street, Nairobi CBD</span><br/>
          <a href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer"
             style="font-size:12px;color:#2563eb;display:inline-block;margin-top:6px">
            📍 Get Directions
          </a>
        </div>`,
                { maxWidth: 200 }
            )
            .openPopup();

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-soft border border-border" style={{ height: 340 }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-[1000]"
            >
                <Button size="sm" className="gradient-primary rounded-full shadow-luxury gap-2 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Get Directions
                </Button>
            </a>
        </div>
    );
};

export default StoreMap;
