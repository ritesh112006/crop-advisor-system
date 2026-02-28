import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { type Language } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, setLanguage, languageLabels } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageLabels[language]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languageLabels) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "bg-muted font-semibold" : ""}
          >
            {languageLabels[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
