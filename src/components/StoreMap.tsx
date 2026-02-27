import { useEffect, useRef } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// BF Suma Nairobi store coordinates (Kimathi Street, Nairobi CBD)
const STORE_LAT = -1.2833;
const STORE_LNG = 36.8172;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${STORE_LAT},${STORE_LNG}`;

const StoreMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Dynamically import Leaflet to avoid SSR issues
        import("leaflet").then((L) => {
            // Fix default marker icon paths broken by bundlers
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current!, {
                center: [STORE_LAT, STORE_LNG],
                zoom: 16,
                zoomControl: true,
                scrollWheelZoom: false,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Custom purple marker
            const purpleIcon = L.divIcon({
                className: "",
                html: `<div style="
          width:32px; height:32px; border-radius:50% 50% 50% 0;
          background:#7c3aed; border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
          transform:rotate(-45deg); margin-top:-16px;
        "></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -36],
            });

            L.marker([STORE_LAT, STORE_LNG], { icon: purpleIcon })
                .addTo(map)
                .bindPopup(
                    `<div style="font-family:sans-serif;min-width:160px">
            <b style="color:#7c3aed">🟣 BF Suma Nairobi</b><br/>
            <span style="font-size:12px;color:#666">Kimathi Street, Nairobi CBD</span><br/>
            <a href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer"
               style="font-size:12px;color:#2563eb;margin-top:4px;display:inline-block">
              Get Directions ↗
            </a>
          </div>`
                )
                .openPopup();

            mapInstanceRef.current = map;
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-soft border border-border" style={{ height: "340px" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {/* Floating directions button */}
            <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-[1000]"
            >
                <Button size="sm" className="gradient-primary rounded-full shadow-luxury gap-2 text-xs pointer-events-auto">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Get Directions
                </Button>
            </a>

            {/* Attribution helper */}
            <div className="absolute bottom-0 left-0 z-[999]">
                <span className="sr-only">Map data © OpenStreetMap contributors</span>
            </div>
        </div>
    );
};

export default StoreMap;
