import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

const CinemaManagement = () => {
    const [cinemas, setCinemas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Khởi tạo state dựa trên các thông tin cơ bản của Rạp
    const initialFormState = {
        maRap: '',
        tenRap: '',
        diaChi: '',
        maThanhPho: 'TP01' // Mặc định là TP01 như bạn đã dùng ở trang Suất chiếu
    };
    const [formData, setFormData] = useState(initialFormState);

    // Tải danh sách Rạp từ Backend
    const loadCinemas = async () => {
        try {
            // Lấy tất cả rạp hoặc rạp theo thành phố
            const res = await fetch(`${API_BASE_URL}/rap`);
            if (res.ok) {
                setCinemas(await res.json());
            } else {
                // Thử dự phòng nếu API bắt buộc có mã thành phố
                const resFallback = await fetch(`${API_BASE_URL}/rap?maThanhPho=TP01`);
                if (resFallback.ok) setCinemas(await resFallback.json());
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách rạp:", error);
        }
    };

    useEffect(() => {
        loadCinemas();
    }, []);

    // Mở form để Sửa
    const openEditModal = (cinema: any) => {
        setIsEditing(true);
        setFormData({
            maRap: cinema.maRap,
            tenRap: cinema.tenRap,
            diaChi: cinema.diaChi,
            maThanhPho: cinema.maThanhPho || 'TP01'
        });
        setIsModalOpen(true);
    };

    // Nút Lưu (Dùng chung cho Thêm Mới và Sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/rap/${formData.maRap}`
            : `${API_BASE_URL}/rap`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(isEditing ? "Cập nhật rạp thành công!" : "Thêm rạp mới thành công!");
                handleCloseModal();
                loadCinemas();
            } else {
                const errorData = await res.text();
                alert(`Lỗi từ Backend: ${errorData}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Nút Xóa
    const handleDelete = async (maRap: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa rạp ${maRap} không? Mọi phòng chiếu và suất chiếu thuộc rạp này có thể bị ảnh hưởng!`)) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/rap/${maRap}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa rạp thành công!");
                loadCinemas();
            } else {
                alert("Lỗi! Không thể xóa rạp này (Có thể rạp đang chứa phòng chiếu hoặc suất chiếu).");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData(initialFormState);
    };

    return (
        <div className="p-8 text-white pt-24">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-gold">Quản Lý Rạp Phim</h1>
                    <p className="text-white/50 mt-1">Thiết lập các chi nhánh rạp trên toàn quốc</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus size={20} /> Thêm Rạp Mới
                </button>
            </div>

            {/* Bảng danh sách Rạp */}
            <div className="bg-[#141414] rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-black/50 text-white/50 text-sm uppercase">
                        <tr>
                            <th className="p-4 w-16 text-center">Icon</th>
                            <th className="p-4">Tên Rạp</th>
                            <th className="p-4">Địa Chỉ</th>
                            <th className="p-4">Mã TP</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {cinemas.map((cinema: any) => (
                            <tr key={cinema.maRap} className="hover:bg-white/5">
                                <td className="p-4 flex justify-center text-gold">
                                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-full">
                                        <MapPin size={18} />
                                    </div>
                                </td>
                                <td className="p-4 font-bold">
                                    {cinema.tenRap} <br />
                                    <span className="text-xs text-white/40 font-normal">{cinema.maRap}</span>
                                </td>
                                <td className="p-4 text-white/80">{cinema.diaChi}</td>
                                <td className="p-4 text-white/60">{cinema.maThanhPho || 'TP01'}</td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <button onClick={() => openEditModal(cinema)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Sửa">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(cinema.maRap)} className="text-red-400 hover:text-red-300 transition-colors" title="Xóa">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {cinemas.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/50">Chưa có rạp chiếu phim nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm/Sửa Rạp */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-[#141414] p-8 rounded-2xl w-full max-w-lg border border-white/10 space-y-4 relative">
                        <button type="button" onClick={handleCloseModal} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
                        <h2 className="text-2xl font-bold text-gold mb-6">
                            {isEditing ? "Cập Nhật Chi Nhánh Rạp" : "Thêm Rạp Mới"}
                        </h2>

                        <div>
                            <label className="block text-sm text-white/50 mb-1">Mã Rạp</label>
                            <input required type="text" placeholder="VD: R01, R02..." value={formData.maRap} disabled={isEditing} className={`w-full border border-white/10 p-3 rounded-lg outline-none focus:border-gold ${isEditing ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-black'}`} onChange={e => setFormData({ ...formData, maRap: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-1">Tên Rạp</label>
                            <input required type="text" placeholder="VD: UTCCinema Thăng Long" value={formData.tenRap} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, tenRap: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-1">Địa Chỉ</label>
                            <input required type="text" placeholder="VD: Số 1 Đại Cồ Việt..." value={formData.diaChi} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, diaChi: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-1">Mã Thành Phố</label>
                            <input required type="text" placeholder="VD: TP01" value={formData.maThanhPho} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, maThanhPho: e.target.value })} />
                        </div>

                        <div className="pt-4 flex gap-4 border-t border-white/10 mt-6">
                            <button type="submit" className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors">
                                {isEditing ? "Lưu Cập Nhật" : "Lưu Rạp Chiếu"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CinemaManagement;