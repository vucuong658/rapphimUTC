import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Info } from 'lucide-react';

// Dữ liệu giả lập cho ngày và giờ chiếu (Sẽ thay bằng API sau)
const DATES = ['Thứ 5, 03/04', 'Thứ 6, 04/04', 'Thứ 7, 05/04'];
const TIMES = ['09:00', '12:30', '15:00', '19:45', '22:15'];

const SeatSelection = () => {
  const { id } = useParams(); // Lấy ID phim từ URL
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState(TIMES[3]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Giả lập tạo sơ đồ ghế (8 hàng, mỗi hàng 10 ghế)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  // Giả lập một vài ghế đã có người mua
  const bookedSeats = ['D4', 'D5', 'E7', 'E8', 'F5'];

  // Hàm xử lý khi người dùng click vào 1 ghế
  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return; // Ghế đã bán thì không cho click

    if (selectedSeats.includes(seatId)) {
      // Nếu đã chọn rồi thì bỏ chọn
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      // Nếu chưa chọn thì thêm vào danh sách (tối đa 8 ghế)
      if (selectedSeats.length < 8) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert("Bạn chỉ được đặt tối đa 8 ghế cho một lần giao dịch!");
      }
    }
  };

  // Tính tổng tiền tạm tính (Giả sử ghế VIP hàng D,E,F giá 120k, thường 80k)
  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);
      if (['D', 'E', 'F'].includes(row)) total += 120000;
      else total += 80000;
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Thanh điều hướng */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/movie/${id}`} className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại thông tin phim
          </Link>
          <h1 className="text-2xl font-bold font-serif text-gold">CHỌN VỊ TRÍ GHẾ</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* CỘT TRÁI: SƠ ĐỒ PHÒNG CHIẾU */}
          <div className="lg:col-span-2 bg-[#141414] rounded-2xl p-8 border border-white/5">

            {/* Chọn Ngày & Giờ */}
            <div className="mb-10">
              <h3 className="text-sm text-white/50 mb-3 uppercase tracking-wider">Ngày chiếu</h3>
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {DATES.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`whitespace-nowrap px-6 py-2 rounded-lg font-semibold transition-colors ${selectedDate === date ? 'bg-gold text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >
                    {date}
                  </button>
                ))}
              </div>

              <h3 className="text-sm text-white/50 mb-3 uppercase tracking-wider">Suất chiếu</h3>
              <div className="flex gap-3 flex-wrap">
                {TIMES.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-5 py-2 rounded-lg font-semibold transition-colors ${selectedTime === time ? 'bg-gold text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Màn hình */}
            <div className="relative mb-16 mt-8">
              <div className="w-full h-12 border-t-4 border-gold rounded-t-[50%] opacity-50 blur-[2px]"></div>
              <div className="absolute top-0 w-full text-center text-gold/50 text-sm tracking-[0.5em] font-semibold mt-2">
                MÀN HÌNH CHÍNH
              </div>
            </div>

            {/* Lưới ghế ngồi */}
            <div className="flex flex-col gap-3 items-center overflow-x-auto pb-8">
              {rows.map((row) => (
                <div key={row} className="flex gap-3 items-center">
                  <div className="w-6 text-center text-white/40 font-bold">{row}</div>

                  <div className="flex gap-2">
                    {Array.from({ length: seatsPerRow }).map((_, idx) => {
                      const seatNum = idx + 1;
                      const seatId = `${row}${seatNum}`;
                      const isBooked = bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      const isVIP = ['D', 'E', 'F'].includes(row);

                      // Lên màu cho ghế
                      let seatColor = "bg-white/20 hover:bg-white/40"; // Ghế thường
                      if (isVIP) seatColor = "bg-purple-900/50 border border-purple-500/50 hover:bg-purple-800/80"; // Ghế VIP
                      if (isBooked) seatColor = "bg-red-900/40 border border-red-900 text-transparent cursor-not-allowed"; // Đã bán
                      if (isSelected) seatColor = "bg-gold text-black border-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]"; // Đang chọn

                      // Tách lối đi ở giữa (sau ghế số 5)
                      const marginRight = seatNum === 5 ? "mr-8" : "";

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          disabled={isBooked}
                          className={`w-10 h-10 rounded-t-lg rounded-b-sm text-xs font-bold transition-all duration-200 flex items-center justify-center ${seatColor} ${marginRight}`}
                        >
                          {!isBooked && seatNum}
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-6 text-center text-white/40 font-bold">{row}</div>
                </div>
              ))}
            </div>

            {/* Chú thích ghế */}
            <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/10 mt-4">
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t-sm bg-white/20"></div><span className="text-sm text-white/60">Thường</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t-sm bg-purple-900/50 border border-purple-500/50"></div><span className="text-sm text-white/60">VIP</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t-sm bg-gold"></div><span className="text-sm text-white/60">Đang chọn</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t-sm bg-red-900/40 border border-red-900"></div><span className="text-sm text-white/60">Đã bán</span></div>
            </div>
          </div>

          {/* CỘT PHẢI: BILL THANH TOÁN */}
          <div className="bg-[#141414] rounded-2xl p-8 border border-white/5 h-fit sticky top-24">
            <h2 className="text-2xl font-bold font-serif text-white mb-6">Thông Tin Đặt Vé</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-4 border-b border-white/10">
                <span className="text-white/60">Ngày chiếu</span>
                <span className="font-semibold text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-white/10">
                <span className="text-white/60">Giờ chiếu</span>
                <span className="font-semibold text-white">{selectedTime}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-white/10">
                <span className="text-white/60">Ghế đã chọn</span>
                <span className="font-semibold text-gold max-w-[150px] text-right">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn ghế'}
                </span>
              </div>
            </div>

            <div className="bg-black/50 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-end">
                <span className="text-white/60 uppercase text-sm font-bold tracking-wider">Tổng cộng</span>
                <span className="text-4xl font-bold text-gold">
                  {calculateTotal().toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${selectedSeats.length > 0
                ? 'bg-gold text-black hover:bg-white hover:scale-[1.02]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
            >
              Tiếp Tục Thanh Toán
            </button>

            {selectedSeats.length === 0 && (
              <p className="text-center text-sm text-white/40 mt-4 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> Vui lòng chọn ít nhất 1 ghế
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeatSelection;