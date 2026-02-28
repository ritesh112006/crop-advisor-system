import { useState, useEffect } from "react";
import { Landmark, ExternalLink, Search, Shield, Coins, Umbrella, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

type SchemeCategory = "all" | "loan" | "subsidy" | "insurance";

const schemes = [
  {
    nameKey: "pmKisanSamman",
    name: "PM-KISAN Samman Nidhi",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "pmKisanDesc",
    desc: "₹6,000 annual direct income support in 3 installments for small & marginal farmers.",
    deadline: "Ongoing",
    eligible: true,
    amount: "₹6,000/yr",
    url: "https://pmkisan.gov.in",
  },
  {
    nameKey: "pmFasalBima",
    name: "Pradhan Mantri Fasal Bima Yojana",
    category: "insurance" as SchemeCategory,
    descriptionKey: "pmFasalBimaDesc",
    desc: "Comprehensive crop insurance at subsidized premiums against natural calamities.",
    deadline: "31 Mar 2026",
    eligible: true,
    amount: "Up to ₹2L",
    url: "https://pmfby.gov.in",
  },
  {
    nameKey: "kisanCreditCard",
    name: "Kisan Credit Card (KCC)",
    category: "loan" as SchemeCategory,
    descriptionKey: "kisanCreditCardDesc",
    desc: "Short-term crop loans at 4% interest with interest subvention of 3% for timely repayment.",
    deadline: "Ongoing",
    eligible: true,
    amount: "Up to ₹3L @ 4%",
    url: "https://www.nabard.org/content1.aspx?id=572",
  },
  {
    nameKey: "soilHealthCard",
    name: "Soil Health Card Scheme",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "soilHealthCardDesc",
    desc: "Free soil testing and nutrient-based fertilizer recommendations to improve productivity.",
    deadline: "Ongoing",
    eligible: true,
    amount: "Free Service",
    url: "https://soilhealth.dac.gov.in",
  },
  {
    nameKey: "eNAM",
    name: "e-NAM (National Agriculture Market)",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "eNAMDesc",
    desc: "Online trading platform for agricultural commodities — sell at best price across mandis.",
    deadline: "Ongoing",
    eligible: true,
    amount: "No Fee",
    url: "https://enam.gov.in",
  },
  {
    nameKey: "nabardFarm",
    name: "NABARD Farm Sector Loan",
    category: "loan" as SchemeCategory,
    descriptionKey: "nabardDesc",
    desc: "Agricultural term loans from NABARD through cooperative banks for farm infrastructure, equipment, and irrigation.",
    deadline: "Ongoing",
    eligible: true,
    amount: "Up to ₹20L",
    url: "https://www.nabard.org",
  },
  {
    nameKey: "agriInfraFund",
    name: "Agriculture Infrastructure Fund (AIF)",
    category: "loan" as SchemeCategory,
    descriptionKey: "aifDesc",
    desc: "Long-term debt financing for post-harvest management infrastructure and community farming assets.",
    deadline: "31 Mar 2032",
    eligible: true,
    amount: "Up to ₹2Cr @ 3%",
    url: "https://agriinfra.dac.gov.in",
  },
  {
    nameKey: "microIrrigation",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "pmksyDesc",
    desc: "55% subsidy (45% for large farmers) on drip and sprinkler irrigation systems to promote water use efficiency.",
    deadline: "Ongoing",
    eligible: true,
    amount: "55% subsidy",
    url: "https://pmksy.gov.in",
  },
  {
    nameKey: "rwbcis",
    name: "Restructured Weather Based Crop Insurance Scheme (RWBCIS)",
    category: "insurance" as SchemeCategory,
    descriptionKey: "rwbcisDesc",
    desc: "Crop insurance based on weather data triggers. Covers losses due to weather deviations from normal.",
    deadline: "Seasonal",
    eligible: false,
    amount: "Per Season",
    url: "https://agricoop.nic.in",
  },
  {
    nameKey: "pmPranam",
    name: "PM PRANAM (Promotion of Alt. Nutrients for Agriculture Management)",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "pmPranamDesc",
    desc: "50% of savings from reduced chemical fertilizer use given as grant to states for alternative/organic farming.",
    deadline: "Ongoing",
    eligible: true,
    amount: "50% grant",
    url: "https://pib.gov.in",
  },
  {
    nameKey: "kisanVikasPatra",
    name: "Kisan Vikas Patra (KVP)",
    category: "loan" as SchemeCategory,
    descriptionKey: "kvpDesc",
    desc: "Post office savings certificate — doubles your investment in 115 months (7.5% interest). Available for farmers.",
    deadline: "Ongoing",
    eligible: true,
    amount: "7.5% p.a.",
    url: "https://www.indiapost.gov.in",
  },
  {
    nameKey: "organicFarming",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "pkvyDesc",
    desc: "₹50,000 per hectare (3 years) for organic farming promotion through cluster approach.",
    deadline: "Ongoing",
    eligible: false,
    amount: "₹50,000/ha",
    url: "https://pgsindia-ncof.gov.in",
  },
  {
    nameKey: "fasalBimaKharif",
    name: "PMFBY — Kharif 2026",
    category: "insurance" as SchemeCategory,
    descriptionKey: "pmfbyKharifDesc",
    desc: "Enroll your Kharif season crops (paddy, cotton, maize, soybean) before season deadline for full crop insurance coverage.",
    deadline: "31 Jul 2026",
    eligible: true,
    amount: "2% premium",
    url: "https://pmfby.gov.in",
  },
  {
    nameKey: "agriClinic",
    name: "Agri-Clinics & Agri-Business Scheme",
    category: "loan" as SchemeCategory,
    descriptionKey: "agriClinicDesc",
    desc: "Subsidized credit up to ₹20L for agriculture graduates to set up agri-input centers, soil testing labs.",
    deadline: "Ongoing",
    eligible: false,
    amount: "Up to ₹20L",
    url: "https://www.agriculture.gov.in",
  },
  {
    nameKey: "rashtriyaKisan",
    name: "Rashtriya Krishi Vikas Yojana (RKVY)",
    category: "subsidy" as SchemeCategory,
    descriptionKey: "rkvyDesc",
    desc: "Comprehensive agricultural development fund covering infrastructure, value chain, and farmer capacity building.",
    deadline: "Ongoing",
    eligible: true,
    amount: "Varies",
    url: "https://rkvy.nic.in",
  },
];

const categoryIcons: Record<string, any> = {
  all: Landmark,
  loan: Coins,
  subsidy: Shield,
  insurance: Umbrella,
};

const defaultDesc: Record<string, string> = {
  nabardDesc: "Agricultural term loans from NABARD through cooperative banks for farm infrastructure, equipment, and irrigation.",
  aifDesc: "Long-term debt financing for post-harvest management infrastructure and community farming assets.",
  pmksyDesc: "55% subsidy on drip and sprinkler irrigation systems to promote water use efficiency.",
  rwbcisDesc: "Crop insurance based on weather data triggers. Covers losses due to weather deviations from normal.",
  pmPranamDesc: "50% of savings from reduced chemical fertilizer use given as grant for alternative/organic farming.",
  kvpDesc: "Post office savings certificate — doubles your investment in 115 months (7.5% interest).",
  pkvyDesc: "₹50,000 per hectare (3 years) for organic farming promotion through cluster approach.",
  pmfbyKharifDesc: "Enroll your Kharif season crops before season deadline for full crop insurance coverage.",
  agriClinicDesc: "Subsidized credit up to ₹20L for agriculture graduates to set up agri-input centers.",
  rkvyDesc: "Comprehensive agricultural development fund covering infrastructure and farmer capacity building.",
};

export default function GovtSchemes() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<SchemeCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { key: SchemeCategory; label: string }[] = [
    { key: "all", label: t("all") || "All" },
    { key: "loan", label: t("loan") || "Loan" },
    { key: "subsidy", label: t("subsidy") || "Subsidy" },
    { key: "insurance", label: t("insurance") || "Insurance" },
  ];

  const filtered = schemes.filter((s) => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{t("govtSchemesTitle")}</h2>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchSchemes") || "Search schemes by name or keyword..."}
          className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => {
          const CatIcon = categoryIcons[c.key];
          const count = c.key === "all" ? schemes.length : schemes.filter((s) => s.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${activeCategory === c.key
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card text-muted-foreground hover:bg-muted"
                }`}
            >
              <CatIcon className="h-3.5 w-3.5" />
              {c.label}
              <span className={`rounded-full px-1.5 ${activeCategory === c.key ? "bg-white/20" : "bg-muted"} text-xs`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schemes list */}
      <div className="space-y-3">
        {filtered.map((s) => {
          const SchemeIcon = categoryIcons[s.category];
          const iconBg = s.category === "loan" ? "bg-blue-100 text-blue-600"
            : s.category === "subsidy" ? "bg-green-100 text-green-600"
              : "bg-purple-100 text-purple-600";
          const desc = t(s.descriptionKey as any) || defaultDesc[s.descriptionKey] || s.desc;

          return (
            <div key={s.nameKey} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                    <SchemeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading text-sm font-semibold">{t(s.nameKey as any) || s.name}</h3>
                      {s.eligible && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          ✓ {t("eligible")}
                        </span>
                      )}
                    </div>
                    <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${iconBg}`}>
                      {t(s.category as any) || s.category}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t("deadline") || "Deadline"}: <strong>{s.deadline}</strong></span>
                      <span className="text-primary font-semibold">{s.amount}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 shrink-0"
                  onClick={() => window.open(s.url, "_blank")}
                >
                  {t("apply") || "Apply"} <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Landmark className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t("noSchemesFound") || "No schemes found for your search."}</p>
        </div>
      )}
    </div>
  );
}
