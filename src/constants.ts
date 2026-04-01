import { Movie, User, Showtime } from './types';

export const API_BASE_URL = 'http://localhost:8080/api';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi | Adventure',
    duration: '2h 46m',
    releaseDate: 'March 1, 2024',
    rating: 4.8,
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://picsum.photos/seed/dune/400/600',
    backdropUrl: 'https://picsum.photos/seed/dune-bg/1920/1080',
    status: 'Now Showing',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', photoUrl: 'https://picsum.photos/seed/tim/100/100' },
      { name: 'Zendaya', role: 'Chani', photoUrl: 'https://picsum.photos/seed/zen/100/100' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', photoUrl: 'https://picsum.photos/seed/reb/100/100' },
      { name: 'Josh Brolin', role: 'Gurney Halleck', photoUrl: 'https://picsum.photos/seed/josh/100/100' },
    ]
  },
  {
    id: '2',
    title: 'Oppenheimer',
    genre: 'Biography | Drama',
    duration: '3h 0m',
    releaseDate: 'July 21, 2023',
    rating: 4.9,
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://picsum.photos/seed/opp/400/600',
    backdropUrl: 'https://picsum.photos/seed/opp-bg/1920/1080',
    status: 'Now Showing',
    cast: []
  },
  {
    id: '3',
    title: 'Barbie',
    genre: 'Comedy | Fantasy',
    duration: '1h 54m',
    releaseDate: 'July 21, 2023',
    rating: 4.5,
    description: 'Barbie suffers a crisis that leads her to question her world and her existence.',
    posterUrl: 'https://picsum.photos/seed/barbie/400/600',
    backdropUrl: 'https://picsum.photos/seed/barbie-bg/1920/1080',
    status: 'Now Showing',
    cast: []
  },
  {
    id: '4',
    title: 'The Creator',
    genre: 'Sci-Fi | Action',
    duration: '2h 13m',
    releaseDate: 'Sept 29, 2023',
    rating: 4.2,
    description: 'Amidst a future war between the human race and the forces of artificial intelligence.',
    posterUrl: 'https://picsum.photos/seed/creator/400/600',
    backdropUrl: 'https://picsum.photos/seed/creator-bg/1920/1080',
    status: 'Coming Soon',
    cast: []
  }
];

export const USERS: User[] = [
  { id: 'U1001', name: 'John Doe', email: 'john.doe@email.com', phone: '+1234567890', membershipTier: 'Gold', ltv: 1500, status: 'Active' },
  { id: 'U1002', name: 'Joon Struith', email: 'john.som@email.com', phone: '+1234567890', membershipTier: 'Gold', ltv: 1000, status: 'Active' },
  { id: 'U1003', name: 'Marama Noriks', email: 'laalamea@email.com', phone: '+1234567890', membershipTier: 'Silver', ltv: 500, status: 'Active' },
  { id: 'U1004', name: 'Mark Emign', email: 'mark.iian@email.com', phone: '+1234567890', membershipTier: 'Bronze', ltv: 300, status: 'Active' },
];

export const SHOWTIMES: Showtime[] = [
  { id: 'S1', movieId: '1', cinema: 'UTCCINEMA Grand Central', hall: 'IMAX Hall 1', date: 'Saturday, March 16, 2024', time: '7:30 PM', format: 'IMAX' },
  { id: 'S2', movieId: '1', cinema: 'UTCCINEMA Central Plaza', hall: 'Hall 2', date: 'Saturday, March 16, 2024', time: '10:30 AM', format: 'IMAX' },
  { id: 'S3', movieId: '1', cinema: 'UTCCINEMA Central Plaza', hall: 'Hall 3', date: 'Saturday, March 16, 2024', time: '1:45 PM', format: 'Standard' },
];
