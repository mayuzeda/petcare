
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center py-4">
      <h2 className="font-semibold text-lg">MyApp</h2>
      <Avatar className="cursor-pointer" onClick={() => navigate("/profile")}>
        <AvatarImage 
          src="https://source.unsplash.com/random/100x100/?portrait" 
          alt="Profile picture" 
          className="profile-image" 
        />
        <AvatarFallback>
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
};

export default Header;
