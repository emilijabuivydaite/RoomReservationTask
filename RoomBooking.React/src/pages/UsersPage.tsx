import { getUsers } from '../api';
import ErrorAlert from '../components/ErrorAlert';
import Loading from '../components/Loading';
import { useFetch } from '../useFetch';

export default function UsersPage() {
  const { data: users, error, loading } = useFetch(getUsers);

  if (loading) return <Loading />;

  return (
    <section>
      <h1 className="h3 mb-3">Users</h1>
      <ErrorAlert message={error} />

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">First name</th>
              <th scope="col">Last name</th>
              <th scope="col">Active reservations</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.activeReservations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
