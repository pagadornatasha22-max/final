import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { Edit3, RefreshCw, Save, Search, Shield, User as UserIcon, Users, X } from 'lucide-react';

export default function ManageUsers() {
  const { currentUser, getAllUsers, updateUserById, refreshUsers } = useAuth();
  const users = getAllUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    contactNumber: '',
    address: '',
    password: '',
    role: 'customer' as 'admin' | 'customer',
  });

  const filteredUsers = searchQuery
    ? users.filter((u) =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      contactNumber: user.contactNumber,
      address: user.address,
      password: user.password,
      role: user.role,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserById(editingUser.id, formData);
    setEditingUser(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              <Users size={28} className="text-rose-500" />
              Manage Users
            </h1>
            <p className="text-gray-500 text-sm mt-1">{users.length} registered account{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={refreshUsers} className="px-4 py-2.5 rounded-xl text-gray-600 font-semibold flex items-center gap-2 transition-all text-sm border border-gray-200 hover:bg-gray-50 bg-white">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50">
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            <p className="text-sm text-gray-500">Total Accounts</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50">
            <p className="text-2xl font-bold text-rose-600">{users.filter((u) => u.role === 'customer').length}</p>
            <p className="text-sm text-gray-500">Customers</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50">
            <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === 'admin').length}</p>
            <p className="text-sm text-gray-500">Admins</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, username, or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-sm text-gray-700 bg-white"
            />
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Edit User Account</h3>
                <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'customer' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" disabled={editingUser.id === currentUser?.id}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700" required />
                  <p className="text-xs text-amber-600 mt-1">For production, passwords should be hashed and hidden from admin display.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-gray-700 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)' }}>
                    <Save size={16} /> Save Changes
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100' : 'bg-rose-100'}`}>
                          {user.role === 'admin' ? <Shield size={18} className="text-purple-600" /> : <UserIcon size={18} className="text-rose-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
                          <p className="text-xs text-gray-400">@{user.username} · {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><p className="text-sm text-gray-700">{user.contactNumber}</p><p className="text-xs text-gray-400 truncate max-w-xs">{user.address}</p></td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>{user.role}</span></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4 text-right"><button onClick={() => openEdit(user)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-all"><Edit3 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-100' : 'bg-rose-100'}`}>
                  {user.role === 'admin' ? <Shield size={18} className="text-purple-600" /> : <UserIcon size={18} className="text-rose-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.contactNumber}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>{user.role}</span>
                </div>
                <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}