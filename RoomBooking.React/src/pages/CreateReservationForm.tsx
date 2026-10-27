import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createReservation, getRooms, getUsers } from '../api';
import type { Room, User } from '../types';
import ErrorAlert from '../components/ErrorAlert';

export default function CreateReservationForm() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState('');
  const [organizerId, setOrganizerId] = useState('');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [attendees, setAttendees] = useState('1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch((e: Error) => setError(e.message));
    getUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReservation({
        roomId: Number(roomId),
        organizerId: Number(organizerId),
        title,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        attendees: Number(attendees),
      });
      navigate('/reservations'); // back to the list
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 720 }}>
      <div className="mb-3">
        <Link to="/reservations" className="text-decoration-none">
          &larr; Back to reservations
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-4">New reservation</h1>

          <ErrorAlert message={error} />

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6">
              <label htmlFor="room" className="form-label">
                Room
                <select
                  id="room"
                  className="form-select"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (capacity {r.capacity})
                      {r.isActive ? '' : ' - inactive'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="col-md-6">
              <label htmlFor="organizer" className="form-label">
                Organizer
                <select
                  id="organizer"
                  className="form-select"
                  value={organizerId}
                  onChange={(e) => setOrganizerId(e.target.value)}
                  required
                >
                  <option value="">Select an organizer</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="col-12">
              <label htmlFor="title" className="form-label">
                Title
                <input
                  id="title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={50}
                  required
                />
              </label>
            </div>

            <div className="col-md-6">
              <label htmlFor="start" className="form-label">
                Start
                <input
                  id="start"
                  type="datetime-local"
                  className="form-control"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="col-md-6">
              <label htmlFor="end" className="form-label">
                End
                <input
                  id="end"
                  type="datetime-local"
                  className="form-control"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="col-md-4">
              <label htmlFor="attendees" className="form-label">
                Attendees
                <input
                  id="attendees"
                  type="number"
                  className="form-control"
                  min={1}
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 pt-2">
              <button type="submit" className="btn-solid theme-accent">
                Create
              </button>
              <button
                type="button"
                className="btn-solid theme-secondary"
                onClick={() => navigate('/reservations')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
