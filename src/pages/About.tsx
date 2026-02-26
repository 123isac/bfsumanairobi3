import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Award, Heart, Sun, Rocket, Star, Fingerprint, Factory, Globe, Cpu, Zap, Droplets, Filter, Layers, CheckCircle, Target, Microscope, MapPin, Check } from "lucide-react";
import aboutImage from "@/assets/about-image.jpg";

const About = () => {
  const meanings = [
    { letter: "B", word: "Bright", icon: Sun },
    { letter: "F", word: "Future", icon: Rocket },
    { letter: "S", word: "Superior", icon: Star },
    { letter: "U", word: "Unique", icon: Fingerprint },
    { letter: "M", word: "Manufacturer of", icon: Factory },
    { letter: "A", word: "America", icon: Globe },
  ];

  const technologies = [
    {
      title: "Amino Acid Chelation (AAC) Technology",
      description: "With advanced AAC, our calcium and zinc supplements have high uptake (>90%) in the body which allows better absorption, gives better efficacy and minimizes side effects.",
      icon: Layers,
    },
    {
      title: "Combine Cryo-Enzyme & Dual-Micronization Technology",
      description: "Combining the low temperature Cryo-enzyme extraction and Dual-micronization technologies, BF Suma breaks tough spore walls to release active components completely while preserving their bioactivity.",
      icon: Zap,
    },
    {
      title: "Nano-Transderm Technology",
      description: "BF Suma employed Nano-technology to facilitate absorption of herbal essences. The formula contains activation factors which may enhance the affinity between water and nitrogen molecules in skin protein. This consequently corrects skin structure and maximizes the transdermal rate of essences.",
      icon: Droplets,
    },
    {
      title: "Macroporous Absorption Resin Technology",
      description: "Macroporous absorption resin technology is applied to separate bioactive components of medicinal herbs from inactive portions and impurities. Quality and efficacy of the product can therefore be preserved from damaging.",
      icon: Filter,
    },
    {
      title: "Membran-Tech",
      description: "The innovated filter membrane system, known as the Membran-Tech, selectively separates the active pharmaceutical components from other substances within herbs and other natural raw materials. In such an innovative and unique way, natural and original essences can be highly concentrated.",
      icon: Cpu,
    },
  ];

  const categories = [
    "Bone and joint",
    "Heart & blood vessels",
    "Digestive health",
    "Immunization",
    "Sexual health",
    "Weight management",
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center justify-center min-h-[60vh] py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <img
            src={aboutImage}
            alt="BF Suma Background"
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute inset-0 bg-primary/95 md:bg-primary/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10 pt-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in drop-shadow-lg">
            <div className="inline-block py-1.5 px-5 rounded-full bg-white/10 text-white text-sm font-semibold mb-2 backdrop-blur-md border border-white/20 shadow-xl">
              Established in the United States
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-tight text-white">
              BF Suma is a Health Product Company
            </h1>
            <p className="text-lg md:text-2xl text-white/90 leading-relaxed font-light mt-6 max-w-3xl mx-auto shadow-black/10">
              Dedicated to research & development, manufacturing & distribution, and consistently providing natural yet high quality products to benefit the health and well-being of people.
            </p>
            <div className="pt-10">
              <a href="#mission" className="inline-block bg-white text-primary font-bold text-lg px-10 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
                Discover Our Mission
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
              <Target className="w-10 h-10" />
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground">
              Our <span className="text-primary">Mission</span>
            </h2>
            <div className="bg-secondary/30 p-8 md:p-12 rounded-3xl border border-primary/20 shadow-luxury my-10 relative">
              <div className="absolute -top-6 -left-6 text-primary/20">
                <span className="text-9xl font-serif">"</span>
              </div>
              <p className="text-2xl md:text-4xl font-display font-medium text-primary leading-tight relative z-10">
                Committed to improve quality of life by offering excellent health products and service
              </p>
              <div className="absolute -bottom-16 -right-6 text-primary/20 rotate-180">
                <span className="text-9xl font-serif">"</span>
              </div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed text-left max-w-3xl mx-auto mt-8 font-light">
              Focusing on the future, BF Suma would strive to further expand our market with sophisticated products, better development strategies, strong market competitive advantages and professional management team to accomplish our mission. With such, we are to improve the quality of life by offering excellent pharmaceutical products and services.
            </p>
          </div>
        </div>
      </section>

      {/* BF Suma Meaning */}
      <section className="py-24 bg-secondary/50 animated-bg border-t border-border/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground">
              What <span className="text-primary">BF Suma</span> Means
            </h2>
            <div className="w-24 h-1.5 bg-primary/20 mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 xl:gap-8 max-w-6xl mx-auto">
            {meanings.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 bg-card rounded-3xl shadow-sm hover:shadow-luxury transition-all duration-300 border border-border group">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <item.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">{item.letter}</div>
                <div className="text-lg font-medium text-muted-foreground text-center" dangerouslySetInnerHTML={{ __html: item.word.replace(' ', '<br/>') }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage & Investor */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6">
                  About Us & Our Heritage
                </h2>
                <div className="w-20 h-1.5 bg-accent rounded-full mb-6"></div>
              </div>
              <div className="space-y-6 text-xl text-muted-foreground leading-relaxed font-light">
                <p>
                  In <strong className="text-foreground">2006</strong>, the manufacturing factory of BF Suma was set up in <strong className="text-foreground">Los Angeles USA</strong>. With its American advanced production technology and high standard, BF Suma brought its product into Africa in <strong className="text-foreground">2010</strong>.
                </p>
                <div className="p-8 bg-card rounded-3xl border-l-4 border-primary shadow-sm border border-border/50">
                  <h3 className="font-bold text-2xl text-foreground mb-4 flex items-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" />
                    Investor of BF Suma
                  </h3>
                  <p className="text-lg">
                    Located in Hong Kong, <strong className="text-foreground">Bright Future Pharmaceutical Laboratories Limited</strong> is our investor with strong background in research and science, which supports BF Suma to develop a variety of products.
                  </p>
                  <p className="text-lg mt-4 text-muted-foreground/80 italic border-t border-border/50 pt-4">
                    BF Suma has built up a strong industrial base and held multiple competitive advantages in health product manufacturing and distribution.
                  </p>
                </div>
                <p className="font-medium text-foreground text-2xl pt-4">
                  We have gradually transformed from "USA manufacturer" to "USA Brand, Global Source".
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-luxury relative border-8 border-background z-10 group bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/5 z-20 pointer-events-none group-hover:opacity-0 transition-opacity duration-700">
                  <img src={aboutImage} alt="BF Suma Heritage" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <img
                  src={aboutImage}
                  alt="BF Suma Heritage"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 blur-sm"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Strength & Sourcing */}
      <section className="py-24 bg-card relative z-10 border-y border-border/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">

            {/* Corporate Strength */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                  <Microscope className="w-8 h-8" />
                </div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-foreground">
                  Corporate Strength
                </h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                As a <strong className="text-foreground font-semibold">top-scale pharmaceutical manufacturer</strong>, BF Suma has great manufacturing strength. Our manufacturing facilities and quality control (QC) laboratory all comply with <strong className="text-foreground font-semibold">Good Laboratories Practice (GLP)</strong> standards specified by the GMP requirements.
              </p>
              <div className="bg-background p-6 rounded-3xl border border-border shadow-sm">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span>Stringent environmental control to reduce airborne risk during manufacturing, medical testing, and analysis.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span>Frequent inspections of temperature, humidity, ventilation, air pressure, total viable count, and air particle count.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border-l-4 border-primary mt-6">
                <h3 className="font-bold text-xl mb-3 flex items-center text-foreground">
                  <Shield className="w-6 h-6 text-green-600 mr-3" fill="currentColor" />
                  Halal Certified
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  BF Suma Pharmaceutical Inc. got the Halal certification from the <strong className="text-foreground font-medium">Islamic Society of the Washington Area (ISWA) Halal Department</strong> in the United States which ensures compliance with all Islamic Dietary and Shariah Laws.
                </p>
              </div>
            </div>

            {/* Global Sourcing Sites */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent flex-shrink-0">
                  <Globe className="w-8 h-8" />
                </div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-foreground">
                  Global Sourcing Sites
                </h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                We source globally to procure raw materials with the best quality from their place of origin. We always agree that raw material optimization and high quality products are the power to promote the health supplement industry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <div className="bg-background p-8 rounded-3xl border border-blue-500/20 shadow-sm flex flex-col items-center text-center hover:border-blue-500 hover:shadow-md transition-all group">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8" fill="currentColor" />
                  </div>
                  <h4 className="font-bold text-2xl text-foreground">Europe</h4>
                </div>
                <div className="bg-background p-8 rounded-3xl border border-purple-500/20 shadow-sm flex flex-col items-center text-center hover:border-purple-500 hover:shadow-md transition-all group">
                  <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8" fill="currentColor" />
                  </div>
                  <h4 className="font-bold text-2xl text-foreground">Africa</h4>
                </div>
                <div className="bg-background p-8 rounded-3xl border border-green-500/20 shadow-sm flex flex-col items-center text-center hover:border-green-500 hover:shadow-md transition-all group">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8" fill="currentColor" />
                  </div>
                  <h4 className="font-bold text-2xl text-foreground">Asia</h4>
                </div>
              </div>
              <div className="mt-8 p-6 bg-secondary/30 rounded-2xl italic text-center text-muted-foreground border border-border">
                Bringing the world's finest natural ingredients together to support your wellness journey.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Innovative Technologies */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6">
              We Are Being <span className="text-accent relative inline-block">Innovative<span className="absolute -bottom-2 left-0 w-full h-1 bg-accent/30 rounded-full"></span></span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Pioneering 5 core technologies that ensure maximum efficacy and absorption
            </p>
          </div>
          <div className="space-y-6 max-w-5xl mx-auto">
            {technologies.map((tech, idx) => (
              <div key={idx} className="flex flex-col md:flex-row bg-card rounded-3xl p-8 shadow-sm hover:shadow-luxury transition-all duration-300 border border-border/50 group">
                <div className="flex-shrink-0 mr-8 mb-6 md:mb-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                    <span className="text-4xl font-display font-bold">{idx + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                    <tech.icon className="w-7 h-7 mr-4 text-primary opacity-80" strokeWidth={1.5} />
                    {tech.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {tech.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements and Expansion */}
      <section className="py-24 bg-secondary/40 relative overflow-hidden animated-bg">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
            {/* Achievements Column */}
            <div className="space-y-10 border-b lg:border-b-0 lg:border-r border-border pb-16 lg:pb-0 lg:pr-16">
              <div>
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6">
                  BF Suma Achievements
                </h2>
                <div className="w-20 h-1.5 bg-primary rounded-full mb-8"></div>
                <p className="text-xl text-muted-foreground leading-relaxed font-light">
                  We are based on rich and high quality R&D resources as well as strong R&D capability. Countries such as USA, Korea, India, and China honor our success.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                  <Shield className="w-12 h-12 text-blue-500 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold">GMP Certified by USA NPA</h3>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                  <Award className="w-12 h-12 text-yellow-500 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold">Global Patents</h3>
                </div>
              </div>

              <div className="bg-background p-8 rounded-3xl border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Heart className="w-6 h-6 text-accent mr-3" fill="currentColor" />
                  Health Products Covering:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat, i) => (
                    <li key={i} className="flex items-center text-muted-foreground font-medium text-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {cat}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-base text-muted-foreground italic">
                    "Furthermore, we set the gold standard of bone and joint products as well as specialty drinks."
                  </p>
                </div>
              </div>
            </div>

            {/* Expansion Column */}
            <div className="space-y-10 lg:pl-8">
              <div>
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6">
                  BF Suma Expansion
                </h2>
                <div className="w-20 h-1.5 bg-accent rounded-full mb-8"></div>
              </div>

              <div className="space-y-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-luxury transition-all duration-300 group">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300 text-accent">
                      <Factory className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-foreground">Two Manufacturing Sites</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    BF Suma manufacturing sites are located in <strong className="text-foreground">Los Angeles, the United States</strong>. Within the total <strong className="text-foreground">7000 square feet</strong> area, we have two cGMP certified plants.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-luxury transition-all duration-300 group">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                      <Globe className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-foreground">Big Marketing Land</h3>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    By 2014, BF Suma has occupied a peer-leading position in Africa. Six official offices are set up in <strong className="text-primary italic font-medium">Kenya, Nigeria, Tanzania, Uganda, and Zambia</strong> respectively. Thousands and thousands of distributors joined the business and soon penetrated nearby countries.
                  </p>
                  <p className="text-primary text-xl font-bold mt-6 flex items-center uppercase tracking-wide">
                    Limitless possibilities. <Rocket className="w-5 h-5 ml-2" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary opacity-50"></div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-xl md:text-2xl opacity-90 font-light leading-relaxed">
              Experience the transformative power of authentic BF Suma products backed by cutting-edge American technology.
            </p>
            <div className="pt-4">
              <a href="/shop" className="inline-block bg-white text-primary font-bold text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Explore Our Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
