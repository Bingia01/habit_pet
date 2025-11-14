'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      name: "Emma Chen",
      university: "USC",
      initials: "EC",
      quote: "Finally, a tracker that doesn't feel like homework! The pet makes it actually fun.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      university: "UCLA",
      initials: "MJ",
      quote: "I've tried MyFitnessPal and others. This is the only one I've stuck with for months.",
      rating: 5
    },
    {
      name: "Priya Patel",
      university: "Berkeley",
      initials: "PP",
      quote: "The camera feature is a game changer. No more searching through endless food databases!",
      rating: 5
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Students" },
    { value: "500K+", label: "Meals Logged" },
    { value: "92%", label: "Streak Retention" },
    { value: "4.9★", label: "App Rating" }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playful text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Loved by Students Everywhere
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students building healthier habits with Forki.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-card rounded-3xl"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="border-border/50"
            >
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.university}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

