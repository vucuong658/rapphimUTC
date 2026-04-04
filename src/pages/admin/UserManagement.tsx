import React, { useState, useEffect } from 'react';
import { Search, Download, Shield, User, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách người dùng từ Backend
  const loadUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/nguoi-dung`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Chức năng Xóa User
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/nguoi-dung/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Xóa người dùng thành công!");
        loadUsers();
      } else {
        alert("Không thể xóa người dùng này.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Chức năng Tải CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const headers = ['ID', 'Username', 'Role', 'Status'];
    const csvData = users.map((u: any) => `${u.id},${u.username},${u.role},Active`);
    const csvContent = [headers.join(','), ...csvData].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Danh_Sach_Tai_Khoan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredUsers = users.filter((u: any) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 text-white pt-24 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-white/50">Manage your cinema members and system admins.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-black/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="text-white/40 uppercase bg-black/40">
            <tr>
              <th className="p-4 font-medium">User Info</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user: any) => (
              <tr key={user.id || user.username} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.username || user.hoTen}</div>
                      <div className="text-white/40 text-xs">{user.email || 'No email provided'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-max ${user.role === 'ROLE_ADMIN' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>
                    {user.role === 'ROLE_ADMIN' ? <Shield size={12} /> : <User size={12} />}
                    {user.role || 'ROLE_USER'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(user.id)} className="text-white/40 hover:text-red-400 p-2 transition-colors" title="Delete User">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-white/40">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;