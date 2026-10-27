import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import RoomsPage from './pages/RoomsPage';
import UsersPage from './pages/UsersPage';
import ReservationsPage from './pages/ReservationsPage';
import CreateReservationPage from './pages/CreateReservationForm';

export default function App() {
  return (
    <>
      <nav className="navbar navbar-expand border-bottom mb-4">
        <div className="container">
          <div className="navbar-nav">
            <NavLink to="/rooms" className="nav-link">
              Rooms
            </NavLink>
            <NavLink to="/users" className="nav-link">
              Users
            </NavLink>
            <NavLink to="/reservations" className="nav-link">
              Reservations
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="container pb-5">
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<CreateReservationPage />} />
        </Routes>
      </main>
    </>
  );
}
