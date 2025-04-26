
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedTransition from "@/components/ui/AnimatedTransition";

const Hero = () => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      
      <div className="content-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <AnimatedTransition direction="up">
            <div className="inline-block rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary mb-4">
              University Assignment Project
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition direction="up" delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
              Share Skills. <br />
              <span className="text-primary">Track Progress.</span> <br />
              Grow Together.
            </h1>
          </AnimatedTransition>
          
          <AnimatedTransition direction="up" delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              A platform designed for students to share skills, track learning progress, 
              and connect with fellow learners in a collaborative environment.
            </p>
          </AnimatedTransition>
          
          <AnimatedTransition direction="up" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/skill-sharing">Explore Skills</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/learning-plans">View Learning Plans</Link>
              </Button>
            </div>
          </AnimatedTransition>
        </div>
        
        <AnimatedTransition direction="fade" delay={0.4} className="hidden lg:block">
          <div className="relative">
            <div className="glass-card h-[500px] w-full relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <div className="p-8 relative z-10">
                <h3 className="text-xl font-medium mb-4">Platform Preview</h3>
                <p className="text-muted-foreground">Interactive preview will appear here</p>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/10 rounded-full blur-xl" />
          </div>
        </AnimatedTransition>
      </div>
    </div>
  );
};

export default Hero;
