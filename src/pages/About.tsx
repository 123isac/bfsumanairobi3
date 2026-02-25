import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Award, Heart, Users } from "lucide-react";
import aboutImage from "@/assets/about-image.jpg";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Authentic Quality",
      description: "Every product is 100% genuine BF Suma, sourced directly from certified distributors.",
    },
    {
      icon: Award,
      title: "Premium Excellence",
      description: "We maintain the highest standards in wellness and beauty product selection.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your health and satisfaction are at the heart of everything we do.",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of satisfied customers who trust us for their wellness journey.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
              About BF Suma
            </h1>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              Empowering lives through premium wellness products and authentic natural solutions
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background animated-bg">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground">
                Our Story
              </h2>
              <div className="space-y-3 md:space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  BF Suma has been at the forefront of the wellness revolution, bringing premium health and beauty solutions to individuals seeking authentic, natural products that deliver real results.
                </p>
                <p>
                  As authorized distributors, we take pride in offering only genuine BF Suma products, ensuring that every customer receives the highest quality wellness solutions. Our commitment to authenticity and excellence has made us a trusted name in the industry.
                </p>
                <p>
                  We believe that true wellness comes from nature's finest ingredients, combined with scientific innovation. Each product in our collection is carefully selected to meet the highest standards of purity and effectiveness.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-luxury">
                <img
                  src={aboutImage}
                  alt="BF Suma Products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-accent/20 rounded-3xl -z-10" />
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-primary/20 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30 animated-bg animated-bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-luxury transition-smooth text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-background animated-bg">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground">
              Certified Excellence
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              All our products meet international quality standards and are backed by comprehensive certifications. We work only with verified suppliers to ensure authenticity and safety.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <div className="px-6 py-3 bg-secondary rounded-full font-semibold">
                GMP Certified
              </div>
              <div className="px-6 py-3 bg-secondary rounded-full font-semibold">
                FDA Approved
              </div>
              <div className="px-6 py-3 bg-secondary rounded-full font-semibold">
                ISO 9001
              </div>
              <div className="px-6 py-3 bg-secondary rounded-full font-semibold">
                Halal Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display font-bold text-4xl md:text-5xl">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-xl opacity-90">
              Experience the transformative power of authentic BF Suma products
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
