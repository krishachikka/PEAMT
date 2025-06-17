import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [showPopup, setShowPopup] = useState(false);
    const [examDetails, setExamDetails] = useState({
        examName: '',
        duration: '',
        eligibility: '',
        examDate: '',
        registrationEndDate: '',
        totalMarks: '',
        passingMarks: '',
        secureCode: '', // New field for the 6-digit code
        subjects: [], // New field for subjects
    });

    const [exams, setExams] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [remainingExams, setRemainingExams] = useState(3); // Default limit

    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchExams();
        fetchRemainingExams(); // Fetch remaining exams on component mount
    }, []);

    const fetchExams = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/exams`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setExams(data);
            } else {
                console.error('Failed to fetch exams.');
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const fetchRemainingExams = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/exams`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const endOfMonth = new Date();
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                endOfMonth.setDate(0);
                endOfMonth.setHours(23, 59, 59, 999);

                const count = data.filter(exam => {
                    const createdAt = new Date(exam.createdAt);
                    return exam.adminEmail === currentUser?.email &&
                        createdAt >= startOfMonth &&
                        createdAt <= endOfMonth;
                }).length;

                setRemainingExams(3 - count); // Update remaining exams count
            } else {
                console.error('Failed to fetch exams.');
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const handleButtonClick = () => {
        setShowPopup(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExamDetails({ ...examDetails, [name]: value });
    };

    const handleSubjectsChange = (e) => {
        const { value } = e.target;
        const subjectsArray = value.split(',').map(subject => subject.trim());
        setExamDetails({ ...examDetails, subjects: subjectsArray });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that secureCode is exactly 6 digits
        const secureCodeRegex = /^\d{6}$/;
        if (!secureCodeRegex.test(examDetails.secureCode)) {
            setErrorMessage('Secure Code must be exactly 6 digits.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examName: examDetails.examName,
                    duration: examDetails.duration,
                    eligibility: examDetails.eligibility,
                    examDate: examDetails.examDate,
                    registrationEndDate: examDetails.registrationEndDate,
                    totalMarks: examDetails.totalMarks,
                    passingMarks: examDetails.passingMarks,
                    secureCode: examDetails.secureCode, // Include secureCode
                    subjects: examDetails.subjects, // Include subjects
                    adminEmail: currentUser?.email,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                const message = `Exam "${examDetails.examName}" created successfully!`;
                alert(message);
                localStorage.setItem('successMessage', message);

                setShowPopup(false);
                setExamDetails({
                    examName: '',
                    duration: '',
                    eligibility: '',
                    examDate: '',
                    registrationEndDate: '',
                    totalMarks: '',
                    passingMarks: '',
                    secureCode: '', // Reset secureCode
                    subjects: [], // Reset subjects
                });

                fetchExams();
                fetchRemainingExams(); // Update remaining exams count
            } else {
                setErrorMessage(result.message || 'Failed to create exam.');
                console.error(result.message || 'Failed to create exam.');
            }
        } catch (error) {
            setErrorMessage('Error creating exam.');
            console.error('Error creating exam:', error);
        }
    };

    const handleQuestionListClick = (examName) => {
        navigate(`/exam-builder?examName=${examName}`); // Redirect to the exam-builder route with examId
    };

    const handleViewRegisteredUsers = (examId, examName) => {
        navigate(`/registered-users?examName=${encodeURIComponent(examName)}`);
    };

    const adminExams = exams.filter(exam => exam.adminEmail === currentUser?.email);

    return (
        <div className="admin-dashboard bg-sky-800 flex flex-col items-center justify-start h-screen p-4 overflow-x-hidden"
        // style={{
        //     backgroundImage: 'url("https://i.pinimg.com/236x/b5/69/85/b5698579540881089e74f9e994ba8885.jpg")',
        //     backgroundSize: 'cover',
        //     backgroundPosition: 'center',
        //     paddingTop: '1rem' // Adjusted to reduce top space
        // }}
        >
            <div className="mb-4">
                <p className="text-lg font-semibold text-white">Remaining exams this month: {remainingExams}</p>
            </div>

            <button
                onClick={handleButtonClick}
                className="bg-gradient-to-r from-cyan-400 to-sky-500 text-white font-bold p-4 rounded-3xl shadow-lg transition-transform transform hover:scale-105 hover:bg-gradient-to-l"
                disabled={remainingExams <= 0} // Disable button if no remaining exams
            >
                Create New Exam
            </button>

            {showPopup && (
                <div
                    style={{
                        position: 'fixed',
                        inset: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: '10',
                    }}
                >
                    <div
                        style={{
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: 'none',
                            backgroundColor: '#e0e0e0',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#555', marginBottom: '16px' }} >
                            Create New Exam
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(examDetails).map((key) => {
                                if (key === 'secureCode') {
                                    return (
                                        <div key={key} style={{ marginBottom: '16px' }}>
                                            <label
                                                htmlFor={key}
                                                style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    color: '#666',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                                            </label>
                                            <input
                                                id={key}
                                                type="text"
                                                name={key}
                                                value={examDetails[key]}
                                                onChange={handleChange}
                                                placeholder="Enter 6-digit code"
                                                maxLength="6"
                                                pattern="\d{6}"
                                                title="6-digit numeric code"
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                                                    border: '1px solid #ccc',
                                                    outline: 'none',
                                                    width: '100%',
                                                    transition: 'box-shadow 0.3s ease, border 0.3s ease',
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.boxShadow = '4px 4px 8px #bebebe, -4px -4px 8px #ffffff';
                                                    e.target.style.border = '1px solid #888';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.boxShadow = '6px 6px 12px #bebebe, -6px -6px 12px #ffffff';
                                                    e.target.style.border = '1px solid #ccc';
                                                }}
                                                required
                                            />
                                        </div>
                                    );
                                }

                                if (key === 'subjects') {
                                    return (
                                        <div key={key} style={{ marginBottom: '16px' }}>
                                            <label
                                                htmlFor={key}
                                                style={{
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    color: '#666',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                Subjects (comma-separated):
                                            </label>
                                            <input
                                                id={key}
                                                type="text"
                                                name={key}
                                                value={examDetails[key].join(', ')}
                                                onChange={handleSubjectsChange}
                                                placeholder="Enter subjects"
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                                                    border: '1px solid #ccc',
                                                    outline: 'none',
                                                    width: '100%',
                                                    transition: 'box-shadow 0.3s ease, border 0.3s ease',
                                                }}
                                                required
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={key} style={{ marginBottom: '16px' }}>
                                        <label
                                            htmlFor={key}
                                            style={{
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#666',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </label>
                                        <input
                                            id={key}
                                            type={key.includes('Date') ? 'date' : key.includes('Marks') ? 'number' : 'text'}
                                            name={key}
                                            value={examDetails[key]}
                                            onChange={handleChange}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                backgroundColor: '#e0e0e0',
                                                boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                                                border: 'none',
                                                outline: 'none',
                                                width: '100%',
                                                transition: 'box-shadow 0.3s ease',
                                            }}
                                            onFocus={(e) => (e.target.style.boxShadow = '4px 4px 8px #bebebe, -4px -4px 8px #ffffff')}
                                            onBlur={(e) => (e.target.style.boxShadow = '6px 6px 12px #bebebe, -6px -6px 12px #ffffff')}
                                            required
                                        />
                                    </div>
                                );
                            })}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        background: '#14b8a6',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '4px 4px 8px #bebebe, -4px -4px 8px #ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '6px 6px 12px #bebebe, -6px -6px 12px #ffffff';
                                    }}
                                >
                                    Create Exam
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(false)}
                                    style={{
                                        background: '#f87171',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '4px 4px 8px #bebebe, -4px -4px 8px #ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '6px 6px 12px #bebebe, -6px -6px 12px #ffffff';
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                        {errorMessage && <p style={{ color: 'red', textAlign: 'center', marginTop: '16px' }}>{errorMessage}</p>}
                    </div>
                </div>
            )}

            <div className="w-full mt-8 rounded-3xl overflow-hiddenp-2">
                {adminExams.length > 0 ? (
                    <table className="w-full bg-white border-4 border-gray-300 rounded-3xl shadow-md overflow-hidden">
                        <thead className="bg-gradient-to-t from-cyan-400 to-cyan-600 text-white rounded-3xl border-4">
                            <tr className='rounded-3xl'>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Exam Name</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Duration</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Eligibility</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Exam Date</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Registration End Date</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Total Marks</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Passing Marks</th>
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Subjects</th> {/* Added column for subjects */}
                                <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            {adminExams.map((exam, index) => (
                                <tr key={index} className="hover:bg-gray-100 transition-colors duration-300">
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm font-bold">{exam.examName}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm font-semibold">{exam.duration}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{exam.eligibility}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm font-bold">{new Date(exam.examDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm font-bold">{new Date(exam.registrationEndDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{exam.totalMarks}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{exam.passingMarks}</td>
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm">{exam.subjects.join(', ')}</td> {/* Display subjects */}
                                    <td className="px-6 py-4 border-b border-gray-300 text-sm flex justify-center">
                                        <button
                                            onClick={() => handleQuestionListClick(exam.examName)} // Pass exam ID
                                            className="bg-sky-500 text-white font-bold py-1 px-3 rounded-2xl hover:bg-sky-600 hover:scale-105 hover:transition-all"
                                        >
                                            Question List
                                        </button>
                                        <button
                                            onClick={() => handleViewRegisteredUsers(exam._id, exam.examName)} // Pass exam ID and name
                                            className="ml-2 bg-sky-950 text-white font-bold py-1 px-3 rounded-2xl hover:bg-cyan-800 hover:scale-105 hover:transition-all"
                                        >
                                            Registered Users
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-white text-center">No exams available.</p>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;