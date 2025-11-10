import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Clock, 
  Shield,
  Star,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Globe
} from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-success/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-warning/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-success/20 border-2 border-primary/40 rounded-full px-6 py-2 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  Welcome to the Future of Libraries
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                  <span className="text-foreground">Your Gateway to</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Endless Knowledge
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Discover, borrow, and explore thousands of books at your fingertips. 
                  Join our digital library and embark on your learning journey today.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="group btn-primary px-8 py-6 text-lg h-auto shadow-xl hover:shadow-2xl relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
                <Button 
                  onClick={() => navigate('/home')}
                  variant="outline" 
                  className="group btn-secondary px-8 py-6 text-lg h-auto border-2 hover:border-primary/60"
                >
                  Browse Books
                  <BookOpen className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground font-medium">Books</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-success">5K+</div>
                  <div className="text-sm text-muted-foreground font-medium">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-warning">24/7</div>
                  <div className="text-sm text-muted-foreground font-medium">Access</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Lottie Animation */}
            <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20 rounded-full blur-3xl"></div>
                <DotLottieReact
                  src="https://lottie.host/14ba68fb-5b56-47b5-b343-48c4554f118e/NClhoR6wwX.lottie"
                  loop
                  autoplay
                  className="relative z-10 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-primary/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4 bg-primary/12 text-primary border-primary/25 font-bold px-6 py-2 text-sm">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most advanced library management system designed for modern learners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Search and borrow books in seconds with our optimized platform",
                color: "text-warning",
                bgColor: "bg-warning/15",
                borderColor: "border-warning/30"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security",
                color: "text-success",
                bgColor: "bg-success/15",
                borderColor: "border-success/30"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Access your library anytime, anywhere, on any device",
                color: "text-primary",
                bgColor: "bg-primary/15",
                borderColor: "border-primary/30"
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Join thousands of active readers and learners",
                color: "text-destructive",
                bgColor: "bg-destructive/15",
                borderColor: "border-destructive/30"
              },
              {
                icon: Star,
                title: "Curated Collection",
                description: "Hand-picked books across all genres and topics",
                color: "text-warning",
                bgColor: "bg-warning/15",
                borderColor: "border-warning/30"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description: "Seamless experience across web, mobile, and tablet",
                color: "text-success",
                bgColor: "bg-success/15",
                borderColor: "border-success/30"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="glass-strong border-2 border-white/70 hover:border-primary/40 transition-all duration-300 p-6 group hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-4 rounded-2xl ${feature.bgColor} border-2 ${feature.borderColor} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-success/12 text-success border-success/25 font-bold px-6 py-2 text-sm">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our library community and start your reading journey today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up with your university email in less than a minute",
                icon: Users
              },
              {
                step: "02",
                title: "Browse & Request",
                description: "Search our vast collection and request your favorite books",
                icon: BookOpen
              },
              {
                step: "03",
                title: "Start Reading",
                description: "Get approved and enjoy your books with flexible return policies",
                icon: Heart
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <Card className="glass-strong border-2 border-white/70 hover:border-primary/40 transition-all p-8 text-center h-full hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-6">
                    <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-primary/20 to-success/20 border-2 border-primary/40 group-hover:scale-110 transition-transform">
                      <step.icon className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <div className="text-6xl font-black text-primary/20 mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                    <ArrowRight className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-warning/12 text-warning border-warning/25 font-bold px-6 py-2 text-sm">
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Loved by Students & Faculty
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Computer Science Student",
                comment: "The best library platform I've ever used. Easy to navigate and find exactly what I need for my research.",
                rating: 5
              },
              {
                name: "Dr. Michael Chen",
                role: "Professor of Literature",
                comment: "As a faculty member, I appreciate how streamlined the borrowing process is. Highly recommended!",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Graduate Student",
                comment: "The 24/7 access has been a game-changer for my late-night study sessions. Absolutely fantastic!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="glass-strong border-2 border-white/70 hover:border-primary/40 transition-all p-6 hover:shadow-xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-success/30 flex items-center justify-center border-2 border-primary/40">
                    <span className="text-xl font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-success/10 to-primary/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="glass-strong rounded-3xl p-12 border-2 border-white/70 shadow-2xl">
            <Award className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students and faculty members who are already enjoying our digital library
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => navigate('/login')}
                className="group btn-primary px-10 py-7 text-xl h-auto shadow-xl hover:shadow-2xl"
              >
                Get Started Now
                <Sparkles className="ml-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate('/home')}
                variant="outline" 
                className="btn-secondary px-10 py-7 text-xl h-auto border-2"
              >
                Explore Books
                <TrendingUp className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">University Library</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering minds through knowledge and innovation
          </p>
          <p className="text-sm text-muted-foreground/70">
            © 2025 University Library. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
