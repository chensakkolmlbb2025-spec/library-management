import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

interface User {
  id?: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (user: User) => void;
  user?: User;
  mode: 'create' | 'edit';
}

export function UserDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  mode,
}: UserDialogProps) {
  const [formData, setFormData] = useState<User>({
    email: '',
    password: '',
    full_name: '',
    role: 'STUDENT',
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        id: user.id,
        email: user.email,
        password: '', // Don't prefill password
        full_name: user.full_name,
        role: user.role,
      });
    } else if (mode === 'create') {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'STUDENT',
      });
    }
  }, [user, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For edit mode, only include password if it's been changed
    const submitData = { ...formData };
    if (mode === 'edit' && !formData.password) {
      delete submitData.password;
    }
    
    onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the user details to create a new account'
              : 'Update user information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                placeholder="John Doe"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="user@example.com"
                disabled={mode === 'edit'} // Don't allow email change in edit mode
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {mode === 'create' && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={mode === 'create'}
                placeholder={
                  mode === 'edit'
                    ? 'Leave blank to keep current password'
                    : 'Minimum 6 characters'
                }
                minLength={6}
              />
              {mode === 'edit' && (
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current password
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
