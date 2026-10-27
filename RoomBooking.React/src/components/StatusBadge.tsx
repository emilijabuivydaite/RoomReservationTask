import Badge from './Badge';
import type { ReservationStatus } from '../types';

const reservationVariants = {
  Booked: 'primary',
  Completed: 'success',
  Cancelled: 'secondary',
} as const;

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
  return <Badge variant={reservationVariants[status]}>{status}</Badge>;
}

export function RoomStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'success' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
