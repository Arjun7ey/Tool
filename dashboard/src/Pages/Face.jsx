import React from 'react';
import './Face.css';

const Face = ({ isPasswordFocused, email, password, showPassword }) => {
    const eyeClosed = isPasswordFocused || password.length > 0 || showPassword;
    const pupilPosition = (email.length + password.length) % 10;

    return (
        <div className="face">
            <div className="face-container">
                <div className="eyes-container">
                    <div className={`eye ${eyeClosed ? 'closed-eye' : ''}`}>
                        <div className={`pupil ${eyeClosed ? 'hidden-pupil' : ''}`} style={{ transform: `translateX(${pupilPosition * 2}px)` }}></div>
                        <div className={`eye-lid upper-lid ${eyeClosed ? 'closed-lid' : ''}`}></div>
                        <div className={`eye-lid lower-lid ${eyeClosed ? 'closed-lid' : ''}`}></div>
                    </div>
                    <div className={`eye ${eyeClosed ? 'closed-eye' : ''}`}>
                        <div className={`pupil ${eyeClosed ? 'hidden-pupil' : ''}`} style={{ transform: `translateX(${pupilPosition * 2}px)` }}></div>
                        <div className={`eye-lid upper-lid ${eyeClosed ? 'closed-lid' : ''}`}></div>
                        <div className={`eye-lid lower-lid ${eyeClosed ? 'closed-lid' : ''}`}></div>
                    </div>
                </div>
                <div className="eyebrow left-eyebrow"></div>
                <div className="eyebrow right-eyebrow"></div>
                <div className="nose"></div>
                <div className="mouth happy-mouth"></div>
            </div>
        </div>
    );
};

export default Face;
