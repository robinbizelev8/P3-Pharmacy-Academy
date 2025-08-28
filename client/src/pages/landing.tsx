import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Stethoscope, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Globe, 
  Target,
  Brain,
  Heart,
  Shield,
  Star,
  Clock,
  TrendingUp,
  Play,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Trophy
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getRoleBasedRedirect } from "@/lib/auth-utils";
import { StakeholderOutcomesSection } from "@/components/knowledge-sources-section";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import logoImage from "@assets/generated_images/P3_Pharmacy_Academy_Logo_e0d57123.png";
import heroImage from "@assets/generated_images/Pharmacy_Training_Hero_Image_d67ab24c.png";
import processImage from "@assets/generated_images/Three_Stage_Learning_Process_6e67f8a4.png";
import consultationImage from "@assets/generated_images/Pharmacy_Consultation_Scene_5e33f98e.png";
import dashboardImage from "@assets/generated_images/Clinical_Assessment_Dashboard_cb98d808.png";
import achievementImage from "@assets/generated_images/Pharmacy_Achievement_Success_e8bfd117.png";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000 })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const modules = [
    {
      id: 1,
      name: "Prepare",
      title: "Foundation Building",
      description: "Establish clinical knowledge foundation and therapeutic area familiarity",
      icon: BookOpen,
      color: "bg-blue-600",
      duration: "2-3 hours per area",
      features: [
        "7 core therapeutic areas",
        "Competency self-assessment", 
        "Evidence-based learning",
        "Learning objectives setting"
      ],
      href: "/prepare"
    },
    {
      id: 2,
      name: "Practice",
      title: "Clinical Scenarios",
      description: "Apply clinical knowledge through realistic patient case management",
      icon: MessageCircle,
      color: "bg-green-600",
      duration: "45-60 minutes per case",
      features: [
        "Dynamic case generation",
        "Real-time AI feedback",
        "SOAP documentation",
        "Multi-stage interactions"
      ],
      href: "/practice"
    },
    {
      id: 3,
      name: "Perform",
      title: "Competency Assessment",
      description: "Demonstrate mastery through formal assessment and portfolio development",
      icon: Trophy,
      color: "bg-purple-600",
      duration: "90-120 minutes per session",
      features: [
        "Standardized assessment",
        "Portfolio documentation",
        "Supervision level tracking",
        "Career progression planning"
      ],
      href: "/perform"
    }
  ];

  const carouselSlides = [
    {
      image: consultationImage,
      title: "Master Patient Consultation",
      subtitle: "Build confidence in counseling and communication",
      description: "Practice real-world patient interactions with AI-powered feedback"
    },
    {
      image: dashboardImage,
      title: "Clinical Decision Making",
      subtitle: "Develop therapeutic reasoning skills",
      description: "Navigate complex medication management with expert guidance"
    },
    {
      image: achievementImage,
      title: "Achieve Excellence",
      subtitle: "Progress toward independent practice",
      description: "Earn your Level 4 supervision independence certification"
    }
  ];

  const keyStats = [
    { number: "14", label: "Prescription Records", description: "Required for portfolio completion" },
    { number: "7", label: "Therapeutic Areas", description: "Comprehensive clinical coverage" },
    { number: "Level 4", label: "Target Independence", description: "Unsupervised practice readiness" },
    { number: "30", label: "Week Program", description: "Structured learning pathway" }
  ];

  const therapeuticAreas = [
    { name: "Cardiovascular", icon: Heart },
    { name: "Respiratory", icon: Brain },
    { name: "Endocrine", icon: Shield },
    { name: "Gastrointestinal", icon: Target },
    { name: "Renal", icon: Brain },
    { name: "Neurological", icon: Brain },
    { name: "Dermatological", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
              <img src={logoImage} alt="P³ Pharmacy Academy" className="w-32 h-32 md:w-40 md:h-40 rounded-2xl shadow-xl" />
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pharmacy Academy
                </h1>
                <p className="text-xl text-gray-600 font-medium">Pre-registration Training Excellence</p>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-tight">
              Master clinical pharmacy through 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-powered learning</span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Singapore's premier pre-registration training platform combining clinical excellence with cutting-edge technology.
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href={getRoleBasedRedirect(user.role || 'student')}>
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  <Link href="/prepare">
                    Start Learning
                    <BookOpen className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/login">
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  <Link href="/login">
                    Create Account
                    <Users className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Visual - Carousel */}
          <div className="relative">
            <div className="embla overflow-hidden rounded-2xl shadow-2xl" ref={emblaRef}>
              <div className="embla__container flex">
                {carouselSlides.map((slide, index) => (
                  <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{slide.title}</h3>
                        <p className="text-lg mb-1 text-white/95 drop-shadow-md">{slide.subtitle}</p>
                        <p className="text-sm text-white/90 drop-shadow-md">{slide.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Controls */}
            <button 
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {keyStats.map((stat, index) => (
            <Card key={index} className="text-center p-6 border-none bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Knowledge Sources Section */}
        <StakeholderOutcomesSection />

        {/* Three Modules Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1 ${module.color}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {module.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {module.title}
                      </CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {module.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{module.duration}</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {user && (
                    <Button asChild className="w-full mt-4" variant="outline">
                      <Link href={module.href}>
                        Start {module.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 3P Process - Compact Icon-based Design */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Your Learning Journey
          </h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-6 items-center">
              {/* Prepare */}
              <div className="text-center space-y-4 md:col-span-1">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Prepare</h3>
                  <p className="text-sm text-gray-600">Build clinical knowledge foundation</p>
                </div>
              </div>
              
              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center md:col-span-1">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              
              {/* Practice */}
              <div className="text-center space-y-4 md:col-span-1">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Practice</h3>
                  <p className="text-sm text-gray-600">Apply through patient simulations</p>
                </div>
              </div>
              
              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center md:col-span-1">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              
              {/* Perform */}
              <div className="text-center space-y-4 md:col-span-1">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Perform</h3>
                  <p className="text-sm text-gray-600">Demonstrate competency mastery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Therapeutic Areas - Streamlined */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              7 Essential Therapeutic Areas
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {therapeuticAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.name} className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-shadow">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">{area.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Excel in Pharmacy Practice?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join Singapore's premier pre-registration training platform and accelerate your journey to independent practice.
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3 bg-white/10 rounded-xl p-4 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="font-medium">Loading...</span>
            </div>
          ) : user ? (
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl">
              <Link href="/prepare">
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl">
                <Link href="/login">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl">
                <Link href="/login">
                  Create Account
                  <Users className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}