import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import '../styles/FaceDetection.css';

const FaceDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [message, setMessage] = useState("Loading models...");
    const [faceDetected, setFaceDetected] = useState(false);
    const noFaceTimerRef = useRef(null);

    const loadModels = async () => {
        const MODEL_URL = '/models';
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setMessage("Models loaded successfully. Starting video");
            startVideo();
        } catch (error) {
            console.error("Error loading models:", error);
            setMessage("Error loading models. Please check your network or file paths.");
        }
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            videoRef.current.onloadedmetadata = handleVideoPlay;
        } catch (err) {
            console.error(err);
            setMessage("Unable to access the camera.");
        }
    };

    const handleVideoPlay = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            if (video && !video.paused && !video.ended) {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                if (resizedDetections.length > 0) {
                    setFaceDetected(true);
                    clearTimeout(noFaceTimerRef.current);
                } else {
                    setFaceDetected(false);
                }
            }
        }, 100);

        // Set timer for no face detection for 10 seconds
        noFaceTimerRef.current = setTimeout(() => {
            if (!faceDetected) {
                alert("No face detected for 10 seconds.");
            }
        }, 10000);
    };

    useEffect(() => {
        loadModels();
        return () => clearTimeout(noFaceTimerRef.current); // Cleanup timer on unmount
    }, []);

    return (
        <div className='flex flex-col m-4 w-2/5'>
            <div className="relative rounded-3xl border-2 border-[#22223B] overflow-hidden mt-4">
                <video
                    ref={videoRef}
                    className="block w-full"
                    style={{ height: 'auto' }}
                    autoPlay
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0"
                    style={{ width: '100%', height: 'auto' }}
                />
            </div>
            <div className="mt-4 text-center bg-cyan-600/50 p-2 rounded-3xl">
                <h2 className="text-lg font-bold">{message}</h2>
            </div>
        </div>
    );
};

export default FaceDetection;
