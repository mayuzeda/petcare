import { useState } from "react";
import { MessageCircle, Bell, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { usePet } from "@/contexts/PetContext";
import { useNotifications } from "@/hooks/use-notifications";
import { getRelativeTime, notificationColors, notificationIcons } from "@/data/notifications";
import AddPetForm from "./AddPetForm";
import { useNavigate } from "react-router-dom";

export default function BottomNavigation() {
    const { pets, selectedPet, setSelectedPet, addPet } = usePet();
    const {
        getSelectedPetNotifications,
        getSelectedPetUnreadCount,
        markAsRead,
        markAllAsRead
    } = useNotifications();
    const [addPetModalOpen, setAddPetModalOpen] = useState(false);
    const [petSelectorOpen, setPetSelectorOpen] = useState(false);
    const navigate = useNavigate();

    const selectedPetNotifications = getSelectedPetNotifications();
    const unreadCount = getSelectedPetUnreadCount();

    const handleChatClick = () => {
        navigate('/chat');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-950 border-t shadow-lg z-[9999]">
            <div className="flex justify-around px-6 py-3">
                {/* Chat Icon */}
                <div className="flex-1  flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-col items-center gap-1 p-2 focus:bg-indigo-900 hover:bg-indigo-900"
                        onClick={handleChatClick}
                    >
                        <MessageCircle className="h-6 w-6 text-white" />
                        <span className="text-xs text-white">Chat</span>
                    </Button>
                </div>
                {/* Pet Selector */}
                <div className="flex-3  flex items-center justify-center">
                    <Popover open={petSelectorOpen} onOpenChange={setPetSelectorOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex flex-col items-center gap- p-2 hover:bg-indigo-900 focus:bg-indigo-900"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-orange-500 ring-orange-500 flex items-center justify-center ring-4 -mt-12">
                                        <img
                                            src={selectedPet.image}
                                            alt={`${selectedPet.name} Avatar`}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-white font-medium">{selectedPet.name}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 mb-6 z-[9998]" side="top" align="center">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm text-gray-900 mb-3">Selecionar Pet</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {pets.map((pet) => (
                                            <button
                                                key={pet.id}
                                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${selectedPet.id === pet.id
                                                    ? "bg-primary/10 ring-2 ring-primary"
                                                    : "hover:bg-gray-100"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedPet(pet);
                                                    setPetSelectorOpen(false);
                                                }}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                                                    <img
                                                        src={pet.image}
                                                        alt={`${pet.name} Avatar`}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">{pet.name}</span>
                                            </button>
                                        ))}

                                        {/* Add Pet Button */}
                                        <button
                                            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => {
                                                setAddPetModalOpen(true);
                                                setPetSelectorOpen(false);
                                            }}
                                        >
                                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-1">
                                                <Plus className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">Adicionar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {/* <div className="flex-1  flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-col items-center p-2 hover:bg-indigo-900 focus:bg-indigo-900 transition-colors"
                        onClick={() => navigate('/calendar')}
                    >
                        <div className="relative">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs text-white">Calendário</span>
                    </Button>
                </div> */}

                {/* Notifications */}
                <div className="flex-1 flex items-center justify-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="flex flex-col items-center p-2 -mr-1 hover:bg-indigo-900 focus:bg-indigo-900 transition-colors"
                            >
                                <div className="relative">
                                    <Bell className="h-6 w-6 text-white" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-white">Notificações</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[400px] sm:w-[540px] z-[9999]">
                            <SheetHeader>
                                <div className="flex flex-col items-center justify-between">
                                    <div>
                                        <SheetTitle>Notificações</SheetTitle>
                                        <SheetDescription>
                                            Suas notificações e lembretes sobre {selectedPet.name}
                                        </SheetDescription>
                                    </div>
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAllAsRead(selectedPet.id)}
                                            className="text-xs"
                                        >
                                            Marcar todas como lidas
                                        </Button>
                                    )}
                                </div>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                {selectedPetNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${!notification.read
                                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        onClick={() => {
                                            if (!notification.read) {
                                                markAsRead(notification.id);
                                            }
                                            // Se a notificação tem um evento associado, navegar para o calendário
                                            if (notification.eventId) {
                                                navigate('/calendar');
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="text-lg flex-shrink-0 mt-0.5 text-primary">
                                                    {notificationIcons[notification.type]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <p className="text-xs text-gray-500">
                                                            {getRelativeTime(notification.time)}
                                                        </p>
                                                        {notification.priority === 'high' && (
                                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                                                Urgente
                                                            </Badge>
                                                        )}
                                                        {notification.actionRequired && (
                                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                                Ação necessária
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {selectedPetNotifications.length === 0 && (
                                    <div className="text-center py-8">
                                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Nenhuma notificação</p>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Add Pet Modal */}
            <AddPetForm
                open={addPetModalOpen}
                onOpenChange={setAddPetModalOpen}
                onAddPet={addPet}
            />
        </div>
    );
}
