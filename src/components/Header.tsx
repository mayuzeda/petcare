
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-row gap-6 items-center p-4 bg-indigo-900">
      <Avatar className="cursor-pointer h-24 w-24" onClick={() => navigate("/profile")}>
        <AvatarImage
          src="bella.png"
          alt="Profile picture"
          className="profile-image"
        />
        <AvatarFallback>
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white cursor-pointer" onClick={() => navigate("/home")}>
          Bella
        </h2>
        <p className="text-sm text-gray-200">
          Cão - Fêmea <br />
          SRD <br />
          1 Ano <br />
        </p>
      </div>
    </header>
  );
};

export default Header;
