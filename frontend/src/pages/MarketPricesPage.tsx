import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import MarketPrices from "@/pages/dashboard/MarketPrices";
import ProfitCalculator from "@/pages/dashboard/ProfitCalculator";

const MarketPricesPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 md:py-16 space-y-12">
        <MarketPrices />
        <div className="border-t pt-10">
          <ProfitCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketPricesPage;
