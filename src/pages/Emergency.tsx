
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Emergency = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmergencyCall = () => {
    toast({
      title: "Emergency Call Initiated",
      description: "Help is on the way. Stay calm.",
      variant: "destructive",
    });
  };

  return (
    <div className="app-container p-4">
      <header className="flex items-center py-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg ml-2">Emergency</h2>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Emergency Help</h1>
          <p className="text-gray-600 mt-2">Press the button below to call for immediate assistance</p>
        </div>
        
        <div className="w-32 h-32 rounded-full bg-destructive flex items-center justify-center cursor-pointer animate-pulse" onClick={handleEmergencyCall}>
          <Phone className="h-14 w-14 text-white" />
        </div>
        
        <div className="text-center text-gray-600">
          <p>Your current location will be shared</p>
          <p>with emergency services</p>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="mt-8"
        >
          Return to Dashboard
        </Button>
      </main>
    </div>
  );
};

export default Emergency;
