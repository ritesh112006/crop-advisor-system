import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
