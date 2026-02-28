import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle, Droplet, Sprout, Bug } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface CropDetail {
  crop_name: string;
  water_needed: string;
  fertilizer_needed: string;
  pesticide_needed: string;
  diseases: Array<{
    name: string;
    solution: string;
  }>;
  optimal_conditions: {
    temperature: string;
    humidity: string;
    rainfall: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
  suitable_soil_types: string[];
}

export default function CropDetails({ cropName, onBack }: { cropName: string; onBack: () => void }) {
  const { t } = useLanguage();
  const [details, setDetails] = useState<CropDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/crops/details/${cropName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        }
      } catch (error) {
        console.error("Error fetching crop details:", error);
      }
      setLoading(false);
    };

    if (cropName) {
      fetchCropDetails();
    }
  }, [cropName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t("loading") || "Loading..."}</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("back") || "Back"}
        </Button>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">{t("cropNotFound") || "Crop details not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        {t("back") || "Back"}
      </Button>

      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h1 className="font-heading text-4xl font-bold text-primary mb-2">{details.crop_name}</h1>
        <p className="text-muted-foreground">{t("completeGuide") || "Complete Growing Guide"}</p>
      </div>

      {/* Water Requirements */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Droplet className="h-6 w-6 text-primary" />
          <h2 className="font-heading text-2xl font-bold">{t("waterNeeded") || "Water Requirements"}</h2>
        </div>
        <p className="text-lg text-muted-foreground">{details.water_needed}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>{t("howToApply") || "How to Apply"}:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{t("ensureProperDrainage") || "Ensure proper drainage in the field"}</li>
            <li>{t("irrigateAccordingToStage") || "Irrigate according to growth stage"}</li>
            <li>{t("avoidWaterlogging") || "Avoid waterlogging conditions"}</li>
            <li>{t("useDropIrrigationIfPossible") || "Use drip irrigation if possible for efficiency"}</li>
          </ul>
        </div>
      </div>

      {/* Fertilizer Requirements */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Sprout className="h-6 w-6 text-secondary" />
          <h2 className="font-heading text-2xl font-bold">{t("fertilizerNeeded") || "Fertilizer Requirements"}</h2>
        </div>
        <p className="text-lg text-muted-foreground mb-4">{details.fertilizer_needed}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>{t("applicationStages") || "Application Stages"}:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{t("basalDose") || "Basal Dose"}: {t("atSoilPreparation") || "At soil preparation"}</li>
            <li>{t("topDressingStage1") || "Top Dressing (Stage 1)"}: {t("at30Days") || "At 30 days after sowing"}</li>
            <li>{t("topDressingStage2") || "Top Dressing (Stage 2)"}: {t("at60Days") || "At 60 days after sowing"}</li>
          </ul>
        </div>
      </div>

      {/* Pesticides */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Bug className="h-6 w-6 text-amber-600" />
          <h2 className="font-heading text-2xl font-bold">{t("pesticideNeeded") || "Pest & Disease Management"}</h2>
        </div>
        <p className="text-lg text-muted-foreground mb-4">{details.pesticide_needed}</p>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>{t("preventive措施") || "Preventive Measures"}:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{t("selectDiseaseFreeSeeds") || "Select disease-free seeds"}</li>
            <li>{t("rotateProperlyWithOtherCrops") || "Rotate properly with other crops"}</li>
            <li>{t("monitorCropRegularly") || "Monitor crop regularly for pests"}</li>
            <li>{t("useIntegratedPestManagement") || "Use integrated pest management (IPM)"}</li>
          </ul>
        </div>
      </div>

      {/* Diseases & Solutions */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="font-heading text-2xl font-bold">{t("diseasesAndSolutions") || "Diseases & Solutions"}</h2>
        </div>
        <div className="space-y-4">
          {details.diseases && details.diseases.length > 0 ? (
            details.diseases.map((disease, idx) => (
              <div key={idx} className="rounded-lg bg-muted/50 p-4 border-l-4 border-destructive">
                <h3 className="font-heading font-semibold text-lg mb-2">{disease.name}</h3>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">{t("solution") || "Solution"}:</span>
                  <p className="text-muted-foreground flex-1">{disease.solution}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">{t("noDiseasesRecorded") || "No diseases recorded"}</p>
          )}
        </div>
      </div>

      {/* Optimal Conditions */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h2 className="font-heading text-2xl font-bold mb-4">{t("optimalGrowingConditions") || "Optimal Growing Conditions"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [t("temperature"), details.optimal_conditions.temperature],
            [t("humidity"), details.optimal_conditions.humidity],
            [t("rainfall"), details.optimal_conditions.rainfall],
            [t("nitrogen"), details.optimal_conditions.nitrogen],
            [t("phosphorus"), details.optimal_conditions.phosphorus],
            [t("potassium"), details.optimal_conditions.potassium],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="font-heading font-bold text-lg">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suitable Soil Types */}
      <div className="rounded-lg border bg-card p-6 shadow-card">
        <h2 className="font-heading text-2xl font-bold mb-4">{t("suitableSoilTypes") || "Suitable Soil Types"}</h2>
        <div className="flex flex-wrap gap-2">
          {details.suitable_soil_types && details.suitable_soil_types.map((soil) => (
            <span key={soil} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {soil}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
