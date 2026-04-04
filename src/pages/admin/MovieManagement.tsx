import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit, Film } from 'lucide-react';
import { API_BASE_URL } from '../../constants';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [theLoais, setTheLoais] = useState([]); // 👉 State mới chứa danh sách Thể Loại
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 👉 Khởi tạo state đã có thêm mảng maTheLoais rỗng
  const initialFormState = {
    maPhim: '',
    tenPhim: '',
    thoiLuong: 120,
    ngayKhoiChieu: '',
    ngonNgu: 'Tiếng Việt',
    doTuoiPhuHop: 13,
    moTa: '',
    poster: '',
    maTheLoais: [] // Mảng chứa các mã thể loại được tick
  };
  const [formData, setFormData] = useState<{ [key: string]: any }>(initialFormState);

  // Tải danh sách phim VÀ danh sách Thể loại
  const loadData = async () => {
    try {
      // Lấy danh sách phim
      const resMovies = await fetch(`${API_BASE_URL}/phim`);
      if (resMovies.ok) setMovies(await resMovies.json());

      // Lấy danh sách thể loại từ API của bạn
      const resTheLoais = await fetch(`${API_BASE_URL}/the-loai`);
      if (resTheLoais.ok) setTheLoais(await resTheLoais.json());
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mở form để Sửa
  const openEditModal = (movie: any) => {
    setIsEditing(true);

    // Trích xuất mảng mã thể loại từ phim (phòng trường hợp BE trả về mảng object)
    let checkedGenres = [];
    if (movie.theLoais) {
      checkedGenres = movie.theLoais.map((tl: any) => tl.maTheLoai || tl);
    } else if (movie.maTheLoais) {
      checkedGenres = movie.maTheLoais;
    }

    setFormData({
      maPhim: movie.maPhim,
      tenPhim: movie.tenPhim,
      thoiLuong: movie.thoiLuong,
      ngayKhoiChieu: movie.ngayKhoiChieu,
      ngonNgu: movie.ngonNgu,
      doTuoiPhuHop: movie.doTuoiPhuHop,
      moTa: movie.moTa,
      poster: movie.poster,
      maTheLoais: checkedGenres // Nạp lại các thể loại đã tick
    });
    setIsModalOpen(true);
  };

  // Hàm xử lý khi ấn tick Checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      if (isChecked) {
        // Nếu tick vào thì thêm mã đó vào mảng
        return { ...prev, maTheLoais: [...prev.maTheLoais, value] };
      } else {
        // Nếu bỏ tick thì rút mã đó ra khỏi mảng
        return { ...prev, maTheLoais: prev.maTheLoais.filter((id: string) => id !== value) };
      }
    });
  };

  // Nút Lưu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra xem đã tick ít nhất 1 thể loại chưa
    if (formData.maTheLoais.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thể loại cho bộ phim!");
      return;
    }

    const token = localStorage.getItem('token');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${API_BASE_URL}/phim/${formData.maPhim}`
      : `${API_BASE_URL}/phim`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData) // 👉 Đã bỏ đoạn ép cứng TL01, gửi formData xịn lên
      });

      if (res.ok) {
        alert(isEditing ? "Cập nhật phim thành công!" : "Thêm phim mới thành công rực rỡ!");
        handleCloseModal();
        loadData();
      } else {
        const errorData = await res.text();
        alert(`Lỗi từ Backend: ${errorData}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Nút Xóa
  const handleDelete = async (maPhim: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phim ${maPhim} không?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/phim/${maPhim}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Đã xóa phim thành công!");
        loadData();
      } else {
        alert("Lỗi! Không thể xóa phim này (Có thể phim đang có suất chiếu).");
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
          <h1 className="text-3xl font-bold text-gold">Quản Lý Phim</h1>
          <p className="text-white/50 mt-1">Thêm, sửa, xóa danh sách phim trong hệ thống</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors">
          <Plus size={20} /> Thêm Phim Mới
        </button>
      </div>

      {/* Bảng danh sách phim */}
      <div className="bg-[#141414] rounded-xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-white/50 text-sm uppercase">
            <tr>
              <th className="p-4 w-16">Poster</th>
              <th className="p-4">Tên Phim</th>
              <th className="p-4">Khởi Chiếu</th>
              <th className="p-4">Thời Lượng</th>
              <th className="p-4">Độ Tuổi</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movies.map((movie: any) => (
              <tr key={movie.maPhim} className="hover:bg-white/5">
                <td className="p-4">
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.tenPhim} className="w-12 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-12 h-16 bg-white/10 flex items-center justify-center rounded-md text-white/30"><Film size={20} /></div>
                  )}
                </td>
                <td className="p-4 font-bold">
                  {movie.tenPhim} <br />
                  <span className="text-xs text-white/40 font-normal">{movie.maPhim} | {movie.ngonNgu}</span>
                </td>
                <td className="p-4 text-white/80">{movie.ngayKhoiChieu}</td>
                <td className="p-4 text-white/80">{movie.thoiLuong} phút</td>
                <td className="p-4 text-gold font-bold">T{movie.doTuoiPhuHop}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => openEditModal(movie)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Sửa">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(movie.maPhim)} className="text-red-400 hover:text-red-300 transition-colors" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {movies.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/50">Chưa có bộ phim nào trong kho.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa Phim */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-[#141414] p-8 rounded-2xl w-full max-w-2xl border border-white/10 space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button type="button" onClick={handleCloseModal} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold text-gold mb-6">
              {isEditing ? "Cập Nhật Thông Tin Phim" : "Thêm Phim Mới"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Mã phim</label>
                <input required type="text" placeholder="VD: P001" value={formData.maPhim} disabled={isEditing} className={`w-full border border-white/10 p-3 rounded-lg outline-none focus:border-gold ${isEditing ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-black'}`} onChange={e => setFormData({ ...formData, maPhim: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">Tên phim</label>
                <input required type="text" placeholder="VD: Avengers: Endgame" value={formData.tenPhim} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, tenPhim: e.target.value })} />
              </div>
            </div>

            {/* 👉 KHU VỰC CHECKBOX THỂ LOẠI */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <label className="block text-sm font-bold text-gold mb-3">Thể loại phim (Có thể chọn nhiều)</label>
              <div className="grid grid-cols-3 gap-3">
                {theLoais.map((tl: any) => (
                  <label key={tl.maTheLoai} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      value={tl.maTheLoai}
                      checked={formData.maTheLoais.includes(tl.maTheLoai)}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 rounded border-white/20 bg-black text-gold focus:ring-gold focus:ring-offset-black cursor-pointer"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {tl.tenTheLoai}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Ngày khởi chiếu</label>
                <input required type="date" value={formData.ngayKhoiChieu} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, ngayKhoiChieu: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">Thời lượng (phút)</label>
                <input required type="number" min="1" value={formData.thoiLuong} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, thoiLuong: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Ngôn ngữ</label>
                <input required type="text" placeholder="VD: Tiếng Anh - Phụ đề Tiếng Việt" value={formData.ngonNgu} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, ngonNgu: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">Độ tuổi phù hợp</label>
                <input required type="number" min="0" placeholder="VD: 13, 16, 18" value={formData.doTuoiPhuHop} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, doTuoiPhuHop: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1">Link ảnh Poster (URL)</label>
              <input type="text" placeholder="https://example.com/poster.jpg" value={formData.poster} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold" onChange={e => setFormData({ ...formData, poster: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1">Mô tả phim</label>
              <textarea rows={3} value={formData.moTa} className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-gold resize-none" onChange={e => setFormData({ ...formData, moTa: e.target.value })}></textarea>
            </div>

            <div className="pt-4 flex gap-4 border-t border-white/10 mt-6">
              <button type="submit" className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors">
                {isEditing ? "Lưu Cập Nhật" : "Lưu Phim"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MovieManagement;