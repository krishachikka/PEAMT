import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function MyExams() {
    const { currentUser } = useSelector((state) => state.user);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchExamDetails = async () => {
        if (!currentUser.username) {
            setError('Username not available.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/regform/username/${currentUser.username}/exams/details`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: Failed to fetch exam details`);
            }
            const data = await response.json();
            setExams(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamDetails();
    }, [currentUser.username]);

    const handleGiveExam = (exam) => {
        navigate('/start', { state: { examName: exam.examName, duration: exam.duration } });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Exams</h1>
            {loading ? (
                <p className="text-lg text-gray-600">Loading exam details...</p>
            ) : error ? (
                <p className="text-lg text-red-600">Error: {error}</p>
            ) : (
                <div>
                    <h3 className="text-2xl font-semibold mb-4">Upcoming Exams:</h3>
                    {exams.length > 0 ? (
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                            <thead className="bg-gradient-to-t from-cyan-400 to-cyan-600 text-white rounded-3xl border-4">
                                <tr className="bg-gray-100 text-left text-gray-600">
                                    <th className="px-6 py-3 border-b">Exam Name</th>
                                    <th className="px-6 py-3 border-b">Duration</th>
                                    <th className="px-6 py-3 border-b">Eligibility</th>
                                    <th className="px-6 py-3 border-b">Exam Date</th>
                                    <th className="px-6 py-3 border-b">Registration End Date</th>
                                    <th className="px-6 py-3 border-b">Total Marks</th>
                                    <th className="px-6 py-3 border-b">Passing Marks</th>
                                    <th className="px-6 py-3 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam, index) => {
                                    const examDate = new Date(exam.examDate);
                                    const today = new Date();
                                    const isToday = today.toDateString() === examDate.toDateString();

                                    return (
                                        <tr key={exam.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 border-b">{exam.examName}</td>
                                            <td className="px-6 py-4 border-b">{exam.duration}</td>
                                            <td className="px-6 py-4 border-b">{exam.eligibility}</td>
                                            <td className="px-6 py-4 border-b">{examDate.toLocaleDateString()}</td>
                                            <td className="px-6 py-4 border-b">{new Date(exam.registrationEndDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 border-b">{exam.totalMarks}</td>
                                            <td className="px-6 py-4 border-b">{exam.passingMarks}</td>
                                            <td className="px-6 py-4 border-b">
                                                <button
                                                    onClick={() => handleGiveExam(exam)}
                                                    disabled={!isToday}
                                                    className={`${isToday ? 'bg-cyan-800 text-white hover:bg-cyan-600 rounded-3xl' : 'bg-gray-300 text-gray-600 cursor-not-allowed'} font-semibold py-2 px-4 rounded-3xl transition`}
                                                >
                                                    Give Exam
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-lg text-gray-600">No exams scheduled.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyExams;
