import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// BF Suma Nairobi — Kimathi Street, Nairobi CBD
const LAT = -1.2833;
const LNG = 36.8172;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

// OpenStreetMap embed — no Leaflet JS needed, loads instantly
const EMBED_URL =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=36.7972%2C-1.3033%2C36.8372%2C-1.2633` +
    `&layer=mapnik` +
    `&marker=${LAT}%2C${LNG}`;

const StoreMap = () => (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-soft border border-border" style={{ height: 340 }}>
        <iframe
            src={EMBED_URL}
            title="BF Suma Nairobi location"
            loading="lazy"
            style={{ width: "100%", height: "100%", border: 0 }}
            allowFullScreen
        />
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

export default StoreMap;
