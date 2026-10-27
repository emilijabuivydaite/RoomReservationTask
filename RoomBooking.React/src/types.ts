export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: number;
  equipment: string[];
  isActive: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  activeReservations: number;
}

export type ReservationStatus = 'Booked' | 'Completed' | 'Cancelled';

export interface Reservation {
  id: number;
  roomId: number;
  roomName: string;
  organizerId: number;
  organizerName: string;
  title: string;
  start: string;
  end: string;
  attendees: number;
  status: ReservationStatus;
}

export interface UpdateReservation {
  roomId: number;
  organizerId: number;
  title: string;
  start: string;
  end: string;
  attendees: number;
}
