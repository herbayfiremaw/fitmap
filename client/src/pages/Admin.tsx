import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { adminApi, type DashboardStats, type AdminUser } from '../api/admin';
import { venuesApi, type Venue } from '../api/venues';

type Tab = 'overview' | 'users' | 'venues';

export default function Admin() {
  const { user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    adminApi.getStats().then(setStats);
    adminApi.getUsers().then(setUsers);
    venuesApi.getAll().then(setVenues);
  }, [user, navigate]);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await adminApi.changeRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as AdminUser['role'] } : u)));
    } catch { /* silently fail — role reverts visually on next load */ }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm(lang === 'bg' ? 'Сигурни ли сте, че искате да изтриете този потребител?' : 'Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { /* silently fail */ }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await venuesApi.verify(id, verified);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, is_verified: verified } : v)));
    } catch { /* silently fail */ }
  };

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      await venuesApi.feature(id, featured);
      setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, is_featured: featured } : v)));
    } catch { /* silently fail */ }
  };

  const handleDeleteVenue = async (id: string) => {
    if (!confirm(lang === 'bg' ? 'Сигурни ли сте, че искате да изтриете тази зала?' : 'Are you sure you want to delete this venue?')) return;
    try {
      await venuesApi.remove(id);
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } catch { /* silently fail */ }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page">
      <h1>{lang === 'bg' ? 'Админ Панел' : 'Admin Dashboard'}</h1>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          {lang === 'bg' ? 'Обзор' : 'Overview'}
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          {lang === 'bg' ? 'Потребители' : 'Users'} ({users.length})
        </button>
        <button className={`admin-tab ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>
          {lang === 'bg' ? 'Зали' : 'Venues'} ({venues.length})
        </button>
      </div>

      {tab === 'overview' && stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.totalUsers}</span>
            <span className="stat-label">{lang === 'bg' ? 'Потребители' : 'Users'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalVenues}</span>
            <span className="stat-label">{lang === 'bg' ? 'Зали' : 'Venues'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.verifiedVenues}</span>
            <span className="stat-label">{lang === 'bg' ? 'Верифицирани' : 'Verified'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalReviews}</span>
            <span className="stat-label">{lang === 'bg' ? 'Отзиви' : 'Reviews'}</span>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{lang === 'bg' ? 'Име' : 'Name'}</th>
                <th>{lang === 'bg' ? 'Имейл' : 'Email'}</th>
                <th>{lang === 'bg' ? 'Роля' : 'Role'}</th>
                <th>{lang === 'bg' ? 'Регистриран' : 'Joined'}</th>
                <th>{lang === 'bg' ? 'Действия' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user.id}
                    >
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id}
                    >
                      {lang === 'bg' ? 'Изтрий' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'venues' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{lang === 'bg' ? 'Име' : 'Name'}</th>
                <th>{lang === 'bg' ? 'Град' : 'City'}</th>
                <th>{lang === 'bg' ? 'Верифицирана' : 'Verified'}</th>
                <th>{lang === 'bg' ? 'Препоръчана' : 'Featured'}</th>
                <th>{lang === 'bg' ? 'Действия' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link to={`/venues/${v.id}`}>{v.name}</Link>
                  </td>
                  <td>{v.city ? (lang === 'bg' ? v.city.name_bg : v.city.name_en) : ''}</td>
                  <td>
                    <button
                      className={`btn-sm ${v.is_verified ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => handleVerify(v.id, !v.is_verified)}
                    >
                      {v.is_verified ? (lang === 'bg' ? 'Верифицирана' : 'Verified') : (lang === 'bg' ? 'Неверифицирана' : 'Unverified')}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn-sm ${v.is_featured ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => handleFeature(v.id, !v.is_featured)}
                    >
                      {v.is_featured ? (lang === 'bg' ? 'Препоръчана' : 'Featured') : (lang === 'bg' ? 'Не е препоръчана' : 'Not Featured')}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteVenue(v.id)}
                    >
                      {lang === 'bg' ? 'Изтрий' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
