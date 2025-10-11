import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  Star,
  Sparkles
} from "lucide-react";

const AboutUs = () => {
  const team = [
    {
      name: "Md. Dilnawaz Ahmad",
      role: "Founder & CEO",
      icon: Award,
      description: "Visionary leader who identified the gap in railway luggage assistance and conceptualized CooliMate as a solution to a nationwide problem."
    },
    {
      name: "Sahithya",
      role: "Co-Founder & COO",
      icon: Briefcase,
      description: "Strategic operations lead ensuring seamless coordination between passengers and porters, focused on user experience and service excellence."
    },
    {
      name: "Navdeep",
      role: "Co-Founder & CTO",
      icon: Code,
      description: "Head of Technology, architecting the robust platform that powers real-time tracking, secure payments, and smooth booking experiences."
    },
    {
      name: "Pankaj",
      role: "Co-Founder & Growth Lead",
      icon: LineChart,
      description: "Growth and partnerships expert, building bridges with railway authorities, porter unions, and stakeholders to scale CooliMate across India."
    }
  ];

  const problems = [
    {
      title: "Struggling Passengers",
      description: "With 24 million railway passengers daily in India, countless travelers—elderly citizens, pregnant women, families, and tourists—struggle with heavy luggage at crowded stations.",
      icon: Users
    },
    {
      title: "Stressful Coolie Search",
      description: "Finding a porter involves haggling, uncertainty, and often results in unfair pricing. There's no transparency or reliability in the current system.",
      icon: Target
    },
    {
      title: "No Organized System",
      description: "Despite massive demand, there exists no structured way to book luggage assistance in advance. Passengers are left to fend for themselves.",
      icon: Shield
    },
    {
      title: "Unfair Pricing",
      description: "Without standardized rates, passengers often face overcharging, while porters lack guaranteed income and professional recognition.",
      icon: TrendingUp
    }
  ];

  const solutions = [
    {
      title: "Advance Booking",
      description: "Book a certified coolie by simply entering your PNR number—plan your journey with confidence.",
      icon: Zap
    },
    {
      title: "Standardized Rates",
      description: "No bargaining, just clear, fixed pricing based on weight and distance. Fair for passengers, fair for porters.",
      icon: Shield
    },
    {
      title: "Real-time Tracking",
      description: "Track your porter's location in real-time, just like Uber. Know exactly when help will arrive.",
      icon: Globe
    },
    {
      title: "Digital Payments",
      description: "Pay conveniently via UPI, card, or cash—secure, transparent, and hassle-free transactions.",
      icon: Award
    }
  ];

  const usps = [
    {
      title: "First Organized Platform",
      description: "Pioneering the coolie booking service in India—bringing structure to an unorganized sector.",
      icon: Award
    },
    {
      title: "Simple PNR-based Booking",
      description: "Effortless booking without complex details. Just your PNR and you're done.",
      icon: Zap
    },
    {
      title: "Transparent Pricing",
      description: "No overcharging, no hidden fees—just fair and clear rates that everyone can trust.",
      icon: Shield
    },
    {
      title: "Verified & Trained Porters",
      description: "All porters are background-verified and trained, ensuring safety and reliability for users.",
      icon: Users
    }
  ];

  const impacts = [
    {
      title: "Stress-Free Travel",
      description: "Helping elderly, families, and travelers journey with ease and dignity—making travel accessible for all.",
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Job Creation",
      description: "Creating employment opportunities for thousands of railway porters, providing them with steady income and professional recognition.",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Digital India Support",
      description: "Contributing to the nation's digital transformation mission by bringing technology to traditional services.",
      icon: Globe,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Market Opportunity",
      description: "Tapping into a ₹300-500 crore market with potential for 240,000+ daily bookings across India.",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const stats = [
    { value: "24M+", label: "Daily Railway Passengers", icon: Users },
    { value: "₹300-500Cr", label: "Annual Market Size", icon: TrendingUp },
    { value: "240K+", label: "Potential Daily Bookings", icon: CheckCircle2 },
    { value: "1000+", label: "Porters to Onboard", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 text-sm px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              IIITDM Kurnool Innovation
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About CooliMate
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Luggage Help at Your Fingertips
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              We are a team of passionate innovators from <span className="font-semibold text-primary">IIITDM Kurnool</span>, driven by the idea of making travel more comfortable and accessible for everyone. Together, we've built CooliMate, a platform designed to connect passengers with railway porters (coolies) easily and efficiently — turning heavy journeys into hassle-free experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Our Story */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <Lightbulb className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl">Our Story</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                What started as an observation of daily struggles at railway stations has evolved into a mission to revolutionize luggage assistance across India.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every day, millions of passengers — elderly travelers, pregnant women, families with children, and solo tourists — struggle with heavy luggage at railway stations. Finding reliable help is stressful, involves endless bargaining, and lacks any organized system. We saw this problem, and we knew we could solve it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">CooliMate</span> was born from this vision: to create India's first organized platform connecting passengers with certified railway porters through technology.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              The innovators behind CooliMate
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardContent className="pt-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {member.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Problem Statement */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">The Problem We're Solving</h2>
            <p className="text-lg text-muted-foreground">
              Understanding the challenges faced by millions daily
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{problem.title}</CardTitle>
                        <p className="text-muted-foreground leading-relaxed">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Solution */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Our Solution</h2>
            <p className="text-lg text-muted-foreground">
              Technology-driven platform for seamless luggage assistance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-primary">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Different - USP */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Why CooliMate is Different</h2>
            <p className="text-lg text-muted-foreground">
              Our unique value propositions that set us apart
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {usps.map((usp, index) => {
              const Icon = usp.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{usp.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {usp.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Impact & Vision */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Our Impact & Vision</h2>
            <p className="text-lg text-muted-foreground">
              Creating positive change for passengers, porters, and India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {impacts.map((impact, index) => {
              const Icon = impact.icon;
              return (
                <Card key={index} className={`shadow-lg hover:shadow-xl transition-shadow ${impact.bg} border-2`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className={`w-7 h-7 ${impact.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{impact.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {impact.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Vision Statement */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border-2 border-primary/20">
            <CardContent className="py-12 text-center">
              <Star className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To become the <span className="font-bold text-primary">"Uber for luggage help"</span> across India — making every journey comfortable, dignified, and stress-free for millions of travelers while empowering thousands of railway porters with technology and steady employment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;