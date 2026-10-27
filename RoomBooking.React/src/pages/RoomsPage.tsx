import { useCallback, useState } from 'react';
import { getRooms, type RoomFilters } from '../api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import { RoomStatusBadge } from '../components/StatusBadge';
import FilterAccordion from '../components/FilterAccordion';
import { useFetch } from '../useFetch';

const EQUIPMENT = ['Projector', 'TvScreen', 'VideoConferencing', 'Whiteboard'];

const emptyFilters: RoomFilters = {
  minCapacity: '',
  floor: '',
  equipment: [],
};

export default function RoomsPage() {
  const [draft, setDraft] = useState<RoomFilters>(emptyFilters);
  const [applied, setApplied] = useState<RoomFilters>(emptyFilters);

  // a new function is created only when `applied` changes, which triggers a refetch
  const fetcher = useCallback(() => getRooms(applied), [applied]);
  const { data, error, loading } = useFetch(fetcher);
  const rooms = data ?? [];

  function toggleEquipment(item: string) {
    const current = draft.equipment ?? [];
    setDraft({
      ...draft,
      equipment: current.includes(item)
        ? current.filter((e) => e !== item)
        : [...current, item],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApplied(draft);
  }

  function handleReset() {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
  }

  const activeFilters =
    (applied.minCapacity ? 1 : 0) +
    (applied.floor ? 1 : 0) +
    (applied.equipment?.length ? 1 : 0);

  return (
    <section>
      <h1 className="h3 mb-3">Meeting rooms</h1>

      <FilterAccordion activeCount={activeFilters}>
        <form
          className="card card-body shadow-sm mb-4 row g-3"
          onSubmit={handleSubmit}
        >
          <div className="col-md-3">
            <label htmlFor="minCapacity" className="form-label">
              Min. capacity
            </label>
            <input
              id="minCapacity"
              type="number"
              min={1}
              className="form-control"
              value={draft.minCapacity}
              onChange={(e) =>
                setDraft({ ...draft, minCapacity: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="floor" className="form-label">
              Floor
            </label>
            <input
              id="floor"
              type="number"
              className="form-control"
              value={draft.floor}
              onChange={(e) => setDraft({ ...draft, floor: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <span className="form-label d-block">Equipment</span>
            {EQUIPMENT.map((item) => (
              <div className="form-check form-check-inline" key={item}>
                <input
                  id={`eq-${item}`}
                  type="checkbox"
                  className="form-check-input"
                  checked={draft.equipment?.includes(item) ?? false}
                  onChange={() => toggleEquipment(item)}
                />
                <label htmlFor={`eq-${item}`} className="form-check-label">
                  {item}
                </label>
              </div>
            ))}
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

      <ErrorAlert message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Capacity</th>
                <th scope="col">Floor</th>
                <th scope="col">Equipment</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No rooms match these filters.
                  </td>
                </tr>
              )}
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <th scope="row">{room.name}</th>
                  <td>{room.capacity}</td>
                  <td>{room.floor}</td>
                  <td>
                    {room.equipment.length === 0 ? (
                      <span className="text-muted">None</span>
                    ) : (
                      <div className="d-flex flex-wrap gap-1">
                        {room.equipment.map((item) => (
                          <Badge key={item} variant="light" className="border">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <RoomStatusBadge isActive={room.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
