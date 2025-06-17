import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Optional for auto table creation

function Result() {
    const { currentUser } = useSelector((state) => state.user);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/results?userEmail=${encodeURIComponent(currentUser.email)}`); // Change to userEmail
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [currentUser]);

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Your Exam Results", 14, 22);

        results.forEach((result, index) => {
            const tableData = Object.entries(result.scores || {}).map(([subject, score]) => [
                subject,
                score || 0 // Default score to 0 if undefined
            ]);

            doc.autoTable({
                head: [['Subject', 'Score']],
                body: tableData,
                startY: 30 + (index * 50), // Adjust position for next table
            });

            doc.text(`Exam Name: ${result.examName}`, 14, doc.lastAutoTable.finalY + 10);
            doc.text(`Date: ${new Date(result.createdAt).toLocaleDateString()}`, 14, doc.lastAutoTable.finalY + 15);
        });

        doc.save('scorecard.pdf');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Your Exam Results</h1>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <>
                    <button
                        onClick={downloadPDF}
                        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Download Scorecard as PDF
                    </button>
                    {results.map((result) => (
                        <div key={result._id} className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">{result.examName}</h2>
                            <p className="text-gray-600 mb-2">Date: {new Date(result.createdAt).toLocaleDateString()}</p>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2">Subject</th>
                                        <th className="border px-4 py-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(result.scores || {}).map(([subject, score]) => (
                                        <tr key={subject}>
                                            <td className="border px-4 py-2">{subject}</td>
                                            <td className="border px-4 py-2">{score || 0}</td> {/* Ensure score defaults to 0 */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default Result;
