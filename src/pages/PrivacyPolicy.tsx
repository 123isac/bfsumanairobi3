import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Privacy Policy"
        description="Privacy policy for BF Suma Nairobi website and e-commerce services."
      />
      <Header />
      <main className="flex-1 bg-background py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>We collect only the personal data required to process orders, deliver products, and provide support.</p>
            <p>Data we may collect includes name, email, phone number, shipping details, and order history.</p>
            <p>We use this data for order fulfillment, customer communication, fraud prevention, and service improvement.</p>
            <p>Payment processing is handled through secure third-party providers. We do not store card or M-PESA PIN details.</p>
            <p>We do not sell your personal data. Access is limited to authorized staff and service providers.</p>
            <p>You may request correction or deletion of your personal data by contacting us through our support channels.</p>
            <p>By using this website, you consent to this policy and any updates posted on this page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
