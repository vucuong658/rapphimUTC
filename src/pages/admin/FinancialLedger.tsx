import React, { useState, useEffect } from 'react';
import { Search, Download, DollarSign, TrendingUp, Calendar, Ticket, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

const FinancialLedger = () => {
  // 👉 ĐÃ FIX: Thêm <any[]> để nói với TypeScript mảng này chứa object
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu (Dummy data) phòng trường hợp Backend chưa có API
  const dummyData = [
    { maHoaDon: 'HD001', ngayMua: '2026-04-04 14:30', khachHang: 'admin', tenPhim: 'Doraemon', tongTien: 120000, trangThai: 'Thành công' },
    { maHoaDon: 'HD002', ngayMua: '2026-04-04 15:15', khachHang: 'khachhang', tenPhim: 'Avengers: Endgame', tongTien: 250000, trangThai: 'Thành công' },
    { maHoaDon: 'HD003', ngayMua: '2026-04-03 19:00', khachHang: 'user_new', tenPhim: 'Mai', tongTien: 90000, trangThai: 'Thành công' },
  ];

  // Lấy danh sách hóa đơn/giao dịch từ Backend
  const loadTransactions = async () => {
    const token = localStorage.getItem('token');
    try {
      // Đổi '/hoa-don' thành API thực tế của bạn nếu khác
      const res = await fetch(`${API_BASE_URL}/hoa-don`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Nếu DB trống, dùng tạm dữ liệu mẫu để bạn xem trước giao diện
        setTransactions(data.length > 0 ? data : dummyData);
      } else {
        setTransactions(dummyData);
      }
    } catch (error) {
      console.error("Lỗi khi tải doanh thu:", error);
      setTransactions(dummyData); // Fallback khi chưa code BE
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Tính toán thống kê
  const totalRevenue = transactions.reduce((sum, t: any) => sum + (t.tongTien || 0), 0);
  const totalTickets = transactions.length; // Giả sử mỗi HD là 1 vé (có thể nhân lên tùy logic DB của bạn)

  // Lọc danh sách theo từ khóa tìm kiếm (Mã HĐ hoặc Tên KH)
  const filteredTransactions = transactions.filter((t: any) =>
    t.maHoaDon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.khachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenPhim?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chức năng Tải CSV Doanh Thu
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Mã HĐ', 'Ngày Mua', 'Khách Hàng', 'Tên Phim', 'Tổng Tiền (VNĐ)', 'Trạng Thái'];
    const csvData = transactions.map((t: any) => `${t.maHoaDon},${t.ngayMua},${t.khachHang},${t.tenPhim},${t.tongTien},${t.trangThai}`);
    const csvContent = [headers.join(','), ...csvData].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Bao_Cao_Doanh_Thu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 text-white pt-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cash Flow & Revenue</h1>
          <p className="text-white/50">Theo dõi doanh thu bán vé và lịch sử giao dịch.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg font-bold hover:bg-white transition-colors">
          <Download size={18} /> Export Báo Cáo
        </button>
      </div>

      {/* Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#141414] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} className="text-gold" />
          </div>
          <div className="flex items-center gap-3 text-white/50 mb-2">
            <TrendingUp size={20} className="text-green-400" />
            <span className="font-medium text-sm uppercase tracking-wider">Tổng Doanh Thu</span>
          </div>
          <div className="text-4xl font-bold text-gold">
            {totalRevenue.toLocaleString('vi-VN')} <span className="text-xl">VNĐ</span>
          </div>
        </div>

        <div className="bg-[#141414] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Ticket size={64} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-3 text-white/50 mb-2">
            <Ticket size={20} className="text-blue-400" />
            <span className="font-medium text-sm uppercase tracking-wider">Giao Dịch Thành Công</span>
          </div>
          <div className="text-4xl font-bold text-white">
            {totalTickets} <span className="text-xl text-white/50 font-normal">đơn</span>
          </div>
        </div>

        <div className="bg-[#141414] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={64} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-3 text-white/50 mb-2">
            <Calendar size={20} className="text-purple-400" />
            <span className="font-medium text-sm uppercase tracking-wider">Cập Nhật Gần Nhất</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            Hôm nay
          </div>
        </div>
      </div>

      {/* Bảng Lịch Sử Giao Dịch */}
      <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} className="text-gold" /> Chi Tiết Hóa Đơn
          </h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm mã HĐ, tên KH, phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="text-white/40 uppercase bg-black/40">
            <tr>
              <th className="p-4 font-medium">Mã HĐ</th>
              <th className="p-4 font-medium">Thời Gian</th>
              <th className="p-4 font-medium">Khách Hàng</th>
              <th className="p-4 font-medium">Phim</th>
              <th className="p-4 font-medium text-right">Tổng Tiền</th>
              <th className="p-4 font-medium text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-white/40">Đang tải dữ liệu...</td></tr>
            ) : filteredTransactions.map((t: any) => (
              <tr key={t.maHoaDon} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-white/80">{t.maHoaDon}</td>
                <td className="p-4 text-white/60">{t.ngayMua}</td>
                <td className="p-4 font-bold">{t.khachHang}</td>
                <td className="p-4 text-gold">{t.tenPhim}</td>
                <td className="p-4 text-right font-bold">
                  {t.tongTien?.toLocaleString('vi-VN')} đ
                </td>
                <td className="p-4 text-center">
                  <span className="text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-medium">
                    {t.trangThai || 'Thành công'}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40">Không tìm thấy giao dịch nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialLedger;