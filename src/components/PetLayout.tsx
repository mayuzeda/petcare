import React from 'react';
import PetAvatars from '@/components/PetAvatars';

interface LayoutProps {
  children: React.ReactNode;
}

export const PetLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PetAvatars />
      <main className="flex-1 container mx-auto px-4 py-0">
        {children}
      </main>
    </div>
  );
};

export default PetLayout;
