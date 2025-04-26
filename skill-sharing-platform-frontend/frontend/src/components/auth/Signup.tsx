import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Signup: React.FC = () => {
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Sign Up for Skill Sharing</h1>
      <Button onClick={handleGoogleSignup} className="flex items-center gap-2">
        <LogIn className="h-5 w-5" />
        Sign Up with Google
      </Button>
    </div>
  );
};

export default Signup;