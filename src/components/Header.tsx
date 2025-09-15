import { Shield, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">TANGEDCO Risk Monitor</h1>
                <p className="text-xs text-muted-foreground">Tamil Nadu Electricity Board</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.display_name || user?.email || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile?.display_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {profile?.role && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/reports')}>
                  Reports Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}