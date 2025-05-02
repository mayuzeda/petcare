
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import IconGrid from "@/components/IconGrid";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = "John"; // In a real app, this would come from authentication state

  return (
    <div className="app-container p-4">
      <Header />
      
      <main className="flex-1">
        <section className="my-6">
          <h1 className="text-2xl font-bold">Welcome back, {username}!</h1>
          <p className="text-gray-600 mt-1">What would you like to do today?</p>
        </section>

        <section className="my-8">
          <IconGrid />
        </section>

        <section className="my-8">
          <Button 
            variant="destructive" 
            className="emergency-button"
            onClick={() => navigate("/emergency")}
          >
            <Bell className="h-5 w-5" />
            Emergency Call
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
