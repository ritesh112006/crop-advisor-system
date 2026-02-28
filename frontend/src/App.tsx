import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ChatBot } from "@/components/ChatBot";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MarketPricesPage from "./pages/MarketPricesPage";
import GovtSchemesPage from "./pages/GovtSchemesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import CropRecommendation from "./pages/dashboard/CropRecommendation";
import MyCrops from "./pages/dashboard/MyCrops";
import WeatherPage from "./pages/dashboard/WeatherPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/market" element={<MarketPricesPage />} />
            <Route path="/schemes" element={<GovtSchemesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="crops" element={<MyCrops />} />
              <Route path="recommendation" element={<CropRecommendation />} />
              <Route path="weather" element={<WeatherPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
