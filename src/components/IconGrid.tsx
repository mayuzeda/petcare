
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings, 
  User, 
  BookOpen, 
  Map, 
  ShoppingCart, 
  BarChart
} from "lucide-react";

const icons = [
  { id: 1, name: "Calendar", icon: Calendar, route: "/calendar" },
  { id: 2, name: "Messages", icon: MessageSquare, route: "/messages" },
  { id: 3, name: "Documents", icon: FileText, route: "/documents" },
  { id: 4, name: "Profile", icon: User, route: "/profile" },
  { id: 5, name: "Courses", icon: BookOpen, route: "/courses" },
  { id: 6, name: "Map", icon: Map, route: "/map" },
  { id: 7, name: "Shop", icon: ShoppingCart, route: "/shop" },
  { id: 8, name: "Statistics", icon: BarChart, route: "/statistics" },
  { id: 9, name: "Settings", icon: Settings, route: "/settings" },
];

const IconGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="icon-grid">
      {icons.map((item) => (
        <div 
          key={item.id} 
          className="icon-item"
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
