'use client';

import { Smartphone, Camera, Trophy, TrendingUp, Share2, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Smartphone,
      title: "1-Tap Logging",
      description: "No typing, no searching databases. Just one tap to log your meal and move on with your day."
    },
    {
      icon: Camera,
      title: "AI Camera Recognition",
      description: "Snap a photo and let AI identify your food with LiDAR-enhanced portion detection."
    },
    {
      icon: Trophy,
      title: "Streak Rewards",
      description: "Build momentum with visual streak counters, confetti animations, and motivational nudges."
    },
    {
      icon: TrendingUp,
      title: "Weekly Insights",
      description: "Get simple, actionable insights about your progress with beautiful weekly recaps."
    },
    {
      icon: Share2,
      title: "Social Sharing",
      description: "Share your pet's growth and celebrate milestones with friends and community."
    },
    {
      icon: Palette,
      title: "Pet Customization",
      description: "Unlock adorable skins, seasonal effects, and cosmetics as you build healthy habits."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for busy students who want results without the hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-all cursor-default border-border/50"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

