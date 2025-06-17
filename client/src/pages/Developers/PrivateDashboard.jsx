import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PrivateDashboard() {
    const [admins, setAdmins] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();
    const privatePassId = import.meta.env.VITE_PRIVATE_DASHBOARD_ID;
    const dashboardPassword = import.meta.env.VITE_DASHBOARD_PASSWORD;

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/form/admins`);
                setAdmins(response.data.data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        fetchAdmins();
    }, []);

    const handleNavigateToForm = () => {
        navigate(`/private-dashboard/${privatePassId}/admin-entry`);
    };

    const handleDeleteAdmin = async (id) => {
        if (password !== dashboardPassword) {
            setPasswordError(true);
            return;
        }

        setIsDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/form/admins/${id}`);
            setAdmins(admins.filter(admin => admin._id !== id));
            setPassword('');
            setPasswordError(false);
        } catch (error) {
            console.error('Error deleting admin:', error);
        } finally {
            setIsDeleting(false);
            setAdminToDelete(null);
            setShowConfirmation(false);
        }
    };

    const confirmDelete = (id) => {
        setAdminToDelete(id);
        setShowConfirmation(true);
    };

    const cancelDelete = () => {
        setAdminToDelete(null);
        setShowConfirmation(false);
        setPassword('');
        setPasswordError(false);
    };

    return (
        <div className="bg-[#F6F5F5] min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Private Dashboard</h1>
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleNavigateToForm}
                        className="bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 text-white font-semibold py-2 px-6 rounded-lg shadow"
                    >
                        Go to Admin Entry Form
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                        <thead className="bg-[#B692C2]">
                            <tr>
                                <th className="px-4 py-2 border border-gray-300">College</th>
                                <th className="px-4 py-2 border border-gray-300">Exam</th>
                                <th className="px-4 py-2 border border-gray-300">Email</th>
                                <th className="px-4 py-2 border border-gray-300">Phone</th>
                                <th className="px-4 py-2 border border-gray-300">Description</th>
                                <th className="px-4 py-2 border border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr
                                    key={admin._id}
                                    className="hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <td className="px-4 py-2 border border-gray-300 text-center">{admin.college}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{admin.exam}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{admin.email}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{admin.phone}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">{admin.description}</td>
                                    <td className="px-4 py-2 border border-gray-300 text-center">
                                        <button
                                            onClick={() => confirmDelete(admin._id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-lg font-semibold mb-4">Are you sure you want to delete this admin?</p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="border border-gray-300 p-2 rounded-md w-full mb-4 focus:ring-2 focus:ring-blue-400"
                            />
                            {passwordError && <p className="text-red-600 mb-4">Incorrect password. Please try again.</p>}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteAdmin(adminToDelete)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrivateDashboard;
