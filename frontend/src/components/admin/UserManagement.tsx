import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockSupervisors, mockWorkers, mockSites, User } from '../../lib/mockData';

export function UserManagement() {
  const [supervisors, setSupervisors] = useState<User[]>(mockSupervisors);
  const [workers, setWorkers] = useState<User[]>(mockWorkers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'supervisor' | 'worker'>('worker');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    site: '',
  });

  const handleAdd = () => {
    const newUser: User = {
      id: `${userType}-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: userType,
      site: formData.site,
    };

    if (userType === 'supervisor') {
      setSupervisors([...supervisors, newUser]);
    } else {
      setWorkers([...workers, newUser]);
    }

    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', site: '' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      site: user.site || '',
    });
  };

  const handleUpdate = () => {
    if (!editingUser) return;

    const updateList = editingUser.role === 'supervisor' ? supervisors : workers;
    const setList = editingUser.role === 'supervisor' ? setSupervisors : setWorkers;

    setList(updateList.map(user =>
      user.id === editingUser.id
        ? { ...user, ...formData }
        : user
    ));

    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', site: '' });
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      if (user.role === 'supervisor') {
        setSupervisors(supervisors.filter(s => s.id !== user.id));
      } else {
        setWorkers(workers.filter(w => w.id !== user.id));
      }
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 mb-1">{user.name}</h3>
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
            {user.site && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📍</span>
                <span>{user.site}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleEdit(user)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(user)}
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-600">Manage supervisors and workers</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workers" className="w-full">
        <TabsList>
          <TabsTrigger value="workers">Workers ({workers.length})</TabsTrigger>
          <TabsTrigger value="supervisors">Supervisors ({supervisors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <UserCard key={worker.id} user={worker} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supervisors" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supervisors.map((supervisor) => (
              <UserCard key={supervisor.id} user={supervisor} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={(value: 'supervisor' | 'worker') => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rajesh Kumar"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., john.doe@company.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +1-555-0100"
              />
            </div>
            <div>
              <Label htmlFor="site">Assigned Site</Label>
              <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {mockSites.map((site) => (
                    <SelectItem key={site.id} value={site.name}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-site">Assigned Site</Label>
              <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {mockSites.map((site) => (
                    <SelectItem key={site.id} value={site.name}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}