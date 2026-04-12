import { useEffect, useState, useRef, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, type Profile, type UpdateProfileData } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { StarsDisplay } from '../components/Stars';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    authApi.getProfile().then((p) => {
      setProfile(p);
      setName(p.name);
      setEmail(p.email);
    });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updates: UpdateProfileData = {};
    if (name !== profile?.name) updates.name = name;
    if (email !== profile?.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      setEditing(false);
      return;
    }

    try {
      const response = await authApi.updateProfile(updates);
      refreshUser(response);
      setSuccess('Profile updated');
      setPassword('');
      setEditing(false);
      // Refresh profile data
      const updated = await authApi.getProfile();
      setProfile(updated);
    } catch {
      setError('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await authApi.uploadAvatar(file);
      refreshUser(response);
      const updated = await authApi.getProfile();
      setProfile(updated);
      setSuccess('Avatar updated');
    } catch {
      setError('Failed to upload avatar');
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-info">
          <label className="profile-avatar-wrapper">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url.startsWith('/') ? `${apiUrl}${profile.avatar_url}` : profile.avatar_url}
                alt={profile.name}
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-avatar-overlay">Change</div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              hidden
            />
          </label>
          <div>
            <h2>{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-badges">
              <span className="badge">{profile.role}</span>
              <span className="profile-date">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {!editing ? (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="••••••"
              />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn btn-primary">Save</button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(false);
                  setName(profile.name);
                  setEmail(profile.email);
                  setPassword('');
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <section className="section">
        <h2>My Reviews ({profile.reviews.length})</h2>
        {profile.reviews.length === 0 ? (
          <p className="no-results">You haven't left any reviews yet.</p>
        ) : (
          <div className="reviews-list">
            {profile.reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  {r.venue ? (
                    <Link to={`/venues/${r.venue.id}`}>
                      <strong>{r.venue.name}</strong>
                    </Link>
                  ) : (
                    <strong>Deleted venue</strong>
                  )}
                  <StarsDisplay rating={r.rating} size={14} />
                  <span className="review-date">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="profile-actions">
        <button
          className="btn btn-danger"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
