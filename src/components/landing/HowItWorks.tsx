'use client';

import { Smartphone, Camera, Heart, TrendingUp, PartyPopper } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Smartphone,
      title: "Open the App",
      description: "Launch Forki whenever you eat. No need to create an account or set complex goals."
    },
    {
      number: 2,
      icon: Camera,
      title: "Log Your Meal",
      description: "Tap once or snap a photo. Our AI handles the rest in under 15 seconds."
    },
    {
      number: 3,
      icon: Heart,
      title: "Your Pet Reacts",
      description: "Watch your adorable companion celebrate, grow stronger, and cheer you on!"
    },
    {
      number: 4,
      icon: TrendingUp,
      title: "Build Your Streak",
      description: "Consistency unlocks rewards, levels up your pet, and creates lasting habits."
    },
    {
      number: 5,
      icon: PartyPopper,
      title: "Celebrate Progress",
      description: "Review your weekly recap and share your achievements with the community."
    }
  ];

  return (
    <section className="py-24 bg-secondary">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Five simple steps to building healthier habits that actually stick.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row gap-6 items-start ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center font-playful font-bold text-accent-foreground border-4 border-secondary">
                    {step.number}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-background rounded-3xl p-8 shadow-md">
                <h3 className="font-playful text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

