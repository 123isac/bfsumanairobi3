import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Shipping & Buying Policy"
        description="Shipping and buying timelines for BF Suma Nairobi orders."
      />
      <Header />
      <main className="flex-1 bg-background py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-6">Shipping & Buying Policy</h1>
          <div className="space-y-6 text-foreground/90 leading-relaxed">
            <p>Thank you for shopping at BF Suma Nairobi. Here are our terms and conditions regarding the purchasing and shipping process.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">1. Order Processing Time</h2>
            <p>All orders placed between 8:00 AM and 4:00 PM are processed and typically dispatched on the same day. Orders placed after hours will be handled on the next business day.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">2. Shipping Costs</h2>
            <p>Shipping costs are calculated at checkout based on our dynamic base rate and your exact location. Some promotional periods or bulk orders may qualify for free shipping.</p>
            
            <h2 className="font-bold text-xl mt-6 text-foreground">3. Delivery Timelines</h2>
            <ul className="list-disc leading-loose pl-5">
              <li><strong>Within Nairobi:</strong> Deliveries are generally completed within 1 - 24 hours.</li>
              <li><strong>Outside Nairobi / Upcountry:</strong> Via preferred courier partners. Usually completed within 24 - 48 hours depending on your county.</li>
            </ul>

            <h2 className="font-bold text-xl mt-6 text-foreground">4. Payment Terms</h2>
            <p>We accept upfront M-PESA STK Push payments or Pay on Delivery (for select regions in Nairobi). All transactions are firmly secured and encrypted. Goods remain the property of BF Suma Nairobi until full payment is received.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
