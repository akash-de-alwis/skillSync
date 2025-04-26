
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-12 mt-auto">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              SkillSync<span className="text-primary">Lab</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              A platform for sharing skills, tracking learning progress, and connecting with fellow learners.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/skill-sharing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Skill Sharing
                </Link>
              </li>
              <li>
                <Link to="/learning-progress" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Learning Progress
                </Link>
              </li>
              <li>
                <Link to="/learning-plans" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Learning Plans
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@skillsynclab.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  contact@skillsynclab.com
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} SkillSyncLab. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
            IT3030 - PAF Assignment 2025
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
