export interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: string;
  releaseDate: string;
  rating: number;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  status: 'Now Showing' | 'Coming Soon' | 'Ended';
  cast: { name: string; role: string; photoUrl: string }[];
}

export interface Showtime {
  id: string;
  movieId: string;
  cinema: string;
  hall: string;
  date: string;
  time: string;
  format: string;
}

export interface Booking {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  seats: string[];
  totalAmount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  bookingDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: 'Gold' | 'Silver' | 'Bronze';
  ltv: number;
  status: 'Active' | 'Inactive' | 'Pending' | 'Deactivated';
}
