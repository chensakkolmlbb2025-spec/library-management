import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, BarChart3, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserRole } from '@/context/AuthContext';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    role: 'STUDENT' as UserRole 
  });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchSettings();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role,
          },
        },
      });

      if (error) throw error;
      
      toast.success('User created successfully!');
      setNewUser({ email: '', password: '', full_name: '', role: 'STUDENT' });
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update setting');
    }
  };

  const studentCount = profiles.filter(p => p.role === 'STUDENT').length;
  const staffCount = profiles.filter(p => p.role === 'STAFF').length;
  const adminCount = profiles.filter(p => p.role === 'ADMIN').length;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users, configure system settings, and view analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{profiles.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{studentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{staffCount}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{adminCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-strong">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary" />
                Create New User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="glass mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="glass mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password (min 6 characters)"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="glass mt-1"
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger className="glass mt-1">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={createUser} 
                className="mt-4 bg-primary hover:bg-primary-hover"
                disabled={isLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>

            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">All Users</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="glass p-4 border-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium glass">
                      {profile.role}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                System Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="loan-period">Default Loan Period (days)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="loan-period"
                      type="number"
                      value={settings.loan_period_days || '14'}
                      onChange={(e) => setSettings({ ...settings, loan_period_days: e.target.value })}
                      className="glass max-w-xs"
                    />
                    <Button 
                      onClick={() => updateSetting('loan_period_days', settings.loan_period_days)}
                      variant="outline"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fine-rate">Fine Rate ($ per day)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="fine-rate"
                      type="number"
                      step="0.1"
                      value={settings.fine_rate_per_day || '0.50'}
                      onChange={(e) => setSettings({ ...settings, fine_rate_per_day: e.target.value })}
                      className="glass max-w-xs"
                    />
                    <Button 
                      onClick={() => updateSetting('fine_rate_per_day', settings.fine_rate_per_day)}
                      variant="outline"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="max-renewals">Maximum Renewals</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="max-renewals"
                      type="number"
                      value={settings.max_renewals || '2'}
                      onChange={(e) => setSettings({ ...settings, max_renewals: e.target.value })}
                      className="glass max-w-xs"
                    />
                    <Button 
                      onClick={() => updateSetting('max_renewals', settings.max_renewals)}
                      variant="outline"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
