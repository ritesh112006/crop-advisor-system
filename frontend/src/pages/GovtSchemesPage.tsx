import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import GovtSchemes from "@/pages/dashboard/GovtSchemes";

const GovtSchemesPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-10 md:py-16">
        <GovtSchemes />
      </main>
      <Footer />
    </div>
  );
};

export default GovtSchemesPage;
