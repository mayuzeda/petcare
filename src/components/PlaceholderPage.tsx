
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PlaceholderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="app-container p-4">
      <header className="flex items-center py-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg ml-2">{pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h2>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-primary capitalize">{pageName} Page</h1>
          <p className="text-gray-600 mt-2">This is a placeholder for the {pageName} page</p>
          <div className="mt-8">
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceholderPage;
