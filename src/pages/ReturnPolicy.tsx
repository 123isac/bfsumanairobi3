import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Return & Refund Policy"
        description="Return and refund policies for BF Suma Nairobi wellness products."
      />
      <Header />
      <main className="flex-1 bg-background py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-6">Return & Refund Policy</h1>
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>Our goal is to ensure you are completely satisfied with your BF Suma premium wellness products. Due to the health and safety regulations regarding nutritional supplements, our return policy is stringent.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">1. Eligibility for Returns</h2>
            <p>We only accept returns for items that are defective, damaged upon delivery, or incorrectly fulfilled. You must notify us within 3 days of receiving your order to be eligible for a return.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">2. Non-returnable Items</h2>
            <p>Products that have been opened, unsealed, or tampered with cannot be returned. We do not accept returns due to a change of mind.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">3. Processing a Return</h2>
            <p>If your order is eligible for a return, please contact our customer support via WhatsApp or Phone immediately. We will arrange a replacement or issue a refund once the returned package is inspected.</p>

            <h2 className="font-bold text-xl mt-6 text-foreground">4. Refunds</h2>
            <p>Approved refunds are processed back to your original payment method (e.g., M-PESA) within 3-5 business days. Delivery fees are non-refundable unless the return is a result of our error.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
