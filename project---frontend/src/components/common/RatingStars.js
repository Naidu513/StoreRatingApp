import React from 'react';
import './RatingStars.css'; 

function RatingStars({ rating, onRatingChange, maxStars = 5 }) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span
        key={i}
        className={`star ${i <= rating ? 'filled' : ''}`}
        onClick={() => onRatingChange && onRatingChange(i)}
      >
        &#9733; {/* Unicode star character */}
      </span>
    );
  }
  return <div className="rating-stars">{stars}</div>;
}

export default RatingStars;