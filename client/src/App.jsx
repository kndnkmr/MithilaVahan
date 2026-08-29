import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import EnablePush from './components/EnablePush';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderBook from './pages/RiderBook';
import MyTrips from './pages/MyTrips';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SharedTrip from './pages/SharedTrip';
import InstallApp from './pages/InstallApp';
import Destinations from './pages/Destinations';
import Refer from './pages/Refer';
import DestinationDetail from './pages/DestinationDetail';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import CancellationRefund from './pages/legal/CancellationRefund';
import AboutUs from './pages/legal/AboutUs';
import Support from './pages/Support';
import BlogList from './pages/BlogList';
import BlogArticle from './pages/BlogArticle';
import BrowseVehicles from './pages/BrowseVehicles';

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
      <ScrollToTop />
      <Navbar />
      <EnablePush />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Public, no-login shared trip tracking */}
          <Route path="/t/:token" element={<SharedTrip />} />
          <Route path="/install" element={<InstallApp />} />
          <Route path="/vehicles" element={<BrowseVehicles />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route
            path="/refer"
            element={
              <Protected>
                <Refer />
              </Protected>
            }
          />
          <Route
            path="/support"
            element={
              <Protected>
                <Support />
              </Protected>
            }
          />

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
      <Footer />
      <BottomNav />
    </div>
  );
}
