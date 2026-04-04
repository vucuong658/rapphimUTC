import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit } from 'lucide-react'; // 👉 Đã thêm icon Edit
import { API_BASE_URL } from '../../constants';

const ShowtimeManagement = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // 👉 State mới để biết đang Thêm hay Sửa

    const initialFormState = {
        maSuat: '', maPhim: '', maRap: '', maPhong: '', ngayChieu: '', gioChieu: '', gia: 80000
    };
    const [formData, setFormData] = useState(initialFormState);

    // Tải dữ liệu ban đầu
    const loadAllData = async () => {
        try {
            const resMovies = await fetch(`${API_BASE_URL}/phim`);
            if (resMovies.ok) setMovies(await resMovies.json());

            const resCinemas = await fetch(`${API_BASE_URL}/rap?maThanhPho=TP01`);
            if (resCinemas.ok) setCinemas(await resCinemas.json());

            loadShowtimes();
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    const loadShowtimes = async () => {
        const res = await fetch(`${API_BASE_URL}/suat-chieu`);
        if (res.ok) setShowtimes(await res.json());
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleCinemaChange = (maRap: string) => {
        setFormData({ ...formData, maRap, maPhong: '' });
        fetch(`${API_BASE_URL}/phong-chieu?maRap=${maRap}`)
            .then(res => res.json())
            .then(data => setRooms(data));
    };

    // 👉 CHỨC NĂNG 1: MỞ FORM ĐỂ SỬA
    const openEditModal = (st: any) => {
        setIsEditing(true);
        setFormData({
            maSuat: st.maSuat,
            maPhim: st.maPhim,
            maRap: st.maRap,
            maPhong: st.maPhong,
            ngayChieu: st.ngayChieu,
            gioChieu: st.gioChieu.substring(0, 5), // Cắt bớt giây đi để hiển thị đẹp trên Form
            gia: st.gia
        });

        // Load luôn danh sách phòng của cái Rạp đang chọn
        fetch(`${API_BASE_URL}/phong-chieu?maRap=${st.maRap}`)
            .then(res => res.json())
            .then(data => setRooms(data));

        setIsModalOpen(true);
    };

    // 👉 CHỨC NĂNG 2: NÚT LƯU (Dùng chung cho cả Thêm và Sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let formattedTime = formData.gioChieu;
        if (formattedTime.length > 5) {
            formattedTime = formattedTime.substring(0, 5);
        }

        const dataToSend = { ...formData, gioChieu: formattedTime };
        const token = localStorage.getItem('token');

        // Nếu đang sửa thì dùng phương thức PUT và gắn ID vào link, ngược lại dùng POST
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing
            ? `${API_BASE_URL}/suat-chieu/${formData.maSuat}`
            : `${API_BASE_URL}/suat-chieu`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (res.ok) {
                alert(isEditing ? "Cập nhật thành công!" : "Tạo suất chiếu thành công!");
                handleCloseModal();
                loadShowtimes(); // Tải lại bảng
            } else {
                const errorData = await res.text();
                alert(`Lỗi từ Backend: ${errorData}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 👉 CHỨC NĂNG 3: XÓA SUẤT CHIẾU
    const handleDelete = async (maSuat: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu ${maSuat} không?`)) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/suat-chieu/${maSuat}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa suất chiếu!");
                loadShowtimes();
            } else {
                alert("Lỗi! Không thể xóa suất chiếu này.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData(initialFormState); // Dọn dẹp form
        setRooms([]);
    };

    return (
        <div className="p-8 text-white pt-24">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-gold">Quản Lý Suất Chiếu</h1>
                    <p className="text-white/50 mt-1">Lên lịch chiếu phim cho các rạp</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus size={20} /> Thêm Suất Chiếu
                </button>
            </div>

            <div className="bg-[#141414] rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-black/50 text-white/50 text-sm uppercase">
                        <tr>
                            <th className="p-4">Phim</th>
                            <th className="p-4">Rạp / Phòng</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Giá vé</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {showtimes.map((st: any) => (
                            <tr key={st.maSuat || Math.random()} className="hover:bg-white/5">
                                <td className="p-4 font-bold">{st.tenPhim || st.phim?.tenPhim || 'N/A'} <br /><span className="text-xs text-white/40 font-normal">{st.maSuat}</span></td>
                                <td className="p-4 text-white/60">{st.tenRap || 'N/A'} - {st.tenPhong || st.phongChieu?.tenPhong || 'N/A'}</td>
                                <td className="p-4">{st.ngayChieu} | {st.gioChieu}</td>
                                <td className="p-4 text-gold">{st.gia?.toLocaleString()}đ</td>
                                <td className="p-4">
                                    {/* 👉 Hai nút Sửa và Xóa */}
                                    <div className="flex items-center justify-center gap-3">
                                        <button onClick={() => openEditModal(st)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Sửa">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(st.maSuat)} className="text-red-400 hover:text-red-300 transition-colors" title="Xóa">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {showtimes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/50">Chưa có lịch chiếu nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-[#141414] p-8 rounded-2xl w-full max-w-lg border border-white/10 space-y-4 relative">
                        <button type="button" onClick={handleCloseModal} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
                        <h2 className="text-2xl font-bold text-gold mb-6">
                            {isEditing ? "Cập Nhật Suất Chiếu" : "Tạo Lịch Chiếu Mới"}
                        </h2>

                        <div>
                            {/* Nếu đang Sửa thì khóa ô Mã suất lại (không cho đổi ID) */}
                            <input required type="text" placeholder="Mã suất chiếu (VD: SC009)" value={formData.maSuat} disabled={isEditing} className={`w-full border border-white/10 p-3 rounded-lg outline-none focus:border-gold ${isEditing ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-black'}`} onChange={e => setFormData({ ...formData, maSuat: e.target.value })} />
                        </div>

                        <select required value={formData.maPhim} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, maPhim: e.target.value })}>
                            <option value="">-- Chọn Phim --</option>
                            {movies.map((m: any) => <option key={m.maPhim} value={m.maPhim}>{m.tenPhim}</option>)}
                        </select>

                        <select required value={formData.maRap} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => handleCinemaChange(e.target.value)}>
                            <option value="">-- Chọn Rạp --</option>
                            {cinemas.map((c: any) => <option key={c.maRap} value={c.maRap}>{c.tenRap}</option>)}
                        </select>

                        <select required value={formData.maPhong} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, maPhong: e.target.value })}>
                            <option value="">-- Chọn Phòng --</option>
                            {rooms.map((r: any) => <option key={r.maPhong} value={r.maPhong}>{r.tenPhong}</option>)}
                        </select>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-white/50 mb-1">Ngày chiếu</label>
                                <input required type="date" className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" value={formData.ngayChieu} onChange={e => setFormData({ ...formData, ngayChieu: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-white/50 mb-1">Giờ chiếu</label>
                                <input required type="time" className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" value={formData.gioChieu} onChange={e => setFormData({ ...formData, gioChieu: e.target.value })} />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4 border-t border-white/10 mt-6">
                            <button type="submit" className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors">
                                {isEditing ? "Lưu Cập Nhật" : "Lưu Suất Chiếu"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ShowtimeManagement;