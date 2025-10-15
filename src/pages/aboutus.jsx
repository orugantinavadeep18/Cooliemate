import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import { 
  Users, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Heart, 
  Shield,
  Zap,
  Globe,
  Award,
  Briefcase,
  Code,
  LineChart,
  Star,
  Sparkles
} from "lucide-react";

const AboutUs = () => {
  const team = [
    {
      name: "Md. Dilnawaz Ahmad",
      role: "Founder & CEO",
      img: "/founder.jpg",
      description:
        "Visionary leader who identified the gap in railway luggage assistance and conceptualized CoolieMate as a solution to a nationwide problem.",
    },
    {
      name: "Sahithya",
      role: "Co-Founder & COO",
      img: "/cofounder1.jpg",
      description:
        "Strategic operations lead ensuring seamless coordination between passengers and porters, focused on user experience and service excellence.",
    },
    {
      name: "Navdeep",
      role: "Co-Founder & CTO",
      img: "/cofounder2.jpg",
      description:
        "Head of Technology, architecting the robust platform that powers real-time tracking, secure payments, and smooth booking experiences.",
    },
    {
      name: "Pankaj",
      role: "Co-Founder & Growth Lead",
      img: "/cofounder3.jpg",
      description:
        "Growth and partnerships expert, building bridges with railway authorities, porter unions, and stakeholders to scale CoolieMate across India.",
    },
  ];

  const problems = [
    {
      title: "Struggling Passengers",
      description:
        "Millions of passengers—elderly citizens, pregnant women, and families—struggle daily with heavy luggage at crowded stations.",
      icon: Users,
    },
    {
      title: "Stressful Coolie Search",
      description:
        "Finding a porter involves uncertainty and haggling, often leading to unfair pricing and unreliability.",
      icon: Target,
    },
    {
      title: "No Organized System",
      description:
        "Despite massive demand, there exists no structured or digital way to book luggage assistance in advance.",
      icon: Shield,
    },
    {
      title: "Unfair Pricing",
      description:
        "Without standardized rates, passengers are often overcharged, while porters lack fair income and recognition.",
      icon: TrendingUp,
    },
  ];

  const solutions = [
    {
      title: "Advance Booking",
      description:
        "Book a certified porter by simply entering your PNR number — plan your journey with confidence.",
      icon: Zap,
    },
    {
      title: "Standardized Rates",
      description:
        "No bargaining — just clear, fixed pricing. Fair for passengers, fair for porters.",
      icon: Shield,
    },
    {
      title: "Real-time Tracking",
      description:
        "Track your porter's location in real-time, just like ride-hailing apps.",
      icon: Globe,
    },
    {
      title: "Digital Payments",
      description:
        "Pay conveniently via UPI, card, or cash — secure, transparent, and easy.",
      icon: Award,
    },
  ];

  const impacts = [
    {
      title: "Stress-Free Travel",
      description:
        "Helping elderly, families, and travelers journey with ease and dignity.",
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Job Creation",
      description:
        "Creating employment opportunities for thousands of porters, giving them financial stability and respect.",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Digital India Support",
      description:
        "Bringing traditional porter services into the digital ecosystem to support India's transformation.",
      icon: Globe,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Market Opportunity",
      description:
        "Expanding across major Indian railway stations with potential for nationwide adoption.",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 text-sm px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Passionate Innovators
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About CoolieMate
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Luggage Help at Your Fingertips
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            We are a team of passionate innovators
            driven by the mission to make railway travel more comfortable and
            accessible for everyone through smart, digital porter booking.
          </p>

          <Link to="/" className="inline-block mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg">
              Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* Our Story */}
      <div className="container mx-auto px-4 py-16">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <Lightbulb className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl">Our Story</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground text-lg leading-relaxed">
            <p className="mb-4">
              What started as an observation of daily struggles at railway
              stations has grown into a mission to revolutionize luggage
              assistance across India.
            </p>
            <p>
              We envisioned <span className="text-primary font-semibold">CoolieMate</span> as a way to
              connect passengers and porters seamlessly — empowering both with
              technology, transparency, and trust.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-3">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground">
            The innovators behind CoolieMate
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {team.map((member, index) => (
            <Card
              key={index}
              className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
            >
              <CardContent className="pt-6">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
                />
                <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">
                  {member.role}
                </Badge>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Problems, Solutions, and Impacts */}
      <div className="container mx-auto px-4 space-y-16">
        {/* Problem Statement */}
        <section>
          <h2 className="text-4xl font-bold text-center mb-10">
            The Problem We're Solving
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {problems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div className="flex space-x-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle>{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Solutions */}
        <section>
          <h2 className="text-4xl font-bold text-center mb-10">Our Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {solutions.map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="shadow-lg hover:shadow-xl border-t-4 border-primary">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Impact Section */}
        <section>
          <h2 className="text-4xl font-bold text-center mb-10">
            Our Impact & Vision
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {impacts.map((impact, i) => {
              const Icon = impact.icon;
              return (
                <Card key={i} className={`shadow-lg hover:shadow-xl ${impact.bg}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                        <Icon className={`w-7 h-7 ${impact.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-2">{impact.title}</h3>
                        <p className="text-muted-foreground">{impact.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <div className="py-16">
        <Card className="max-w-4xl mx-auto text-center shadow-2xl bg-gradient-to-r from-primary/10 to-background border border-primary/20">
          <CardContent className="py-10">
            <Star className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To become the <span className="font-semibold text-primary">Uber for luggage help</span> —
              making every journey comfortable and dignified while empowering
              porters across India through technology.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;