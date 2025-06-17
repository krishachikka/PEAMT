import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function StartPage() {
    const location = useLocation();
    const { examName, duration } = location.state || { examName: 'defaultExam', duration: '01:00:00' }; // Get exam name and duration from state
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null); // New state for uploaded image

    const navigate = useNavigate();

    const handleStart = async () => {
        if (code.length !== 6) {
            alert('Please enter a valid 6-digit code.');
            return;
        }
    
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/exams/verify-code`, {
                examName,
                enteredCode: code,
            });
    
            if (response.data.valid) {
                navigate('/exam-window', { 
                    state: { 
                        examName, 
                        duration, 
                        uploadedImage // Pass the uploaded image to the next page
                    } 
                });
            } else {
                setError('Invalid secure code. Please try again.');
            }
        } catch (error) {
            console.error('Error validating secure code:', error);
            setError('Failed to validate secure code. Please try again later.');
        }
    };
    

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result); // Save the image data URL
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle file drop
    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result); // Save the image data URL
            };
            reader.readAsDataURL(file);
        }
    };

    // Prevent default drag over behavior
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const triggerFileInput = () => {
        document.getElementById('fileInput').click(); // Trigger hidden file input
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
            <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-3xl border border-gray-200">
                <h1 className="text-4xl font-bold text-cyan-700 mb-4">Welcome to the Exam: {examName}</h1>
                <p className="text-lg text-gray-700 mb-2">Duration: {duration}</p> {/* Display the exam duration */}
                <p className="text-lg text-gray-700 mb-6">Please review the rules below before starting.</p>

                {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label htmlFor="code-input" className="block text-lg font-semibold text-gray-800 mb-2">
                        Enter 6-digit code:
                    </label>
                    <input
                        id="code-input"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="px-4 py-2 border border-gray-300 rounded-lg w-full bg-cyan-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <section className='flex flex-row h-40 mx-auto justify-center'>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="p-4 w-1/3 m-2 my-auto border-2 border-dashed border-gray-500 cursor-pointer rounded-3xl bg-slate-200 text-center"
                        onClick={triggerFileInput}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <p className='text-center text-slate-500'><ion-icon name="cloud-upload" size="large"></ion-icon></p>
                        <p className='text-center'>{uploadedImage ? "Image Uploaded" : "Drag & Drop or Click to Upload"}</p>
                    </div>

                    {uploadedImage && (
                        <div className="flex flex-col mt-2 items-center">
                            <img
                                src={uploadedImage}
                                alt="Uploaded"
                                className="border w-28 border-gray-300"
                            // style={{ width: '200px', height: 'auto' }}
                            />
                        </div>
                    )}
                </section>

                <p className="text-md bg-green-200 p-2 rounded-2xl border-2 text-green-900 mb-4 font-bold">
                    <strong>Note:</strong> A current passport-size photo is required for face verification. Your face will be monitored during the exam.
                </p>

                <h2 className="text-lg font-semibold text-gray-800 mb-2">Code of Conduct:</h2>
                <ul className="list-disc list-inside mb-4 text-gray-700 text-sm">
                    <li>Follow all exam instructions carefully.</li>
                    <li>No cheating or use of unauthorized materials.</li>
                    <li>Maintain a quiet environment during the exam.</li>
                </ul>

                <button
                    onClick={handleStart}
                    className="w-full px-6 py-3 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    NEXT
                </button>
            </div>
        </div>
    );
}

export default StartPage;
