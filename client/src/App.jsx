import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import EnablePush from './components/EnablePush';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderBook from './pages/RiderBook';
import MyTrips from './pages/MyTrips';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SharedTrip from './pages/SharedTrip';

// Guards a route by auth + optional role list.
function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EnablePush />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Public, no-login shared trip tracking */}
          <Route path="/t/:token" element={<SharedTrip />} />

          <Route
            path="/book"
            element={
              <Protected roles={['rider']}>
                <RiderBook />
              </Protected>
            }
          />
          <Route
            path="/trips"
            element={
              <Protected>
                <MyTrips />
              </Protected>
            }
          />
          <Route
            path="/driver"
            element={
              <Protected roles={['driver']}>
                <DriverDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected roles={['admin']}>
                <AdminDashboard />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-gray-900 text-gray-300 text-sm text-center py-6">
        MithilaVahan · Vehicles of Mithila · Darbhanga · Muzaffarpur
      </footer>
    </div>
  );
}
