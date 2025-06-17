import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function RegisteredUsers() {
    const [examName, setExamName] = useState('');
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [calculatePercentile, setCalculatePercentile] = useState(false);
    const [percentiles, setPercentiles] = useState({});
    const [notification, setNotification] = useState(''); // State for notifications

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const examNameFromQuery = queryParams.get('examName');
        if (examNameFromQuery) {
            setExamName(examNameFromQuery);
            fetchUsers(examNameFromQuery);
        }
    }, [location]);

    const fetchUsers = async (examNameToFetch) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/regform/usernames/exam/${examNameToFetch}`);
            if (!response.ok) {
                throw new Error('Users not found');
            }
            const data = await response.json();
            setUsers(data);
            setError('');

            const resultsData = {};
            await Promise.all(data.map(async (user) => {
                const result = await fetchResults(user.email);
                if (result) {
                    resultsData[user.email] = result;
                }
            }));
            setResults(resultsData);
        } catch (err) {
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (userEmail) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/results?userEmail=${encodeURIComponent(userEmail)}`);
            if (!response.ok) {
                throw new Error('Results not found');
            }
            return await response.json();
        } catch (err) {
            console.error(err.message);
            return null;
        }
    };

    const handleCalculatePercentile = () => {
        const totalScores = users.map(user => {
            const userResults = results[user.email] || [];
            const totalScore = userResults.reduce((total, result) => {
                return total + Object.values(result.scores || {}).reduce((sum, score) => sum + (score || 0), 0);
            }, 0);
            return {
                email: user.email,
                totalScore: totalScore || 0
            };
        });

        const calculatedPercentiles = totalScores.reduce((acc, user) => {
            const belowCount = totalScores.filter(otherUser => otherUser.totalScore < user.totalScore).length;
            const percentile = (belowCount / totalScores.length) * 100;
            acc[user.email] = Math.round(percentile);
            return acc;
        }, {});

        setPercentiles(calculatedPercentiles);
    };

    const shareScores = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/share-scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ users, results }),
            });
            if (!response.ok) {
                throw new Error('Error sharing scores');
            }
            setNotification('Scores sent successfully!'); // Set success notification
        } catch (err) {
            setNotification(err.message); // Set error notification
        }
    };

    const getHighestLowestScores = () => {
        const totalScores = users.map(user => {
            const userResults = results[user.email] || [];
            const totalScore = userResults.reduce((total, result) => {
                return total + Object.values(result.scores || {}).reduce((sum, score) => sum + (score || 0), 0);
            }, 0);
            return {
                email: user.email,
                totalScore: totalScore || 0
            };
        });

        const highest = totalScores.reduce((max, user) => user.totalScore > max.totalScore ? user : max, { totalScore: -Infinity });
        const lowest = totalScores.reduce((min, user) => user.totalScore < min.totalScore ? user : min, { totalScore: Infinity });

        return {
            highest: highest.totalScore !== -Infinity ? highest : { email: 'N/A', totalScore: 0 },
            lowest: lowest.totalScore !== Infinity ? lowest : { email: 'N/A', totalScore: 0 },
        };
    };

    const { highest, lowest } = getHighestLowestScores();

    if (loading) {
        return <div>Loading...</div>;
    }

    const usersWithResults = users.filter(user => results[user.email]?.length > 0);

    return (
        <div className="container mx-auto p-8 bg-cyan-800 text-white">
            <h1 className="text-2xl font-bold text-center mb-6 text-white-500">
                Registered Users for Exam: {examName}
            </h1>
            {error && <p className="text-red-600 text-center">{error}</p>}

            {notification && <p className="text-green-600 text-center">{notification}</p>} {/* Notification message */}

            {users.length > 0 ? (
                <div className='mx-auto p-8 bg-cyan-600 rounded-3xl'>
                    <h2 className="text-xl font-semibold mb-4">Registered Users:</h2>
                    {users.map((user) => (
                        <p key={user.email} className="">{user.username} - {user.email}</p>
                    ))}
                </div>
            ) : (
                <p className="text-gray-200 text-center">No users registered for this exam.</p>
            )}

            {usersWithResults.length > 0 ? (
                <div className="mt-8 px-8">
                    <h2 className="text-xl font-semibold mb-4">Results:</h2>
                    {usersWithResults.map((user) => (
                        <div key={user.email} className="mb-6">
                            <h3 className="text-lg font-bold">{user.username} - {user.email}</h3>
                            {results[user.email].map((result) => (
                                <div key={result._id} className="m-4 bg-cyan-100/50 text-black p-8 rounded-3xl">
                                    <h4 className="font-bold">{result.examName}</h4>
                                    <p className="text-black font-bold mb-2">Date: {new Date(result.createdAt).toLocaleDateString()}</p>
                                    <table className="min-w-full bg-white border-2 text-black rounded-3xl overflow-hidden">
                                        <thead className='bg-gradient-to-t from-cyan-400 to-cyan-600'>
                                            <tr>
                                                <th className="border px-4 py-2">Subject</th>
                                                <th className="border px-4 py-2">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(result.scores || {}).map(([subject, score]) => (
                                                <tr key={subject}>
                                                    <td className="border px-4 py-2">{subject}</td>
                                                    <td className="border px-4 py-2">{score !== null ? score : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-300 text-center">No results found for any registered users.</p>
            )}

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Calculate Percentile:</h2>
                <div className="flex items-center">
                    <button
                        className="bg-sky-300 text-cyan-900 font-bold p-4 rounded-3xl"
                        onClick={() => {
                            setCalculatePercentile(true);
                            handleCalculatePercentile();
                        }}
                    >
                        Calculate Percentile
                    </button>
                </div>
            </div>

            {calculatePercentile && usersWithResults.length > 0 && (
                <div className="mt-8 bg-slate-300 p-8 rounded-3xl w-3/5">
                    <h2 className="text-xl font-bold text-black mb-4">Calculated Percentiles:</h2>
                    {usersWithResults.map(user => (
                        <p key={user.email} className="text-gray-800">
                            {user.username} - {user.email}: {percentiles[user.email] !== undefined ? percentiles[user.email] : 'N/A'}%
                        </p>
                    ))}
                </div>
            )}

            <button
                className="bg-green-500 text-white font-bold p-4 rounded-3xl mt-4"
                onClick={shareScores}
            >
                Share Scores
            </button>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Highest and Lowest Scores:</h2>
                <div className="flex gap-3">
                    <div className="text-center bg-gradient-to-b from-cyan-600 to-cyan-400 p-8 rounded-2xl">
                        <h3 className="font-bold ">Highest Score</h3>
                        <p>{highest.email}</p>
                        <p>Score: {highest.totalScore}</p>
                        <p>Percentile: {percentiles[highest.email] !== undefined ? percentiles[highest.email] : 'N/A'}%</p>
                    </div>
                    <div className="text-center bg-gradient-to-b from-cyan-600 to-cyan-400 p-8 rounded-2xl">
                        <h3 className="font-bold">Lowest Score</h3>
                        <p>{lowest.email}</p>
                        <p>Score: {lowest.totalScore}</p>
                        <p>Percentile: {percentiles[lowest.email] !== undefined ? percentiles[lowest.email] : 'N/A'}%</p>
                    </div>
                </div>
                <div className="mt-4">
                    {usersWithResults.length === 0 ? (
                        <p className="text-white text-center">No scores available for chart representation.</p>
                    ) : (
                        <p className="text-white text-center">Scores are available for the highest and lowest users.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegisteredUsers;