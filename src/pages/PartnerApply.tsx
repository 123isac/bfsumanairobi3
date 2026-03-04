import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { partnerApplicationSchema } from "@/utils/validation";
import { toast } from "sonner";

const codeFromName = (name: string) => {
  const seed = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "PARTNR";
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return "PRT-" + seed + "-" + random;
};

const PartnerApply = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", background: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = partnerApplicationSchema.safeParse(formData);
      if (!parsed.success) {
        toast.error(parsed.error.errors[0].message);
        return;
      }

      const payload = {
        name: "Partner Application - " + parsed.data.fullName,
        contact_name: parsed.data.fullName,
        email: parsed.data.email.trim().toLowerCase(),
        phone: parsed.data.phone.trim(),
        referral_code: codeFromName(parsed.data.fullName),
        application_status: "pending",
        is_active: false,
      };

      const { error } = await supabase.from("spas").insert(payload);
      if (error) {
        if (error.code === "23505" && error.message.toLowerCase().includes("email")) {
          toast.info("An application with this email already exists.");
          return;
        }
        throw error;
      }

      await supabase.from("contact_messages").insert({
        name: parsed.data.fullName,
        email: parsed.data.email.trim().toLowerCase(),
        phone: parsed.data.phone.trim(),
        message: "[PARTNER APPLICATION]\n" + parsed.data.background.trim(),
      });

      toast.success("Application submitted. Our team will review and contact you soon.");
      setFormData({ fullName: "", email: "", phone: "", background: "" });
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        console.error("Partner application error:", error);
      }
      const message = error instanceof Error ? error.message : "Failed to submit application. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Become a Partner"
        description="Apply to become a BF Suma partner in Kenya. Submit your details and our team will review your application."
      />
      <Header />

      <section className="bg-gradient-primary text-primary-foreground py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display font-bold text-4xl md:text-6xl">Become a Partner</h1>
            <p className="mt-4 text-base md:text-lg opacity-90 max-w-2xl">
              Interested in joining BF Suma? Submit your details below and our admin team will review your application.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-background flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-border shadow-luxury p-6 md:p-10">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-6">Partner Application Form</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  required
                  type="text"
                  value={formData.fullName}
                  placeholder="John Doe"
                  className="h-12 rounded-xl"
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  placeholder="john@example.com"
                  className="h-12 rounded-xl"
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  placeholder="+254700000000"
                  className="h-12 rounded-xl"
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Why do you want to partner with us?</label>
                <Textarea
                  required
                  rows={5}
                  placeholder="Briefly tell us about your background and why you want to join BF Suma."
                  value={formData.background}
                  onChange={(e) => setFormData((prev) => ({ ...prev, background: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="w-full h-12 rounded-full gradient-primary">
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerApply;
