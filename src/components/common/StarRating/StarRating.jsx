import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/*
 * Renders a row of stars based on a numeric rating (0–5).
 * Supports full, half, and empty stars.
 *
 * Props:
 *   rating  → number (e.g. 3.7)
 *   count   → number of reviews to show alongside stars
 *   size    → icon size in px (default: 14)
 */
export default function StarRating({ rating, count, size = 14 }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const full  = i + 1 <= Math.floor(rating);
    const half  = !full && i < rating && rating < i + 1;
    const color = full || half ? '#f59e0b' : '#d1d5db';

    return (
      <span key={i} style={{ color }}>
        {full ? (
          <FaStar size={size} />
        ) : half ? (
          <FaStarHalfAlt size={size} />
        ) : (
          <FaRegStar size={size} />
        )}
      </span>
    );
  });

  return (
    <div className="d-flex align-items-center gap-1">
      <div className="d-flex gap-1">{stars}</div>
      {rating !== undefined && (
        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
          {Number(rating).toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  );
}