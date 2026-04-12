import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import OwnerPanel from './pages/OwnerPanel';
import Trainers from './pages/Trainers';
import TrainerDetail from './pages/TrainerDetail';
import './App.css';

function App() {
  return (
    <LangProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/trainers/:id" element={<TrainerDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/my-venues" element={<OwnerPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LangProvider>
  );
}

export default App;
