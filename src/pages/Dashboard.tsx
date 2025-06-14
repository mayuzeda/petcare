import { useNavigate } from "react-router-dom";
import IconGrid from "@/components/IconGrid";
import PetLayout from "@/components/PetLayout";
import { usePet } from "@/contexts/PetContext";
import UpcomingEventsWidget from "@/components/UpcomingEventsWidget";

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedPet } = usePet();
  return (
    <PetLayout
      showProfile={true}
      showHelp={true}
      showBackButton={false}
    >
      <div className="h-[70vh] -mt-16">
        <div className="mb-2 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold">Olá, esse é perfil de {selectedPet.name}</h1>
          <p className="text-gray-600">O que você gostaria de acessar?</p>
        </div>

        <section className="flex-1 mb-6">
          <IconGrid />
        </section>

        <section className="mb-0">
          <UpcomingEventsWidget />
        </section>
      </div>
    </PetLayout>
  );
};

export default Dashboard;
