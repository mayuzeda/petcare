import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  label?: string;
}

const BackButton = ({ to = "/dashboard", label = "Voltar" }: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to === "-1") {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="text-gray-600 hover:text-gray-900 flex items-center"
      onClick={handleClick}
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
};

export default BackButton;
