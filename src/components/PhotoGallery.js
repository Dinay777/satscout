import React from 'react';

// Replace these Unsplash photo IDs with your own photos when ready
const photos = [
  { id: '1456513080510-7bf3a84b82f8', alt: 'Open book with study notes',       caption: 'Curated by students' },
  { id: '1481627834876-b7833e8f5570', alt: 'Library with books',                caption: 'The best resources' },
  { id: '1484480974693-6ca0a78fb36b', alt: 'Study planner and notebook',        caption: 'Personalized plans' },
  { id: '1497633762265-9d179a990aa6', alt: 'Colorful books on shelf',           caption: '50+ resources' },
  { id: '1503676260728-1c00da094a0b', alt: 'Student studying at desk',          caption: 'Study smarter' },
  { id: '1434030216411-0b793f4b6f68', alt: 'Coffee and notebook on a desk',     caption: 'Your prep, planned' },
];

const doubled = [...photos, ...photos];

function PhotoGallery() {
  return (
    <section className="photo-gallery">
      <div className="photo-gallery__track-wrap">
        <div className="photo-gallery__track">
          {doubled.map((photo, i) => (
            <div className="gallery-item" key={i}>
              <img
                src={`https://images.unsplash.com/photo-${photo.id}?w=480&h=320&fit=crop&auto=format&q=80`}
                alt={photo.alt}
                className="gallery-item__img"
                loading="lazy"
              />
              <div className="gallery-item__overlay">
                <span className="gallery-item__caption">{photo.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PhotoGallery;
