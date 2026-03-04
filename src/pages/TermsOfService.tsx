import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Terms of Service"
        description="Terms of service for BF Suma Nairobi website and product orders."
      />
      <Header />
      <main className="flex-1 bg-background py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-6">Terms of Service</h1>
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>By placing an order, you agree to provide accurate customer and delivery information.</p>
            <p>All prices, stock, and promotions may change without prior notice.</p>
            <p>Orders are confirmed only after successful submission and payment validation where applicable.</p>
            <p>Delivery timelines are estimates and may vary based on location, weather, or logistics factors.</p>
            <p>Returns and refunds are handled according to product condition, delivery status, and applicable policy.</p>
            <p>We reserve the right to cancel orders with suspected fraud, abuse, or invalid payment activity.</p>
            <p>Use of this website is subject to Kenyan law and these terms.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
