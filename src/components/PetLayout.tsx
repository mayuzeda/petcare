import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import TopNavigation from '@/components/TopNavigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showProfile?: boolean;
  showHelp?: boolean;
  showBottomNavigation?: boolean;
  floatingActionButton?: React.ReactNode;
}

export const PetLayout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showProfile = false,
  showHelp = false,
  showBottomNavigation = true,
  floatingActionButton
}) => {
  return (
    <div className="min-h-screen flex flex-col overflow-none z-[9998]">
      <TopNavigation
        title={title}
        showBackButton={showBackButton}
        showProfile={showProfile}
        showHelp={showHelp}
      />
      <main className={`flex-1 container mx-auto px-4 my-32 overflow-none justify-center items-center flex ${!showBottomNavigation ? 'mb-4' : ''}`}>
        {children}
      </main>
      {showBottomNavigation && <BottomNavigation />}      {/* Floating Action Button */}
      {floatingActionButton && (
        <div className="fixed bottom-24 right-6 z-[9998] rounded-full">
          {floatingActionButton}
        </div>
      )}
    </div>
  );
};

export default PetLayout;
