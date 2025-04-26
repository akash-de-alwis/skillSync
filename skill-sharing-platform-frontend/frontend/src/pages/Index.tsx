import React from "react";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedTransition from "@/components/ui/AnimatedTransition";
// Import team member photos (adjust paths as needed)
import teamMember1 from "@/assets/images/team-member-1.jpg";
import teamMember2 from "@/assets/images/team-member-2.jpg";
import teamMember3 from "@/assets/images/team-member-4.jpg";
import teamMember4 from "@/assets/images/team-member-3.jpg";

const Index: React.FC = () => {
  // Array of team member data
  const teamMembers = [
    {
      name: "Akash De Alwis",
      role: "Skill Sharing Posts",
      photo: teamMember1,
    },
    {
      name: "Madora Weerasinghe",
      role: "Learning Progress Updates",
      photo: teamMember2,
    },
    {
      name: "Paman Yuthmika",
      role: "Comments, Profiles, Notifications",
      photo: teamMember3,
    },
    {
      name: "Amanda Vihangani",
      role: "Learning Plan Sharing",
      photo: teamMember4,
    },
  ];

  return (
    <>
      <Hero />
      <Features />
      
      {/* CTA Section */}
      <section className="py-24 bg-secondary/50">
        <div className="content-container">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedTransition direction="up">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                Ready to enhance your learning journey?
              </h2>
            </AnimatedTransition>
            
            <AnimatedTransition direction="up" delay={0.1}>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community today and start sharing your skills, tracking your progress, and connecting with others.
              </p>
            </AnimatedTransition>
            
            <AnimatedTransition direction="up" delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/skill-sharing">Explore Platform</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <a href="#">Learn More</a>
                </Button>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-24">
        <div className="content-container">
          <AnimatedTransition direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              This project is being developed by a team of four full-stack developers for IT3030 - PAF Assignment 2025.
            </p>
          </AnimatedTransition>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <AnimatedTransition key={index} direction="up" delay={0.1 + index * 0.05}>
                <div className="bg-secondary/30 rounded-2xl p-6 text-center">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-medium text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Full-stack Contributor</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </AnimatedTransition>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;