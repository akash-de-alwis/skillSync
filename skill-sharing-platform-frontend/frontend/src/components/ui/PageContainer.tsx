
import React, { ReactNode } from "react";
import AnimatedTransition from "./AnimatedTransition";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  title,
  description
}) => {
  return (
    <AnimatedTransition direction="fade">
      <div className={`page-container content-container ${className}`}>
        {(title || description) && (
          <div className="mb-12 text-center">
            {title && (
              <AnimatedTransition direction="up" delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  {title}
                </h1>
              </AnimatedTransition>
            )}
            
            {description && (
              <AnimatedTransition direction="up" delay={0.2}>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  {description}
                </p>
              </AnimatedTransition>
            )}
          </div>
        )}
        
        {children}
      </div>
    </AnimatedTransition>
  );
};

export default PageContainer;
