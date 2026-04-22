import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import About from './components/About'
import Artists from './components/Artists'
import HowItWorks from './components/HowItWorks'
import Releases from './components/Releases'
import DemoForm from './components/DemoForm'
import Footer from './components/Footer'
import NoiseOverlay from './components/NoiseOverlay'
import Login from "./components/login";
import AdminDashboard from "./components/admindashboard";
import ProtectedRoute from "./components/protectedroute";
import { Navigate, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="bg-[#080808] text-[#f0ede8] font-mono text-sm leading-relaxed overflow-x-hidden cursor-crosshair">
            <NoiseOverlay />
            <Navbar />
            <Hero />
            <Ticker />
            <About />
            <Artists />
            <HowItWorks />
            <Releases />
            <DemoForm />
            <Footer />
          </div>
        }
      />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/:section"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
