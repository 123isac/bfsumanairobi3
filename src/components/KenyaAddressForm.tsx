import { MapPin, Home, Building2, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Kenya counties — most common delivery areas first, rest alphabetical
const KENYA_COUNTIES = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret / Uasin Gishu",
    "Kiambu",
    "Machakos",
    "Kajiado",
    "Murang'a",
    "Nyeri",
    "Meru",
    "Embu",
    "Garissa",
    "Kakamega",
    "Kilifi",
    "Kirinyaga",
    "Kisii",
    "Kitui",
    "Kwale",
    "Laikipia",
    "Lamu",
    "Makueni",
    "Mandera",
    "Marsabit",
    "Migori",
    "Narok",
    "Nandi",
    "Nyandarua",
    "Nyamira",
    "Samburu",
    "Siaya",
    "Taita-Taveta",
    "Tana River",
    "Tharaka-Nithi",
    "Trans Nzoia",
    "Turkana",
    "Vihiga",
    "Wajir",
    "West Pokot",
    "Bungoma",
    "Busia",
    "Elgeyo-Marakwet",
    "Homa Bay",
    "Isiolo",
    "Bomet",
    "Baringo",
];

export interface KenyaAddress {
    county: string;       // shipping_city
    area: string;         // shipping_area  (estate/neighbourhood)
    street: string;       // shipping_address
    building: string;     // shipping_building
    landmark: string;     // shipping_landmark
}

interface Props {
    value: KenyaAddress;
    onChange: (val: KenyaAddress) => void;
}

const KenyaAddressForm = ({ value, onChange }: Props) => {
    const set = (field: keyof KenyaAddress) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange({ ...value, [field]: e.target.value });

    const setCounty = (county: string) => onChange({ ...value, county });

    return (
        <div className="space-y-4">
            {/* County */}
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    County <span className="text-destructive">*</span>
                </label>
                <Select value={value.county} onValueChange={setCounty} required>
                    <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {KENYA_COUNTIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Area / Estate */}
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                    <Home className="h-3.5 w-3.5 text-primary" />
                    Area / Estate <span className="text-destructive">*</span>
                </label>
                <Input
                    required
                    placeholder="e.g. Westlands, Kilimani, Lang'ata, CBD"
                    value={value.area}
                    onChange={set("area")}
                    className="h-12 rounded-xl"
                />
            </div>

            {/* Street / Road */}
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Street / Road <span className="text-destructive">*</span>
                </label>
                <Input
                    required
                    placeholder="e.g. Ngong Road, Thika Road, Kimathi Street"
                    value={value.street}
                    onChange={set("street")}
                    className="h-12 rounded-xl"
                />
            </div>

            {/* Building / House */}
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Building / House Number <span className="text-destructive">*</span>
                </label>
                <Input
                    required
                    placeholder="e.g. Westgate Mall 3rd Floor, House 14B, Apt 6"
                    value={value.building}
                    onChange={set("building")}
                    className="h-12 rounded-xl"
                />
            </div>

            {/* Landmark */}
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                    <Landmark className="h-3.5 w-3.5 text-primary" />
                    Nearest Landmark
                    <span className="text-xs text-muted-foreground ml-1">(helps our rider find you)</span>
                </label>
                <Textarea
                    rows={2}
                    placeholder="e.g. Next to Shell petrol station, opposite Junction Mall, near Uchumi supermarket"
                    value={value.landmark}
                    onChange={set("landmark")}
                    className="rounded-xl resize-none text-sm"
                />
            </div>
        </div>
    );
};

export default KenyaAddressForm;
