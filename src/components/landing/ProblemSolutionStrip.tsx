'use client';

import { Zap, Camera, Heart } from "lucide-react";

export default function ProblemSolutionStrip() {
  const features = [
    {
      icon: Zap,
      stat: "15 seconds",
      description: "Average time to log a meal"
    },
    {
      icon: Camera,
      description: "AI-powered food recognition"
    },
    {
      icon: Heart,
      stat: "Your pet grows",
      description: "With every healthy choice you make"
    }
  ];

  return (
    <section className="py-12 bg-secondary">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-background/50 backdrop-blur-sm"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              {feature.stat && (
                <div className="font-playful text-2xl font-bold text-foreground mb-2">
                  {feature.stat}
                </div>
              )}
              <div className="text-base text-muted-foreground">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

