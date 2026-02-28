import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProfitCalculator() {
  const { t } = useLanguage();
  const [result, setResult] = useState<null | {
    investment: number;
    yield: number;
    revenue: number;
    profit: number;
    roi: number;
    breakeven: string;
  }>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult({
      investment: 45000,
      yield: 45,
      revenue: 78000,
      profit: 33000,
      roi: 73.3,
      breakeven: "18 quintals",
    });
  };

  const inputs = [
    { label: t("cropType"), type: "select", options: ["wheat", "rice", "cotton", "soybean"], isTranslatable: true },
    { label: t("landSize"), type: "number" },
    { label: t("seedCost"), type: "number" },
    { label: t("fertilizerCost"), type: "number" },
    { label: t("laborCost"), type: "number" },
    { label: t("transportCost"), type: "number" },
    { label: t("miscCost"), type: "number" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{t("profitCalculator")}</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCalculate} className="space-y-4 rounded-lg border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            {inputs.map((inp) => (
              <div key={inp.label}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{inp.label}</label>
                {inp.type === "select" ? (
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>{t("select")}</option>
                    {inp.options?.map((o) => <option key={o}>{inp.isTranslatable ? t(o) : o}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full gap-2">
            <Calculator className="h-4 w-4" />
            {t("calculateProfit")}
          </Button>
        </form>

        {result ? (
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <h3 className="font-heading text-lg font-semibold mb-4">{t("profitAnalysis")}</h3>
            <div className="space-y-3">
              {[
                [t("totalInvestment"), `₹${result.investment.toLocaleString()}`],
                [t("expectedYield"), `${result.yield} ${t("quintals")}`],
                [t("expectedRevenue"), `₹${result.revenue.toLocaleString()}`],
                [t("netProfit"), `₹${result.profit.toLocaleString()}`],
                [t("roi"), `${result.roi}%`],
                [t("breakeven"), result.breakeven],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between rounded-md bg-muted px-3 py-2">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/50 p-12">
            <p className="text-center text-muted-foreground">{t("enterCosts")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
