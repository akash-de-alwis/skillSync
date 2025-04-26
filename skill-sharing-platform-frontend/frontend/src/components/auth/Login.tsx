import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Login: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Login to Skill Sharing</h1>
      <Button onClick={handleGoogleLogin} className="flex items-center gap-2">
        <LogIn className="h-5 w-5" />
        Login with Google
      </Button>
    </div>
  );
};

export default Login;