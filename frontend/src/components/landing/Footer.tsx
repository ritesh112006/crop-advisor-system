import { Sprout } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card py-10">
      <div className="container flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <span className="font-heading text-sm font-semibold text-primary">CropAdvisor AI</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("footerText")}</p>
      </div>
    </footer>
  );
}
