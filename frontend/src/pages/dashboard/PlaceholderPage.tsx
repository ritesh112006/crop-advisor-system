import { Construction } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Construction className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h2 className="font-heading text-xl font-semibold text-foreground">{t(titleKey as any)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("featureComing")}</p>
    </div>
  );
}
