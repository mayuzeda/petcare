import React from 'react';
import { ArrowLeft, User, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopNavigationProps {
    title?: string;
    showBackButton?: boolean;
    showProfile?: boolean;
    showHelp?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
    title,
    showBackButton = true,
    showProfile = false,
    showHelp = false,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determinar se é a página inicial (Dashboard)
    const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleHelpClick = () => {
        // Por enquanto, pode abrir um modal de ajuda ou navegar para uma página de ajuda
        console.log('Ajuda clicada');
    };    return (
        <div className="fixed top-0 left-0 right-0 shadow-sm z-[9999] flex flex-col align-center items-center">
            <div className="w-full flex items-center justify-between px-4 py-3 bg-indigo-950">

                {/* Lado Esquerdo */}
                <div className="flex items-center w-12 ">
                    {isDashboard && showProfile ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={handleProfileClick}
                        >
                            <User className="h-5 w-5 text-white" />
                        </Button>
                    ) : showBackButton ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={handleBackClick}
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Button>
                    ) : null}
                </div>

                {/* Centro - Logo */}
                <div className="flex-1 flex justify-center">
                    <img
                        src="/logo-petcare.svg"
                        alt="PetCare"
                        className="h-6 w-auto"
                    />
                </div>

                {/* Lado Direito */}
                <div className="flex items-center w-12 justify-end">
                    {isDashboard && showHelp && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={handleHelpClick}
                        >
                            <HelpCircle className="h-5 w-5 text-white" />
                        </Button>
                    )}
                </div>
            </div>            {/* Título da Página (se não for Dashboard) */}
            {title && !isDashboard && (
                <div className="relative px-4 py-2 pt-4 z-[9999] align-middle flex items-center justify-center bg-white w-full">
                    <h1 className="text-xl font-medium text-indigo-950">{title}</h1>
                    {/* Degradê na parte inferior */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-transparent to-gray-100/50"></div>
                </div>
            )}
        </div>
    );
};

export default TopNavigation;