import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreMap from "@/components/StoreMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { contactSchema } from "@/utils/validation";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validationResult = contactSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      // Insert contact message
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
        });

      if (error) throw error;

      toast.success("Message sent successfully! We'll get back to you soon.");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Contact form error:', error);
      }
      toast.error("Failed to send message. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              Have questions? We're here to help with your wellness journey
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background animated-bg animated-bg-secondary">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-3xl p-6 md:p-8 lg:p-12 shadow-luxury border border-border">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4 md:mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name</label>
                  <Input
                    required
                    placeholder="John Doe"
                    className="h-12 rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="h-12 rounded-xl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number (Optional)</label>
                  <Input
                    type="tel"
                    placeholder="+254 700 000 000"
                    className="h-12 rounded-xl"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    required
                    placeholder="How can we help you?"
                    className="min-h-32 rounded-xl"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="gradient-primary hover:shadow-luxury w-full h-12 text-lg rounded-full"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Reach out to us through any of these channels. We're always happy to answer your questions about our products.
                </p>
              </div>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start space-x-4 p-6 bg-secondary/50 rounded-2xl hover:shadow-soft transition-smooth">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+254 700 000 000</p>
                    <p className="text-sm text-muted-foreground mt-1">Mon - Fri: 9AM - 6PM</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4 p-6 bg-secondary/50 rounded-2xl hover:shadow-soft transition-smooth">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">info@bfsuma.com</p>
                    <p className="text-sm text-muted-foreground mt-1">We reply within 24 hours</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start space-x-4 p-6 bg-secondary/50 rounded-2xl hover:shadow-soft transition-smooth">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">WhatsApp</h3>
                    <p className="text-muted-foreground">+254 700 000 000</p>
                    <a
                      href="https://wa.me/254700000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2"
                    >
                      <Button size="sm" className="gradient-gold hover:shadow-gold text-accent-foreground rounded-full">
                        Chat Now
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-primary text-primary-foreground p-8 rounded-2xl">
                <h3 className="font-display font-semibold text-xl mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Saturday</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Location Map */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-foreground">Find Us</h2>
                <p className="text-muted-foreground text-sm">Visit us at our Nairobi store</p>
              </div>
            </div>
            <StoreMap />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
