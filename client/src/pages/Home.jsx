import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VEHICLE_TYPES = [
  { key: 'car', label: 'Car', hi: 'कार' },
  { key: 'auto', label: 'Auto', hi: 'ऑटो' },
  { key: 'tempo', label: 'Tempo', hi: 'टेम्पो' },
  { key: 'bus', label: 'Bus', hi: 'बस' },
  { key: 'truck', label: 'Truck', hi: 'ट्रक' },
  { key: 'bike', label: 'Bike', hi: 'बाइक' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Rent vehicles & book rides in Mithilanchal
          </h1>
          <p className="text-brand-50 max-w-2xl mx-auto mb-8">
            Cars, autos, tempos, buses and trucks — with a driver. Serving Darbhanga
            and Muzaffarpur. Local owners rent out, locals ride.
          </p>
          <div className="flex justify-center gap-3">
            {user?.role === 'rider' && (
              <Link to="/book" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg">
                Book a ride
              </Link>
            )}
            {!user && (
              <>
                <Link to="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg">
                  Get started
                </Link>
                <Link to="/login" className="border border-white px-6 py-3 rounded-lg">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Vehicle types */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold mb-6 text-center">What do you need?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {VEHICLE_TYPES.map((v) => (
            <div key={v.key} className="bg-white border rounded-lg p-4 text-center hover:shadow">
              <div className="font-medium">{v.label}</div>
              <div className="text-gray-400 text-sm">{v.hi}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
          {[
            ['1. Request', 'Pick your city, vehicle type, pickup and drop. Get a fare estimate.'],
            ['2. Driver accepts', 'A nearby verified driver accepts and heads to your pickup.'],
            ['3. Ride & pay', 'Complete your trip and pay the driver directly by cash or UPI.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <div className="font-semibold text-brand-600 mb-1">{title}</div>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Driver CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Own a vehicle?</h2>
        <p className="text-gray-600 mb-4">
          List your car, tempo, bus or truck and earn from local rides and hires.
        </p>
        {!user && (
          <Link to="/register" className="bg-brand-500 text-white px-6 py-3 rounded-lg inline-block">
            Register as a driver
          </Link>
        )}
      </section>
    </div>
  );
}
