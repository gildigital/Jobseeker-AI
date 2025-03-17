'use client';

import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';

export default function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <Card className="p-6 border-2 pixel-card">
        <div className="flex justify-center">
          <div className="animate-pulse h-12 w-12 rounded-full bg-gray-200"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="animate-pulse h-4 w-3/4 mx-auto bg-gray-200 rounded"></div>
          <div className="animate-pulse h-4 w-1/2 mx-auto bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }
  
  if (status === 'unauthenticated' || !session) {
    return (
      <Card className="p-6 border-2 pixel-card">
        <div className="text-center">
          <p className="mb-4">You are not signed in</p>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="pixel-btn"
          >
            Sign In
          </Button>
        </div>
      </Card>
    );
  }
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  return (
    <Card className="p-6 border-2 pixel-card">
      <div className="flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
          <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-semibold pixel-text">{session.user?.name}</h2>
        <p className="text-gray-500">{session.user?.email}</p>
        
        <div className="mt-6 w-full space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Signed in with:</span>
            <Badge variant="outline">{session.provider || 'Email'}</Badge>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => window.location.href = '/main/settings'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center text-red-500 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
