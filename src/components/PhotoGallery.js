import React from 'react';

const U = (id) => `https://images.unsplash.com/photo-${id}?w=480&h=320&fit=crop&auto=format&q=80`;

const photos = [
  { src: '/images/sat-book.jpg',                              alt: 'The Official SAT Study Guide',         caption: 'SAT prep, planned'       },
  { src: U('1503676260728-1c00da094a0b'),                     alt: 'Student focused at desk',              caption: 'Study smarter'           },
  { src: U('1456513080510-7bf3a84b82f8'),                     alt: 'Stack of textbooks and notes',         caption: 'Curated resources'       },
  { src: U('1522202176988-66273c2fd55f'),                     alt: 'Students studying together on laptops',caption: 'Learn anywhere'          },
  { src: U('1484480974693-6ca0a78fb36b'),                     alt: 'Study planner and notebook',           caption: 'Personalized plans'      },
  { src: U('1434030216411-0b793f4b4173'),                     alt: 'Notebook and pen on a clean desk',     caption: 'Your prep, your pace'    },
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
                src={photo.src}
                alt={photo.alt}
                className="gallery-item__img"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
