import { useState, useEffect } from 'react';
import { User } from '../../types';
import { Ban, Check, X, Save, CreditCard as Edit2, Search, Filter, Download, UserPlus, AlertTriangle, Lock, Shield } from 'lucide-react';
import { supabase } from '../../services/auth';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
  const [editValues, setEditValues] = useState<{
    accountBalance: number;
    investmentBalance: number;
  }>({ accountBalance: 0, investmentBalance: 0 });
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; userId: string | null; newPassword: string }>({ isOpen: false, userId: null, newPassword: '' });
  const [createAdminModal, setCreateAdminModal] = useState<{ isOpen: boolean; email: string; password: string }>({ isOpen: false, email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user');  // Only fetch regular users, exclude admins

      console.log('Fetch result:', { data, error });

      if (error) throw error;

      if (data) {
        const transformedUsers: User[] = data.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          accountBalance: user.account_balance || 0,
          investmentBalance: user.investment_balance || 0,
          status: user.status || 'active'
        }));
        console.log('Transformed users:', transformedUsers);
        setUsers(transformedUsers);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      console.error('Error updating status:', err);
      setError(errorMessage);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user.id);
    setEditValues({
      accountBalance: user.accountBalance,
      investmentBalance: user.investmentBalance
    });
  };

  const saveEditing = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          account_balance: editValues.accountBalance,
          investment_balance: editValues.investmentBalance
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              accountBalance: editValues.accountBalance,
              investmentBalance: editValues.investmentBalance
            }
          : user
      ));
      setEditingUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      console.error('Error saving changes:', err);
      setError(errorMessage);
    }
  };

  const handleUpdatePassword = async (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updatePassword',
          userId,
          newPassword
        }
      });

      if (error) throw error;

      alert('Password updated successfully');
      setPasswordModal({ isOpen: false, userId: null, newPassword: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      console.error('Error updating password:', err);
      alert(errorMessage);
    }
  };

  const handleCreateAdmin = async (email: string, password: string) => {
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'createAdmin',
          email,
          password
        }
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Function error object:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      alert(`Admin created successfully: ${email}`);
      setCreateAdminModal({ isOpen: false, email: '', password: '' });
      fetchUsers();
    } catch (err) {
      let errorMessage = 'Failed to create admin';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      console.error('Error creating admin:', err, 'Message:', errorMessage);
      alert(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-slate-400">Manage user accounts, balances, and permissions</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button 
            onClick={fetchUsers}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setCreateAdminModal({ isOpen: true, email: '', password: '' })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span>Create Admin</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white">Loading users...</div>
        </div>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | User['status'])}
            className="pl-10 pr-8 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-slate-400 text-sm">Total Users</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</div>
              <div className="text-slate-400 text-sm">Active Users</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{users.filter(u => u.status === 'suspended').length}</div>
              <div className="text-slate-400 text-sm">Suspended</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{users.filter(u => u.status === 'banned').length}</div>
              <div className="text-slate-400 text-sm">Banned</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-slate-300 border-b border-slate-700">
                  <th className="pb-4 font-semibold">User</th>
                  <th className="pb-4 font-semibold">Account Balance</th>
                  <th className="pb-4 font-semibold">Investment Balance</th>
                  <th className="pb-4 font-semibold">Total Value</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                    {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.email}</div>
                      <div className="text-slate-400 text-sm">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  {editingUser === user.id ? (
                    <input
                      type="number"
                      value={editValues.accountBalance}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        accountBalance: Number(e.target.value)
                      })}
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{formatCurrency(user.accountBalance)}</span>
                      <button
                        onClick={() => startEditing(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-4">
                  {editingUser === user.id ? (
                    <input
                      type="number"
                      value={editValues.investmentBalance}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        investmentBalance: Number(e.target.value)
                      })}
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{formatCurrency(user.investmentBalance)}</span>
                      <button
                        onClick={() => startEditing(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-4">
                  <span className="text-white font-semibold">
                    {formatCurrency(user.accountBalance + user.investmentBalance)}
                  </span>
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                      user.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : user.status === 'suspended'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {user.status === 'banned' && <AlertTriangle className="h-3 w-3" />}
                    <span className="capitalize">{user.status}</span>
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    {editingUser === user.id ? (
                      <button
                        onClick={() => saveEditing(user.id)}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                        title="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        {user.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Activate"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'banned')}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Ban"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setPasswordModal({ isOpen: true, userId: user.id, newPassword: '' })}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Change Password"
                        >
                          <Lock className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                  </tr>
                ))}
              </tbody>
            </table>
        
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg">No users found matching your criteria</div>
                <p className="text-slate-500 mt-2">Try adjusting your search or filter settings</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Change Password Modal */}
      {passwordModal.isOpen && passwordModal.userId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Change User Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordModal.newPassword}
                  onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdatePassword(passwordModal.userId!, passwordModal.newPassword)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setPasswordModal({ isOpen: false, userId: null, newPassword: '' })}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {createAdminModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  value={createAdminModal.email}
                  onChange={(e) => setCreateAdminModal({ ...createAdminModal, email: e.target.value })}
                  placeholder="Enter admin email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={createAdminModal.password}
                  onChange={(e) => setCreateAdminModal({ ...createAdminModal, password: e.target.value })}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCreateAdmin(createAdminModal.email, createAdminModal.password)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Admin
                </button>
                <button
                  onClick={() => setCreateAdminModal({ isOpen: false, email: '', password: '' })}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}