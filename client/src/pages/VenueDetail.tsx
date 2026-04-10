import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { venuesApi, type Venue } from '../api/venues';
import { reviewsApi, type Review } from '../api/reviews';
import { schedulesApi, dayName, type Schedule } from '../api/schedules';
import { useAuth } from '../context/AuthContext';
import { VenueMap } from '../components/Map';

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const isOwner = user && venue && (user.id === venue.owner_id || user.role === 'admin');

  useEffect(() => {
    if (!id) return;
    venuesApi.getOne(id).then(setVenue);
    reviewsApi.getByVenue(id).then(setReviews);
    schedulesApi.getByVenue(id).then(setSchedules);
  }, [id]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    try {
      const review = await reviewsApi.create({ venue_id: id, rating, comment });
      setReviews([review, ...reviews]);
      setComment('');
      setRating(5);
    } catch {
      setError('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsApi.remove(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch {
      setError('Failed to delete review');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      const updated = await venuesApi.uploadPhoto(id, file);
      setVenue(updated);
    } catch {
      setError('Failed to upload photo');
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!id) return;
    try {
      const updated = await venuesApi.removePhoto(id, photoUrl);
      setVenue(updated);
    } catch {
      setError('Failed to remove photo');
    }
  };

  if (!venue) return <p>Loading...</p>;

  return (
    <div className="venue-detail">
      <Link to="/venues" className="back-link">Back to Venues</Link>

      <div className="venue-header">
        <div>
          <h1>{venue.name}</h1>
          <p className="venue-city">{venue.city?.name_en}</p>
          <p className="venue-address">{venue.address}</p>
        </div>
        <div className="venue-meta">
          <span className="venue-price large">{venue.price_range}</span>
          {venue.is_verified && <span className="badge verified">Verified</span>}
          {avgRating && <span className="avg-rating">{avgRating} / 5</span>}
        </div>
      </div>

      {/* Gallery */}
      {(venue.photos.length > 0 || isOwner) && (
        <section className="section">
          <div className="gallery-header">
            <h2>Gallery</h2>
            {isOwner && (
              <label className="btn btn-upload">
                {uploading ? 'Uploading...' : 'Add Photo'}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  hidden
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          {venue.photos.length > 0 ? (
            <div className="gallery-grid">
              {venue.photos.map((photo, i) => (
                <div key={photo} className="gallery-item">
                  <img
                    src={photo.startsWith('/') ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${photo}` : photo}
                    alt={`${venue.name} photo ${i + 1}`}
                    onClick={() => setLightbox(i)}
                  />
                  {isOwner && (
                    <button
                      className="gallery-remove"
                      onClick={() => handleRemovePhoto(photo)}
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="gallery-empty">No photos yet. Add the first one!</p>
          )}
        </section>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close">&times;</button>
          <button
            className="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox - 1 + venue.photos.length) % venue.photos.length);
            }}
          >
            &#8249;
          </button>
          <img
            src={
              venue.photos[lightbox].startsWith('/')
                ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${venue.photos[lightbox]}`
                : venue.photos[lightbox]
            }
            alt={`${venue.name} photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % venue.photos.length);
            }}
          >
            &#8250;
          </button>
          <span className="lightbox-counter">
            {lightbox + 1} / {venue.photos.length}
          </span>
        </div>
      )}

      <div className="venue-tags">
        {venue.trainingTypes?.map((tt) => (
          <span key={tt.id} className="tag">{tt.name_en}</span>
        ))}
      </div>

      <div className="venue-info-grid">
        <div className="info-block">
          <h3>Description</h3>
          <p>{venue.description_en}</p>
        </div>
        <div className="info-block">
          <h3>Contact</h3>
          <p>{venue.phone}</p>
          <p>{venue.email}</p>
          {venue.website && <p><a href={venue.website} target="_blank" rel="noreferrer">{venue.website}</a></p>}
        </div>
        {venue.amenities?.length > 0 && (
          <div className="info-block">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {venue.amenities.map((a) => (
                <span key={a} className="tag-small">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="section">
        <h2>Location</h2>
        <VenueMap lat={Number(venue.latitude)} lng={Number(venue.longitude)} name={venue.name} />
      </section>

      {schedules.length > 0 && (
        <section className="section">
          <h2>Schedule</h2>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Training</th>
                <th>Trainer</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{dayName(s.day_of_week)}</td>
                  <td>{s.start_time} - {s.end_time}</td>
                  <td>{s.trainingType?.name_en}</td>
                  <td>{s.trainer?.name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="section">
        <h2>Reviews ({reviews.length})</h2>

        {user && (
          <form className="review-form" onSubmit={handleReview}>
            {error && <p className="error">{error}</p>}
            <div className="rating-input">
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        )}

        {!user && <p><Link to="/login">Log in</Link> to leave a review</p>}

        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{r.user?.name ?? 'User'}</strong>
                <span className="review-rating">{r.rating}/5</span>
                <span className="review-date">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                {user && (user.id === r.user_id || user.role === 'admin') && (
                  <button className="btn-text" onClick={() => handleDeleteReview(r.id)}>
                    Delete
                  </button>
                )}
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
