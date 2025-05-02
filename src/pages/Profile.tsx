
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container p-4">
      <header className="flex items-center py-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg ml-2">Profile</h2>
      </header>
      
      <main className="flex-1">
        <div className="flex flex-col items-center justify-center py-8">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src="https://source.unsplash.com/random/200x200/?portrait" 
              alt="Profile picture"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary" 
            />
            <AvatarFallback className="w-24 h-24">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mt-4">John Doe</h1>
          <p className="text-gray-600">john.doe@example.com</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg border-b pb-2">Personal Information</h2>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span>John Doe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span>john.doe@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span>+1 234 567 890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span>New York, USA</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate("/settings")}
          >
            Edit Profile
          </Button>
          
          <Button 
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => navigate("/")}
          >
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
