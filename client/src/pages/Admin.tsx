import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi, type DashboardStats, type AdminUser } from '../api/admin';
import { venuesApi, type Venue } from '../api/venues';

type Tab = 'overview' | 'users' | 'venues';

export default function Admin() {
  const { user } = useAuth();
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
    await adminApi.changeRole(id, role);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as AdminUser['role'] } : u)));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await adminApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleVerify = async (id: string, verified: boolean) => {
    await venuesApi.verify(id, verified);
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, is_verified: verified } : v)));
  };

  const handleFeature = async (id: string, featured: boolean) => {
    await venuesApi.feature(id, featured);
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, is_featured: featured } : v)));
  };

  const handleDeleteVenue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    await venuesApi.remove(id);
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Users ({users.length})
        </button>
        <button className={`admin-tab ${tab === 'venues' ? 'active' : ''}`} onClick={() => setTab('venues')}>
          Venues ({venues.length})
        </button>
      </div>

      {tab === 'overview' && stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.totalUsers}</span>
            <span className="stat-label">Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalVenues}</span>
            <span className="stat-label">Venues</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.verifiedVenues}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalReviews}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
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
                      Delete
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
                <th>Name</th>
                <th>City</th>
                <th>Verified</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link to={`/venues/${v.id}`}>{v.name}</Link>
                  </td>
                  <td>{v.city?.name_en}</td>
                  <td>
                    <button
                      className={`btn-sm ${v.is_verified ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => handleVerify(v.id, !v.is_verified)}
                    >
                      {v.is_verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn-sm ${v.is_featured ? 'btn-active' : 'btn-outline'}`}
                      onClick={() => handleFeature(v.id, !v.is_featured)}
                    >
                      {v.is_featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteVenue(v.id)}
                    >
                      Delete
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
