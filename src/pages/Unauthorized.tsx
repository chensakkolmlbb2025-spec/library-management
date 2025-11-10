import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} className="btn-primary">
          Go Back
        </Button>
      </div>
    </div>
  );
}
