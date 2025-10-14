import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Shield, Smartphone, IndianRupee, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { motion } from "framer-motion";
import HomepageReviews from '@/components/HomepageReviews';

const Home = () => {
  const features = [
    { icon: Smartphone, title: "Advance Booking", description: "Book a certified coolie by entering your PNR number" },
    { icon: IndianRupee, title: "Standardized Rates", description: "No bargaining, just clear, fixed pricing" },
    { icon: Clock, title: "Real-time Tracking", description: "Track your coolie's location, just like Uber" },
    { icon: Shield, title: "Verified Porters", description: "All porters are certified and background-checked" },
  ];

  const pricing = [
    { bags: "1-2 bags", weight: "≤20 kg", price: "₹99", description: "Standard" },
    { bags: "3-4 bags", weight: "21-40 kg", price: "₹149", description: "Medium load" },
    { bags: "5+ bags", weight: ">40 kg", price: "₹199", description: "Heavy load" },
  ];

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.2 } } };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{
          backgroundImage: `url('/img1.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-3xl mx-auto text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              CoolieMate
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-100 drop-shadow-md">
              Your Personal Coolie Booking App
            </p>
            <p className="text-lg md:text-xl mb-8 text-gray-200 drop-shadow-md">
              "Luggage help at your fingertips"
            </p>
            <Link to="/book">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Book a Porter Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose CooliMate?
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              The luggage will always be heavy, but with CooliMate, the journey won’t be.
            </motion.p>
            <motion.p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We created CooliMate to bring comfort, dignity, and convenience to every traveler...
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="shadow-card hover:shadow-elevated transition-shadow duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </CardContent>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Transparent Pricing
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              No hidden charges, no bargaining - just honest, fair rates
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {pricing.map((tier, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105"
              >
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{tier.bags}</h3>
                      <p className="text-muted-foreground text-sm">{tier.weight}</p>
                    </div>
                    <div className="text-4xl font-bold text-primary">{tier.price}</div>
                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                  </div>
                </CardContent>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground">
              Additional charges: Late night (11 PM - 5 AM) +₹20 | Priority service +₹30
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Simple, fast, and reliable
            </motion.p>
          </div>

          <motion.div
            className="max-w-3xl mx-auto space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              "Enter your PNR number and travel details",
              "View instant pricing based on your luggage",
              "Get assigned a certified porter",
              "Track your porter's location in real-time",
              "Pay conveniently via app after service",
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="flex items-start space-x-4 p-4 bg-card rounded-lg shadow-card"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {index + 1}
                </div>
                <p className="text-foreground pt-1">{step}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link to="/book">
              <Button size="lg" className="font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <HomepageReviews />
    </div>
  );
};

export default Home;