import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ChatIconProps {
  className?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="icon"
      className={`rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  );
};

export default ChatIcon;
