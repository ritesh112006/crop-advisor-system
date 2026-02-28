import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-fade-up font-heading text-4xl font-extrabold leading-tight text-primary-foreground md:text-6xl">
            {t("heroTitle1")}{" "}
            <span className="text-warning">{t("heroTitle2")}</span> Future
          </h1>
          <p className="mt-4 animate-fade-up text-lg text-primary-foreground/80 [animation-delay:200ms] md:text-xl">
            {t("heroSubtitle")}
          </p>

          <div className="mt-8 flex animate-fade-up flex-col items-center gap-3 [animation-delay:400ms] sm:flex-row sm:justify-center">
            <div className="flex w-full max-w-md items-center gap-2 rounded-lg bg-card/90 p-2 shadow-card">
              <MapPin className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("enterLocation")}
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Search className="mr-1 h-4 w-4 text-muted-foreground" />
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/dashboard">{t("getStarted")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
