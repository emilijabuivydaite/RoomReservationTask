import type { Room, User } from './types';
import type { Reservation, UpdateReservation } from './types';

const API_URL = import.meta.env.VITE_API_URL;

export interface RoomFilters {
  minCapacity?: string;
  floor?: string;
  equipment?: string[];
}

export interface ReservationFilters {
  roomId?: string;
  organizerId?: string;
  status?: string;
  from?: string;
  to?: string;
}

function toQuery(
  params: Record<string, string | string[] | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else if (value) search.append(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function getRooms(filters: RoomFilters = {}): Promise<Room[]> {
  const response = await fetch(`${API_URL}/rooms${toQuery({ ...filters })}`);
  if (!response.ok) {
    throw new Error('Failed to load rooms.');
  }
  return response.json();
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to load users.');
  }
  return response.json();
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) return;
  let message = 'Something went wrong.';
  try {
    const body = await response.json();
    if (body?.message) message = body.message;
  } catch {
    // no JSON body
  }
  throw new Error(message);
}

export async function getReservations(
  filters: ReservationFilters = {},
): Promise<Reservation[]> {
  const response = await fetch(
    `${API_URL}/reservations${toQuery({ ...filters })}`,
  );
  if (!response.ok) {
    throw new Error('Failed to load reservations.');
  }
  return response.json();
}

export async function createReservation(
  data: UpdateReservation,
): Promise<void> {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await ensureOk(response);
}

export async function cancelReservation(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/reservations/${id}/cancel`, {
    method: 'POST',
  });
  await ensureOk(response);
}

export async function endReservation(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/reservations/${id}/end`, {
    method: 'POST',
  });
  await ensureOk(response);
}
