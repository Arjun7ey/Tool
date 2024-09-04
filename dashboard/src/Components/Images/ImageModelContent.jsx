import React, { useState } from 'react';
import ReactStars from 'react-rating-stars-component';
import Swal from 'sweetalert2';
import axiosInstance from '../utils/axiosInstance'; 
import { BASE_URL } from '../../config';

const ImageModalContent = ({ task, userRole, handleRatingChange, fetchDescription }) => {
    const imageUrl = `${BASE_URL}${task.file}`;

    console.log('Rendering ImageModalContent with:', { task, userRole });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <p>Image URL: {imageUrl}</p>
            <img 
                src={imageUrl} 
                alt="Task Image" 
                style={{ maxWidth: '100%', height: 'auto', marginBottom: '15px', borderRadius: '8px' }} 
                onError={(e) => {
                    console.error('Failed to load image:', e.target.src);
                    e.target.src = 'path/to/default-image.jpg'; // Optional: fallback image
                }}
            />
            {userRole === 'superadmin' || userRole === 'departmentadmin' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Rate this image:</h3>
                    <ReactStars
                        count={5}
                        value={task.rating}
                        size={24}
                        activeColor="#ffd700"
                        isHalf={false}
                        edit={true}
                        onChange={(newRating) => handleRatingChange(newRating, task.id)}
                    />
                </div>
            ) : null}
            <button
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '15px',
                }}
                onClick={() => {
                    console.log('Fetching description for task ID:', task.id);
                    fetchDescription(task.id);
                }}
            >
                Get AI Description
            </button>
        </div>
    );
};

export default ImageModalContent;