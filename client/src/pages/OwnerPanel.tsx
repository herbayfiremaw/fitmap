import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { venuesApi, type Venue, type CreateVenueData, type UpdateVenueData } from '../api/venues';
import { citiesApi, type City } from '../api/cities';
import { trainingTypesApi, type TrainingType } from '../api/training-types';
import { schedulesApi, type Schedule, type CreateScheduleData, dayName } from '../api/schedules';
import { trainersApi, type Trainer } from '../api/trainers';
import { LocationPicker } from '../components/Map';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type View = 'list' | 'edit' | 'create' | 'schedules' | 'photos';

export default function OwnerPanel() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('list');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [venueTrainers, setVenueTrainers] = useState<Trainer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [form, setForm] = useState<CreateVenueData>({
    name: '', description_bg: '', description_en: '', address: '',
    city_id: 0, latitude: 0, longitude: 0, phone: '', email: '',
    website: '', training_price: 0, amenities: [], training_type_ids: [],
  });

  // Schedule form
  const [schedForm, setSchedForm] = useState<CreateScheduleData>({
    venue_id: '', training_type_id: 0, day_of_week: 1,
    start_time: '09:00', end_time: '10:00',
  });

  useEffect(() => {
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    const [myVenues, allCities, allTT] = await Promise.all([
      venuesApi.getMine(),
      citiesApi.getAll(),
      trainingTypesApi.getAll(),
    ]);
    setVenues(myVenues);
    setCities(allCities);
    setTrainingTypes(allTT);
  };

  const clearMessages = () => { setError(''); setSuccess(''); };

  const openEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setForm({
      name: venue.name,
      description_bg: venue.description_bg,
      description_en: venue.description_en,
      address: venue.address,
      city_id: venue.city_id,
      latitude: Number(venue.latitude),
      longitude: Number(venue.longitude),
      phone: venue.phone,
      email: venue.email,
      website: venue.website || '',
      training_price: venue.training_price,
      amenities: venue.amenities,
      training_type_ids: venue.trainingTypes?.map((t) => t.id) || [],
    });
    clearMessages();
    setView('edit');
  };

  const openCreate = () => {
    setSelectedVenue(null);
    setForm({
      name: '', description_bg: '', description_en: '', address: '',
      city_id: cities[0]?.id || 0, latitude: 42.6977, longitude: 23.3219,
      phone: '', email: '', website: '', training_price: 0,
      amenities: [], training_type_ids: [],
    });
    clearMessages();
    setView('create');
  };

  const openSchedules = async (venue: Venue) => {
    setSelectedVenue(venue);
    const [s, tr] = await Promise.all([
      schedulesApi.getByVenue(venue.id),
      trainersApi.getByVenue(venue.id),
    ]);
    setSchedules(s);
    setVenueTrainers(tr);
    setSchedForm({
      venue_id: venue.id, training_type_id: trainingTypes[0]?.id || 0,
      day_of_week: 1, start_time: '09:00', end_time: '10:00',
    });
    clearMessages();
    setView('schedules');
  };

  const openPhotos = (venue: Venue) => {
    setSelectedVenue(venue);
    clearMessages();
    setView('photos');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      if (view === 'create') {
        await venuesApi.create(form);
        setSuccess(lang === 'bg' ? 'Залата е създадена' : 'Venue created');
      } else if (selectedVenue) {
        const updates: UpdateVenueData = {};
        for (const [key, val] of Object.entries(form)) {
          if (JSON.stringify(val) !== JSON.stringify((selectedVenue as any)[key])) {
            (updates as any)[key] = val;
          }
        }
        await venuesApi.update(selectedVenue.id, updates);
        setSuccess(lang === 'bg' ? 'Залата е обновена' : 'Venue updated');
      }
      await loadData();
      setView('list');
    } catch {
      setError(lang === 'bg' ? 'Грешка при запазване' : 'Failed to save venue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'bg' ? 'Изтриване на тази зала?' : 'Delete this venue?')) return;
    try {
      await venuesApi.remove(id);
      await loadData();
    } catch {
      setError(lang === 'bg' ? 'Грешка при изтриване' : 'Failed to delete venue');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVenue) return;
    try {
      const updated = await venuesApi.uploadPhoto(selectedVenue.id, file);
      setSelectedVenue(updated);
      setVenues((prev) => prev.map((v) => v.id === updated.id ? updated : v));
      setSuccess(lang === 'bg' ? 'Снимката е качена' : 'Photo uploaded');
    } catch {
      setError(lang === 'bg' ? 'Грешка при качване' : 'Failed to upload photo');
    }
    e.target.value = '';
  };

  const handlePhotoRemove = async (photoUrl: string) => {
    if (!selectedVenue) return;
    try {
      const updated = await venuesApi.removePhoto(selectedVenue.id, photoUrl);
      setSelectedVenue(updated);
      setVenues((prev) => prev.map((v) => v.id === updated.id ? updated : v));
    } catch {
      setError(lang === 'bg' ? 'Грешка при премахване' : 'Failed to remove photo');
    }
  };

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      await schedulesApi.create(schedForm);
      const s = await schedulesApi.getByVenue(selectedVenue!.id);
      setSchedules(s);
      setSuccess(lang === 'bg' ? 'Програмата е добавена' : 'Schedule added');
    } catch {
      setError(lang === 'bg' ? 'Грешка при добавяне' : 'Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await schedulesApi.remove(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError(lang === 'bg' ? 'Грешка при премахване' : 'Failed to remove schedule');
    }
  };

  const toggleTT = (id: number) => {
    setForm((prev) => ({
      ...prev,
      training_type_ids: prev.training_type_ids?.includes(id)
        ? prev.training_type_ids.filter((t) => t !== id)
        : [...(prev.training_type_ids || []), id],
    }));
  };

  if (!user || (user.role !== 'owner' && user.role !== 'admin')) return null;

  return (
    <div className="owner-page">
      <div className="owner-header">
        <h1>{lang === 'bg' ? 'Моите Зали' : 'My Venues'}</h1>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={openCreate}>+ {lang === 'bg' ? 'Добави Зала' : 'Add Venue'}</button>
        )}
        {view !== 'list' && (
          <button className="btn btn-outline" onClick={() => { clearMessages(); setView('list'); }}>
            {lang === 'bg' ? 'Назад към списъка' : 'Back to List'}
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* VENUE LIST */}
      {view === 'list' && (
        <div className="owner-venues">
          {venues.length === 0 ? (
            <p className="no-results">{lang === 'bg' ? 'Все още нямате зали. Създайте една!' : 'You don\'t have any venues yet. Create one!'}</p>
          ) : (
            venues.map((v) => (
              <div key={v.id} className="owner-venue-card">
                <div className="owner-venue-info">
                  <h3>{v.name}</h3>
                  <p>{v.city ? t(v.city) : ''} — {v.address}</p>
                  <div className="owner-venue-badges">
                    {v.is_verified
                      ? <span className="badge">{lang === 'bg' ? 'Верифицирана' : 'Verified'}</span>
                      : <span className="badge badge-pending">{lang === 'bg' ? 'Чака одобрение' : 'Pending approval'}</span>}
                    {v.is_featured && <span className="badge">{lang === 'bg' ? 'Препоръчана' : 'Featured'}</span>}
                    <span className="badge badge-outline">{v.price_range}</span>
                  </div>
                </div>
                <div className="owner-venue-actions">
                  <button className="btn-sm btn-outline" onClick={() => openEdit(v)}>{lang === 'bg' ? 'Редактирай' : 'Edit'}</button>
                  <button className="btn-sm btn-outline" onClick={() => openSchedules(v)}>{lang === 'bg' ? 'Програма' : 'Schedules'}</button>
                  <button className="btn-sm btn-outline" onClick={() => openPhotos(v)}>{lang === 'bg' ? 'Снимки' : 'Photos'}</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(v.id)}>{lang === 'bg' ? 'Изтрий' : 'Delete'}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {(view === 'create' || view === 'edit') && (
        <form className="owner-form" onSubmit={handleSubmit}>
          <h2>{view === 'create' ? (lang === 'bg' ? 'Нова Зала' : 'New Venue') : `${lang === 'bg' ? 'Редактиране' : 'Edit'}: ${selectedVenue?.name}`}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'bg' ? 'Име' : 'Name'} <span className="required">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{lang === 'bg' ? 'Град' : 'City'} <span className="required">*</span></label>
              <select value={form.city_id} onChange={(e) => setForm({ ...form, city_id: Number(e.target.value) })}>
                {cities.map((c) => <option key={c.id} value={c.id}>{t(c)}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{lang === 'bg' ? 'Адрес' : 'Address'} <span className="required">*</span></label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'bg' ? 'Описание (BG)' : 'Description (BG)'} <span className="required">*</span></label>
              <textarea rows={3} value={form.description_bg} onChange={(e) => setForm({ ...form, description_bg: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{lang === 'bg' ? 'Описание (EN)' : 'Description (EN)'} <span className="required">*</span></label>
              <textarea rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>{lang === 'bg' ? 'Местоположение' : 'Location'} <span className="required">*</span></label>
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
              lang={lang}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'bg' ? 'Телефон' : 'Phone'} <span className="required">*</span></label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{lang === 'bg' ? 'Имейл' : 'Email'} <span className="required">*</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'bg' ? 'Уебсайт' : 'Website'} <span className="optional">({lang === 'bg' ? 'незадължително' : 'optional'})</span></label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="form-group">
              <label>{lang === 'bg' ? 'Цена на тренировка (EUR)' : 'Training cost (EUR)'} <span className="required">*</span></label>
              <input type="number" min="0" step="0.5" value={form.training_price || ''} onChange={(e) => setForm({ ...form, training_price: parseFloat(e.target.value) || 0 })} placeholder={lang === 'bg' ? 'напр. 15' : 'e.g. 15'} required />
              <small style={{ color: '#888' }}>
                {lang === 'bg'
                  ? 'Ценовият диапазон се изчислява автоматично: ≤10€ = €, 11–40€ = €€, >40€ = €€€'
                  : 'Price range is calculated automatically: ≤10€ = €, 11–40€ = €€, >40€ = €€€'}
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>{lang === 'bg' ? 'Видове тренировки' : 'Training Types'} <span className="optional">({lang === 'bg' ? 'незадължително' : 'optional'})</span></label>
            <div className="tt-picker">
              {trainingTypes.map((tt) => (
                <button
                  key={tt.id}
                  type="button"
                  className={`tag ${form.training_type_ids?.includes(tt.id) ? 'tag-selected' : ''}`}
                  onClick={() => toggleTT(tt.id)}
                >
                  {t(tt)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>{lang === 'bg' ? 'Удобства (разделени със запетая)' : 'Amenities (comma-separated)'} <span className="optional">({lang === 'bg' ? 'незадължително' : 'optional'})</span></label>
            <input
              value={form.amenities?.join(', ')}
              onChange={(e) => setForm({ ...form, amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="parking, showers, lockers, sauna"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {view === 'create' ? (lang === 'bg' ? 'Създай Зала' : 'Create Venue') : (lang === 'bg' ? 'Запази' : 'Save Changes')}
          </button>
        </form>
      )}

      {/* SCHEDULES */}
      {view === 'schedules' && selectedVenue && (
        <div className="owner-schedules">
          <h2>{lang === 'bg' ? 'Програма' : 'Schedules'}: {selectedVenue.name}</h2>

          {schedules.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{lang === 'bg' ? 'Ден' : 'Day'}</th>
                  <th>{lang === 'bg' ? 'Час' : 'Time'}</th>
                  <th>{lang === 'bg' ? 'Тип' : 'Type'}</th>
                  <th>{lang === 'bg' ? 'Треньор' : 'Trainer'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{dayName(s.day_of_week, lang)}</td>
                    <td>{s.start_time} — {s.end_time}</td>
                    <td>{s.trainingType ? t(s.trainingType) : ''}</td>
                    <td>{s.trainer ? t(s.trainer) : '—'}</td>
                    <td>
                      <button className="btn-sm btn-danger" onClick={() => handleDeleteSchedule(s.id)}>{lang === 'bg' ? 'Премахни' : 'Remove'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form className="owner-sched-form" onSubmit={handleAddSchedule}>
            <h3>{lang === 'bg' ? 'Добави Програма' : 'Add Schedule'}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'bg' ? 'Ден' : 'Day'}</label>
                <select value={schedForm.day_of_week} onChange={(e) => setSchedForm({ ...schedForm, day_of_week: Number(e.target.value) })}>
                  {[1,2,3,4,5,6,0].map((d) => <option key={d} value={d}>{dayName(d, lang)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{lang === 'bg' ? 'Вид Тренировка' : 'Training Type'}</label>
                <select value={schedForm.training_type_id} onChange={(e) => setSchedForm({ ...schedForm, training_type_id: Number(e.target.value) })}>
                  {trainingTypes.map((tt) => <option key={tt.id} value={tt.id}>{t(tt)}</option>)}
                </select>
              </div>
            </div>
            {venueTrainers.length > 0 && (
              <div className="form-group">
                <label>{lang === 'bg' ? 'Треньор' : 'Trainer'}</label>
                <select value={schedForm.trainer_id ?? ''} onChange={(e) => setSchedForm({ ...schedForm, trainer_id: e.target.value || undefined })}>
                  <option value="">{lang === 'bg' ? '— Без треньор —' : '— No trainer —'}</option>
                  {venueTrainers.map((tr) => <option key={tr.id} value={tr.id}>{t(tr)}</option>)}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'bg' ? 'Начален час' : 'Start Time'}</label>
                <input type="time" value={schedForm.start_time} onChange={(e) => setSchedForm({ ...schedForm, start_time: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{lang === 'bg' ? 'Краен час' : 'End Time'}</label>
                <input type="time" value={schedForm.end_time} onChange={(e) => setSchedForm({ ...schedForm, end_time: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{lang === 'bg' ? 'Добави' : 'Add Schedule'}</button>
          </form>
        </div>
      )}

      {/* PHOTOS */}
      {view === 'photos' && selectedVenue && (
        <div className="owner-photos">
          <h2>{lang === 'bg' ? 'Снимки' : 'Photos'}: {selectedVenue.name}</h2>

          <div className="gallery-grid">
            {selectedVenue.photos.map((photo, i) => (
              <div key={i} className="owner-photo">
                <img src={photo.startsWith('/') ? `${apiUrl}${photo}` : photo} alt={`Photo ${i + 1}`} />
                <button className="owner-photo-remove" onClick={() => handlePhotoRemove(photo)}>X</button>
              </div>
            ))}
          </div>

          <label className="btn btn-outline owner-upload-btn">
            {lang === 'bg' ? 'Качи Снимка' : 'Upload Photo'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
          </label>
        </div>
      )}
    </div>
  );
}
