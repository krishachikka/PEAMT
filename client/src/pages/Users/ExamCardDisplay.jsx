import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const gradientPatterns = [
    'bg-gradient-to-b from-purple-800 to-indigo-400/75',
    'bg-gradient-to-b from-pink-800 to-pink-400/75',
    'bg-gradient-to-b from-orange-600 to-yellow-500/75',
    'bg-gradient-to-b from-teal-700 to-blue-500/75',
    'bg-gradient-to-b from-green-700 to-green-400/75',
    'bg-gradient-to-b from-red-600 to-yellow-400/75',
];

const ExamCardDisplay = ({ exams }) => {
    const { currentUser } = useSelector((state) => state.user);
    const [appliedExams, setAppliedExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const navigate = useNavigate();

    // Fetch applied exams based on the current user's username
    useEffect(() => {
        const fetchAppliedExams = async () => {
            if (!currentUser?.username) return;
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/regform/username/${currentUser.username}/exams`);
                if (!response.ok) throw new Error('Failed to fetch applied exams');
                const data = await response.json();
                setAppliedExams(data.examNames || []);
            } catch {
                setAppliedExams([]); // Set to empty array if there's an error
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedExams();
    }, [currentUser?.username]);

    const handleApplyClick = (exam) => {
        setSelectedExam(exam);
    };

    const handleClosePopup = () => {
        if (selectedExam) {
            navigate('/registration-form', { state: { exam: selectedExam.examName } });
        }
        setSelectedExam(null);
    };

    const handleCancelPopup = () => {
        setSelectedExam(null);
    };

    const renderExamCard = (exam, index) => {
        const {
            examName,
            duration,
            eligibility,
            examDate,
            totalMarks,
            passingMarks,
            registrationEndDate,
        } = exam;

        const currentDate = new Date();
        const endDate = new Date(registrationEndDate);
        const examDateObj = new Date(examDate);
        const timeLeft = Math.max(Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)), 0);
        const cardGradient = gradientPatterns[index % gradientPatterns.length];
        const isApplied = appliedExams.includes(examName);

        return (
            <div
                key={index}
                className={`${cardGradient} text-white border-4 shadow-lg rounded-3xl p-6 hover:shadow-2xl transition-transform transform hover:scale-105`}
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{examName}</h2>
                    <p className="text-gray-200">{examDateObj.toLocaleDateString()}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Duration:</span>
                        <span className="font-bold">{duration} minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Eligibility:</span>
                        <span className="font-bold">{eligibility}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Total Marks:</span>
                        <span className="font-bold">{totalMarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Passing Marks:</span>
                        <span className="font-bold">{passingMarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Time left for registration:</span>
                        <span className={`font-bold bg-green-400 px-4 rounded-3xl ${timeLeft <= 5 ? 'bg-red-300 text-red-900' : 'text-black'}`}>
                            {timeLeft} days
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    {isApplied ? (
                        <button className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-3xl" disabled>
                            Already Applied
                        </button>
                    ) : (
                        <button
                            onClick={() => handleApplyClick(exam)}
                            className="bg-white text-cyan-600 font-semibold px-6 py-2 rounded-3xl hover:bg-gray-200 transition-all"
                        >
                            Apply Now
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8">
            <div className="flex justify-center mb-8">
                <div className="bg-sky-900 text-center text-white py-3 px-6 rounded-full shadow-md w-2/3">
                    <h1 className="text-2xl font-bold text-brown-600">Exams Overview</h1>
                </div>
            </div>

            {loading ? (
                <p className="text-lg text-gray-600">Loading exams...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exams.length > 0 ? exams.map(renderExamCard) : (
                        <p className="text-lg text-gray-600">No exams available.</p>
                    )}
                </div>
            )}

            {selectedExam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={handleCancelPopup}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h3 className="text-2xl font-bold mb-6 text-center">Exam Details</h3>
                        <div className="space-y-4">
                            <p><strong>Exam Name:</strong> {selectedExam.examName}</p>
                            <p><strong>Duration:</strong> {selectedExam.duration} minutes</p>
                            <p><strong>Eligibility:</strong> {selectedExam.eligibility}</p>
                            <p><strong>Exam Date:</strong> {new Date(selectedExam.examDate).toLocaleDateString()}</p>
                            <p><strong>Total Marks:</strong> {selectedExam.totalMarks}</p>
                            <p><strong>Passing Marks:</strong> {selectedExam.passingMarks}</p>
                            <p><strong>Registration End Date:</strong> {new Date(selectedExam.registrationEndDate).toLocaleDateString()}</p>
                        </div>
                        <button
                            onClick={handleClosePopup}
                            className="bg-green-600 text-white font-semibold px-6 py-3 mt-6 rounded-3xl hover:bg-green-700 transition-all w-full"
                        >
                            Register
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamCardDisplay;
