import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  PawPrint, 
  ChartNoAxesColumn, 
  MapPin,
  Stethoscope,
  Activity,
  Bug
} from "lucide-react";

const icons = [
  { id: 1, name: "Pets", icon: PawPrint, route: "/profile" },
  { id: 2, name: "Gráficos", icon: ChartNoAxesColumn, route: "/charts" },
  { id: 3, name: "Calendário", icon: Calendar, route: "/calendar" },
  { id: 4, name: "Exames", icon: Activity, route: "/exams" },
  { id: 5, name: "Consultas", icon: Stethoscope, route: "/appointments" },
  { id: 6, name: "Vermífugo", icon: Bug, route: "/antiparasitic" },
  { id: 7, name: "GPS", icon: MapPin, route: "/gps" },
  { id: 8, name: "Documentos", icon: FileText, route: "/documents" },
  { id: 9, name: "Chat Petcare", icon: MessageSquare, route: "/chat" },
]; 

const IconGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {icons.map((item) => (
        <div 
          key={item.id} 
          className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => navigate(item.route)}
        >
          <item.icon className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm text-gray-600">{item.name}</span>
        </div>
      ))}    
    </div>
  );
};

export default IconGrid;
