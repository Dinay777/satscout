import React from 'react';

// Replace these Unsplash photo IDs with your own photos when ready
const photos = [
  { id: '1456513080510-7bf3a84b82f8', alt: 'Open textbook with study notes',   caption: 'Curated resources' },
  { id: '1503676260728-1c00da094a0b', alt: 'Student focused at desk',           caption: 'Study smarter' },
  { id: '1484480974693-6ca0a78fb36b', alt: 'Study planner and notebook',        caption: 'Personalized plans' },
  { id: '1522202176988-66273c2fd55f', alt: 'Students working on laptops',       caption: 'Learn anywhere' },
  { id: '1434030216411-0b793f4b6f68', alt: 'Notebook and pen at desk',          caption: 'Your prep, planned' },
  { id: '1571019614242-c5c5dee9f50b', alt: 'Person taking notes while studying',caption: 'Track your progress' },
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
