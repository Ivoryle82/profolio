import React, { useState } from 'react';
import '../styles/photogallery.css';

const PhotoGallery = ({ photos }) => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupImages, setPopupImages] = useState([]);
    const [popupNote, setPopupNote] = useState('');

    const showPhotoPopup = (imageUrls, note) => {
        setPopupImages(imageUrls);
        setPopupNote(note);
        setIsPopupVisible(true);
    };

    const hidePhotoPopup = () => {
        setIsPopupVisible(false);
        setPopupImages([]);
        setPopupNote('');
    };

    return (
        <div>
            <div className="gallery-container">
                {photos.map((photo, index) => (
                    <div
                        className="gallery-item"
                        key={index}
                        onClick={() => showPhotoPopup(photo.urls, photo.note)}
                    >
                        <img src={photo.thumbnail} alt="Gallery Thumbnail" />
                    </div>
                ))}
            </div>

            {isPopupVisible && (
                <div className="background-container" onClick={hidePhotoPopup}>
                    <div className="photo-popup" onClick={(e) => e.stopPropagation()}>
                        <span className="close-btn" onClick={hidePhotoPopup}>x</span>
                        <div className="popup-note">{popupNote}</div>
                        {popupImages.map((url, index) => (
                            <img key={index} src={url} alt="Popup" className="popup-image" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;
