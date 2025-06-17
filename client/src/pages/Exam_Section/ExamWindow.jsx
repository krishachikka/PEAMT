import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FaceDetection from '../../components/FaceDetection';
import MouseTracker from '../../components/MouseTracker';

function ExamWindow() {
    const location = useLocation();
    const { examName, duration } = location.state || { examName: 'defaultExam', duration: '01:00:00' };
    const { currentUser } = useSelector((state) => state.user);
    const [allQuestions, setAllQuestions] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [theoryAnswer, setTheoryAnswer] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [currentQuestions, setCurrentQuestions] = useState([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [error, setError] = useState('');
    const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [showAutoSubmitPopup, setShowAutoSubmitPopup] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const timerRef = useRef();
    const navigate = useNavigate();
    const videoRef = useRef();
    const canvasRef = useRef();

    const [alertCount, setAlertCount] = useState({
        visibility: 0,
        blur: 0,
        copy: 0,
        refresh: 0,
        fullscreen: 0,
    });

    const securityFeaturesEnabled = false;

    useEffect(() => {
        if (!currentUser || !currentUser._id) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/examQuestions?examName=${encodeURIComponent(examName)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch questions');
                const data = await response.json();

                if (data.questions && data.questions.length > 0) {
                    const groupedQuestions = data.questions.reduce((acc, question) => {
                        const subject = question.subject;
                        if (!acc[subject]) acc[subject] = [];
                        acc[subject].push(question);
                        return acc;
                    }, {});

                    Object.keys(groupedQuestions).forEach((subject) => {
                        groupedQuestions[subject] = shuffleArray(groupedQuestions[subject]);
                    });

                    setAllQuestions(groupedQuestions);
                    const subjectsList = Object.keys(groupedQuestions);
                    setSubjects(subjectsList);

                    if (subjectsList.length > 0) {
                        setSelectedSubject(subjectsList[0]);
                        setCurrentQuestions(groupedQuestions[subjectsList[0]]);
                        setSelectedQuestionIndex(0);
                    }
                } else {
                    setError(`No questions available for the exam: ${examName}.`);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                setError('Could not load questions. Please try again later.');
            }
        };

        fetchData();

        const [hours, minutes] = duration.split(':').map(Number);
        setTime({ hours, minutes, seconds: 0 });

        timerRef.current = setInterval(() => {
            setTime((prevTime) => {
                const { hours, minutes, seconds } = prevTime;
                if (seconds > 0) {
                    return { ...prevTime, seconds: seconds - 1 };
                } else if (minutes > 0) {
                    return { hours, minutes: minutes - 1, seconds: 59 };
                } else if (hours > 0) {
                    return { hours: hours - 1, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return prevTime;
                }
            });
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
        };
    }, [examName, duration, currentUser, navigate]);

    useEffect(() => {
        if (!securityFeaturesEnabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setAlertCount((prev) => ({ ...prev, visibility: prev.visibility + 1 }));
                if (alertCount.visibility < 1) {
                    alert('Please do not switch tabs during the exam.');
                }
                if (alertCount.visibility >= 2) {
                    handleAutoSubmit();
                }
            }
        };

        const handleBlur = () => {
            setAlertCount((prev) => ({ ...prev, blur: prev.blur + 1 }));
            if (alertCount.blur < 1) {
                alert('Please do not switch to another application during the exam.');
            }
            if (alertCount.blur >= 2) {
                handleAutoSubmit();
            }
        };

        const handleCopy = (event) => {
            event.preventDefault();
            setAlertCount((prev) => ({ ...prev, copy: prev.copy + 1 }));
            if (alertCount.copy < 1) {
                alert('Copying text is not allowed during the exam.');
            }
        };

        const handleKeyPress = (event) => {
            if (event.key === 'F5' || event.key === 'r') {
                event.preventDefault();
                setAlertCount((prev) => ({ ...prev, refresh: prev.refresh + 1 }));
                if (alertCount.refresh < 1) {
                    alert('Refreshing the page is not allowed during the exam.');
                }
                if (alertCount.refresh >= 2) {
                    handleAutoSubmit();
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                setAlertCount((prev) => ({ ...prev, fullscreen: prev.fullscreen + 1 }));
                if (alertCount.fullscreen < 1) {
                    alert('Exiting fullscreen is not allowed during the exam.');
                }
                if (alertCount.fullscreen >= 2) {
                    handleAutoSubmit();
                }
            }
            if (event.key === 'F11') {
                event.preventDefault();
                alert('Fullscreen mode is mandatory during the exam.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [alertCount, securityFeaturesEnabled]);

    const handleAutoSubmit = () => {
        if (alertCount.visibility >= 3 || alertCount.blur >= 3 || alertCount.refresh >= 3) {
            setShowAutoSubmitPopup(true);
            setTimeout(() => {
                confirmSubmit();
            }, 3000);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setCurrentQuestions(allQuestions[subject] || []);
        setSelectedQuestionIndex(0);
    };

    const handleOptionChange = (option) => {
        setResponses((prevResponses) => ({
            ...prevResponses,
            [selectedSubject]: {
                ...(prevResponses[selectedSubject] || {}),
                [selectedQuestionIndex]: { option, status: 'selected' },
            },
        }));
        setError('');
    };

    const handleTheoryChange = (answer) => {
        setTheoryAnswer(answer);
        setResponses((prevResponses) => ({
            ...prevResponses,
            [selectedSubject]: {
                ...(prevResponses[selectedSubject] || {}),
                [selectedQuestionIndex]: { answer, status: 'typed' },
            },
        }));
    };

    const handleMarkForReview = () => {
        setMarkedForReview((prevMarked) => ({
            ...prevMarked,
            [selectedSubject]: {
                ...(prevMarked[selectedSubject] || {}),
                [selectedQuestionIndex]: true,
            },
        }));
    };

    const handlePrevious = () => {
        if (selectedQuestionIndex > 0) {
            setSelectedQuestionIndex((prevIndex) => prevIndex - 1);
        } else {
            alert('This is the first question in the subject.');
        }
        setError('');
    };

    const handleNext = () => {
        if (selectedQuestionIndex < currentQuestions.length - 1) {
            setSelectedQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            alert('You have completed all questions for this subject.');
        }
        setError('');
    };

    const handleSubmit = () => {
        setShowConfirmSubmit(true);
    };

    const confirmSubmit = async () => {
        const userEmail = currentUser.email;

        if (!userEmail) {
            alert('User email is not available. Cannot submit the exam.');
            return;
        }

        const resultData = {
            email: userEmail,
            examName: examName,
            responses: responses,
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL / api / submitResult}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify(resultData),
            });

            if (!response.ok) throw new Error('Failed to submit results');

            const data = await response.json();
            console.log('Result submitted successfully:', data);
            alert('Exam submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting results:', error);
            alert('Could not submit exam. Please try again later.');
        }
    };

    const formatTime = (time) => {
        const { hours, minutes, seconds } = time;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const selectedOption = responses[selectedSubject]?.[selectedQuestionIndex]?.option;

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        const startVideo = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;

            const context = canvasRef.current.getContext('2d');
            videoRef.current.addEventListener('loadeddata', () => {
                setInterval(() => {
                    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                }, 1000 / 30); // Draw at 30 FPS
            });
        };

        startVideo();

        return () => {
            if (videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="flex mt-10 p-10" style={{ height: '80vh' }}>
            {showAutoSubmitPopup && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-300 rounded-3xl text-black text-lg text-center p-4 z-50">
                    Your exam is auto-submitting due to excessive interruptions. Please wait...
                </div>
            )}
            <FaceDetection />

            <div className="w-1/6 p-2 bg-gray-100 rounded-lg" style={{ height: '100%', overflowY: 'auto' }}>

                <div className="bg-cyan-200/50 p-4 rounded-lg shadow-md h-full">
                    <h3 className="text-xl font-semibold mb-4">Subjects</h3>
                    {error && <p className="text-rose-500">{error}</p>}
                    <div className="grid grid-cols-1 gap-2">
                        {subjects.map((subject, index) => (
                            <button
                                key={index}
                                onClick={() => handleSubjectSelect(subject)}
                                className={`px-4 py-2 rounded-lg text-white ${selectedSubject === subject ? 'bg-cyan-600' : 'bg-gray-500'} hover:bg-opacity-75`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-4/6 p-4">
                <div className="bg-white shadow-md p-4 rounded-lg h-full flex flex-col justify-between">
                    <h3 className="text-xl font-bold">Question {selectedQuestionIndex + 1} of {currentQuestions.length} for {selectedSubject}</h3>
                    {currentQuestions.length > 0 && (
                        <>
                            <section>
                                <p className="mt-2 mb-4">{currentQuestions[selectedQuestionIndex].text}</p>
                                <div className="flex flex-col space-y-2">
                                    {currentQuestions[selectedQuestionIndex].options &&
                                        (currentQuestions[selectedQuestionIndex].options.length === 0 ||
                                            currentQuestions[selectedQuestionIndex].options.every(option => option === "")) ? (
                                        <textarea
                                            value={theoryAnswer}
                                            onChange={(e) => handleTheoryChange(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="border p-2 rounded-lg w-full h-32 resize-none"
                                            style={{ overflow: 'hidden' }}
                                            onFocus={(e) => e.target.select()}
                                            rows={1}
                                            onInput={(e) => e.target.style.height = e.target.scrollHeight + 'px'}
                                        />
                                    ) : (
                                        currentQuestions[selectedQuestionIndex].options.map((option, optionIndex) => (
                                            <label key={optionIndex} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    value={option}
                                                    checked={selectedOption === option}
                                                    onChange={() => handleOptionChange(option)}
                                                    className="form-radio"
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </section>
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={handlePrevious}
                                    className="px-4 py-2 bg-cyan-800 text-white rounded-3xl hover:bg-sky-500"
                                    disabled={selectedQuestionIndex === 0}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-3xl hover:bg-sky-700"
                                    disabled={selectedQuestionIndex === currentQuestions.length - 1}
                                >
                                    Next
                                </button>
                                <button
                                    onClick={handleMarkForReview}
                                    className={`px-4 py-2 bg-yellow-500 text-white rounded-3xl hover:bg-yellow-600 ${markedForReview[selectedSubject]?.[selectedQuestionIndex] ? 'opacity-50' : ''}`}
                                >
                                    {markedForReview[selectedSubject]?.[selectedQuestionIndex] ? 'Marked' : 'Mark for Review'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-1/6 p-2 bg-gray-100 rounded-lg flex flex-col justify-between">
                <div className="bg-sky-800 p-4 rounded-3xl shadow-md text-white">
                    <h3 className="text-xl font-semibold mb-4">Timer</h3>
                    <p className="text-2xl font-bold">{formatTime(time)}</p>
                </div>
                <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 mt-4"
                >
                    Submit Exam
                </button>
            </div>

            {/* <div className="relative flex justify-center items-center h-full">
                <video
                    ref={videoRef}
                    style={{
                        width: '300px',
                        height: 'auto',
                        border: '2px solid white',
                        borderRadius: '10px',
                        zIndex: 10,
                    }}
                    autoPlay
                    muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div> */}

            <MouseTracker />

            {showConfirmSubmit && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Are you sure you want to submit?</h3>
                        <p>Once you submit, you will not be able to change your answers.</p>
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={confirmSubmit}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Yes, Submit
                            </button>
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamWindow;
