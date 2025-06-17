import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ExamCardDisplay from './ExamCardDisplay';

function UserDashboard() {
    const [appliedExams, setAppliedExams] = useState([]);
    const [notAppliedExams, setNotAppliedExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/exams`); // Adjust the endpoint as needed
                if (response.ok) {
                    const data = await response.json();
                    // Assuming data contains both applied and not applied exams
                    setAppliedExams(data.filter(exam => exam.applied)); // Adjust condition based on your data structure
                    setNotAppliedExams(data.filter(exam => !exam.applied)); // Adjust condition based on your data structure
                } else {
                    // Handle non-error responses without throwing an error for empty data
                    setAppliedExams([]);
                    setNotAppliedExams([]);
                }
            } catch {
                // Do not set an error message for empty states
                setAppliedExams([]);
                setNotAppliedExams([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <button
                onClick={() => navigate('/my-exams')}
                className="bg-sky-800 text-white font-semibold py-2 px-4 rounded-3xl hover:bg-sky-600 transition"
            >
                Go to My Exams
            </button>

            {appliedExams.length > 0 && (
                <div>
                    <h2>Applied Exams</h2>
                    <ExamCardDisplay exams={appliedExams} />
                </div>
            )}

            {notAppliedExams.length > 0 && (
                <div>
                    <h2>Not Applied Exams</h2>
                    <ExamCardDisplay exams={notAppliedExams} />
                </div>
            )}

            {appliedExams.length === 0 && notAppliedExams.length === 0 && (
                <div>No exams available.</div>
            )}
        </div>
    );
}

export default UserDashboard;
