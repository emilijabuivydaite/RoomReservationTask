import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelReservation,
  endReservation,
  getReservations,
  getRooms,
  getUsers,
  type ReservationFilters,
} from '../api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';
import { ReservationStatusBadge } from '../components/StatusBadge';
import FilterAccordion from '../components/FilterAccordion';
import { useFetch } from '../useFetch';

interface Draft {
  roomId: string;
  organizerId: string;
  status: string;
  from: string;
  to: string;
}

const emptyDraft: Draft = {
  roomId: '',
  organizerId: '',
  status: '',
  from: '',
  to: '',
};

export default function ReservationsPage() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [applied, setApplied] = useState<ReservationFilters>({});

  const fetcher = useCallback(() => getReservations(applied), [applied]);
  const { data, error, loading, reload, setError } = useFetch(fetcher);
  const reservations = data ?? [];

  // dropdown data for the filter bar (no filters, so stable functions)
  const { data: rooms, error: roomsError } = useFetch(getRooms);
  const { data: users, error: usersError } = useFetch(getUsers);

  async function runAction(action: () => Promise<void>) {
    try {
      await action();
      await reload(); // refresh from the server, filters stay applied
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApplied({
      roomId: draft.roomId,
      organizerId: draft.organizerId,
      status: draft.status,
      from: draft.from ? new Date(`${draft.from}T00:00:00`).toISOString() : '',
      to: draft.to ? new Date(`${draft.to}T23:59:59`).toISOString() : '',
    });
  }

  function handleReset() {
    setDraft(emptyDraft);
    setApplied({});
  }

  const now = new Date();

  const activeFilters = Object.values(applied).filter(Boolean).length;

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Reservations</h1>
        <Link to="/reservations/new" className="btn-solid theme-accent">
          New reservation
        </Link>
      </div>

      <FilterAccordion activeCount={activeFilters}>
        <form
          className="card card-body shadow-sm mb-4 row g-3"
          onSubmit={handleSubmit}
        >
          <div className="col-md-3">
            <label htmlFor="roomId" className="form-label">
              Room
            </label>
            <select
              id="roomId"
              className="form-select"
              value={draft.roomId}
              onChange={(e) => setDraft({ ...draft, roomId: e.target.value })}
            >
              <option value="">All rooms</option>
              {(rooms ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="organizerId" className="form-label">
              Organizer
            </label>
            <select
              id="organizerId"
              className="form-select"
              value={draft.organizerId}
              onChange={(e) =>
                setDraft({ ...draft, organizerId: e.target.value })
              }
            >
              <option value="">All organizers</option>
              {(users ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-2">
            <label htmlFor="from" className="form-label">
              From
            </label>
            <input
              id="from"
              type="date"
              className="form-control"
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="to" className="form-label">
              To
            </label>
            <input
              id="to"
              type="date"
              className="form-control"
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn-solid theme-accent">
              Apply filters
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </FilterAccordion>

      <ErrorAlert message={error ?? roomsError ?? usersError} />

      {loading ? (
        <Loading />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">Room</th>
                <th scope="col">Organizer</th>
                <th scope="col">Title</th>
                <th scope="col">Start</th>
                <th scope="col">End</th>
                <th scope="col">Attendees</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No reservations found.
                  </td>
                </tr>
              )}
              {reservations.map((r) => {
                const isBooked = r.status === 'Booked';
                const canCancel = isBooked && new Date(r.end) > now;
                const canEnd =
                  isBooked && new Date(r.start) <= now && new Date(r.end) > now;

                return (
                  <tr key={r.id}>
                    <th scope="row">{r.roomName}</th>
                    <td>{r.organizerName}</td>
                    <td>{r.title}</td>
                    <td>{new Date(r.start).toLocaleString()}</td>
                    <td>{new Date(r.end).toLocaleString()}</td>
                    <td>{r.attendees}</td>
                    <td>
                      <ReservationStatusBadge status={r.status} />
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {canCancel && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              runAction(() => cancelReservation(r.id))
                            }
                          >
                            Cancel
                          </button>
                        )}
                        {canEnd && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              runAction(() => endReservation(r.id))
                            }
                          >
                            End early
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
