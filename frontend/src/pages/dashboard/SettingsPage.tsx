import { useState } from "react";
import {
    Settings, User, MapPin, Leaf, Phone, Mail, Save, ChevronDown,
    HelpCircle, MessageSquare, Building2, FlaskConical, SlidersHorizontal
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-5 py-3">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold">{title}</h3>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function InputField({
    label, value, onChange, type = "text", placeholder = "", readOnly = false
}: {
    label: string; value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-8"
                >
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { t } = useLanguage();
    const [saved, setSaved] = useState(false);

    // Profile state
    const [farmerName, setFarmerName] = useState(localStorage.getItem("farmerName") || "Ramesh Kumar");
    const [farmerEmail, setFarmerEmail] = useState(localStorage.getItem("farmerEmail") || "ramesh@example.com");
    const [farmerMobile, setFarmerMobile] = useState(localStorage.getItem("farmerMobile") || "+91 98765 43210");
    const [farmerLocation, setFarmerLocation] = useState(localStorage.getItem("farmerLocation") || "Pune, Maharashtra");

    // Farm details state
    const [farmName, setFarmName] = useState(localStorage.getItem("farmName") || "Ramesh's Green Farm");
    const [farmLocation, setFarmLocation] = useState(localStorage.getItem("farmLocation") || "Village: Khed, Dist: Pune, Maharashtra");
    const [soilType, setSoilType] = useState(localStorage.getItem("soilType") || "Black Cotton Soil");
    const [landSize, setLandSize] = useState(localStorage.getItem("landSize") || "5");
    const [npkBaseline, setNpkBaseline] = useState(localStorage.getItem("npkBaseline") || "N:72, P:38, K:46");

    // Notification toggles
    const [notifWater, setNotifWater] = useState(true);
    const [notifFertilizer, setNotifFertilizer] = useState(true);
    const [notifPest, setNotifPest] = useState(true);
    const [notifWeather, setNotifWeather] = useState(true);

    const handleSave = () => {
        localStorage.setItem("farmerName", farmerName);
        localStorage.setItem("farmerEmail", farmerEmail);
        localStorage.setItem("farmerMobile", farmerMobile);
        localStorage.setItem("farmerLocation", farmerLocation);
        localStorage.setItem("farmName", farmName);
        localStorage.setItem("farmLocation", farmLocation);
        localStorage.setItem("soilType", soilType);
        localStorage.setItem("landSize", landSize);
        localStorage.setItem("npkBaseline", npkBaseline);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const soilTypes = ["Alluvial", "Black Cotton Soil", "Red Laterite", "Sandy Loam", "Clay", "Saline/Alkaline"];

    return (
        <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                {t("settings")}
            </h2>

            {/* Profile Section */}
            <Section title={t("profile") || "Profile"} icon={User}>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15 text-2xl font-bold text-primary">
                        {farmerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-heading font-bold text-lg">{farmerName}</p>
                        <p className="text-sm text-muted-foreground">{farmerEmail}</p>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label={t("fullName") || "Full Name"} value={farmerName} onChange={setFarmerName} placeholder="Your full name" />
                    <InputField label={t("email") || "Email"} value={farmerEmail} onChange={setFarmerEmail} type="email" placeholder="email@example.com" />
                    <InputField label={t("mobileNo") || "Mobile Number"} value={farmerMobile} onChange={setFarmerMobile} type="tel" placeholder="+91 XXXXX XXXXX" />
                    <InputField label={t("location") || "Location"} value={farmerLocation} onChange={setFarmerLocation} placeholder="Village, District, State" />
                </div>
            </Section>

            {/* Farm Details Section */}
            <Section title={t("farmDetails") || "Farm Details"} icon={Building2}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label={t("farmName") || "Farm Name"} value={farmName} onChange={setFarmName} placeholder="Name of your farm" />
                    <InputField label={t("farmLocation") || "Farm Location"} value={farmLocation} onChange={setFarmLocation} placeholder="Village, District, State" />
                    <div className="sm:col-span-1">
                        <SelectField label={t("soilType") || "Soil Type"} value={soilType} onChange={setSoilType} options={soilTypes} />
                    </div>
                    <InputField label={t("landSize") || "Land Size (acres)"} value={landSize} onChange={setLandSize} type="number" placeholder="e.g. 5" />
                </div>

                {/* Soil sensor data (read-only) */}
                <div className="mt-2 rounded-lg border border-dashed bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {t("sensorCollectedData") || "Sensor-Collected Soil Data (Read Only)"}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {[
                            { label: "N (Nitrogen)", val: "72 mg/kg" },
                            { label: "P (Phosphorus)", val: "38 mg/kg" },
                            { label: "K (Potassium)", val: "46 mg/kg" },
                            { label: "Soil Moisture", val: "55%" },
                            { label: "Soil pH", val: "6.8" },
                            { label: "Field Temperature", val: "28.4°C" },
                        ].map(({ label, val }) => (
                            <div key={label} className="text-xs">
                                <span className="text-muted-foreground">{label}: </span>
                                <span className="font-semibold">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Preferences Section */}
            <Section title={t("preferences") || "Preferences"} icon={SlidersHorizontal}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{t("language") || "Language"}</span>
                        <LanguageSwitcher />
                    </div>
                    <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-3">{t("notificationSettings") || "Notification Settings"}</p>
                        {[
                            { key: "water", label: t("water") || "Watering Alerts", val: notifWater, set: setNotifWater },
                            { key: "fert", label: t("fertilizer") || "Fertilizer Alerts", val: notifFertilizer, set: setNotifFertilizer },
                            { key: "pest", label: t("pestAlerts") || "Pest Alerts", val: notifPest, set: setNotifPest },
                            { key: "weather", label: t("weather") || "Weather Alerts", val: notifWeather, set: setNotifWeather },
                        ].map(({ key, label, val, set }) => (
                            <div key={key} className="flex items-center justify-between py-1.5">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <button
                                    onClick={() => set(!val)}
                                    className={`relative h-6 w-11 rounded-full transition-colors ${val ? "bg-primary" : "bg-muted-foreground/30"}`}
                                >
                                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${val ? "left-6" : "left-1"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Help / Contact Support Section */}
            <Section title={t("helpContact") || "Help & Contact Support"} icon={HelpCircle}>
                <div className="space-y-4">
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                                <MessageSquare className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <p className="font-heading font-bold text-green-800 text-sm">
                                    {t("technicalTeam") || "Crop Advisor Technical Team"}
                                </p>
                                <p className="text-xs text-green-700 mt-0.5">
                                    {t("technicalTeamDesc") || "For any technical support, sensor issues, or system-related queries, contact our team."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">{t("phone") || "Phone"}</p>
                                <p className="text-sm font-bold tracking-wide">+91 99XXXXXX06</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">{t("email") || "Email"}</p>
                                <p className="text-sm font-bold">support@cropadvisor.in</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">{t("supportHours") || "Support Hours"}</p>
                                <p className="text-sm font-medium">{t("supportTiming") || "Mon – Sat: 9:00 AM – 6:00 PM IST"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                        {t("chatbotHelpTip") || "💡 You can also use the CropAdvisor AI Chat (bottom-right) for instant help about your farm, crops, and sensor readings — available 24/7."}
                    </div>
                </div>
            </Section>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="gap-2 px-8"
                    variant={saved ? "outline" : "default"}
                >
                    <Save className="h-4 w-4" />
                    {saved ? (t("saved") || "Saved ✓") : (t("saveChanges") || "Save Changes")}
                </Button>
            </div>
        </div>
    );
}
