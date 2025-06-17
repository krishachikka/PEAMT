import React, { useState } from 'react';

function AdminEntryForm() {
    const [formData, setFormData] = useState({
        college: '',
        exam: '',
        email: '',
        password: '',
        phone: '',
        description: ''
    });
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    const dashboardPassword = import.meta.env.VITE_DASHBOARD_PASSWORD;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const confirmSubmit = (e) => {
        e.preventDefault();
        setShowSubmitConfirmation(true);
    };

    const handleSubmit = async () => {
        if (passwordInput !== dashboardPassword) {
            setPasswordError(true);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/form/submit-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            const data = await response.json();
            console.log(data);
            setShowSubmitConfirmation(false);
            setPasswordInput('');
            setPasswordError(false);
        } catch (error) {
            console.error('Error submitting form:', error.message);
        }
    };

    const cancelSubmit = () => {
        setShowSubmitConfirmation(false);
        setPasswordInput('');
        setPasswordError(false);
    };

    return (
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-gray-100 to-white p-10 rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105">
            <h1 className="text-4xl font-extrabold text-center text-blue-800 tracking-wide mb-10">
                Admin Entry Form
            </h1>
            <form className="space-y-8" onSubmit={confirmSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="college" className="block text-lg font-semibold text-gray-700 mb-2">
                            College/Institution/Organization Name
                        </label>
                        <input
                            type="text"
                            id="college"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="exam" className="block text-lg font-semibold text-gray-700 mb-2">
                            Exam Name
                        </label>
                        <input
                            type="text"
                            id="exam"
                            name="exam"
                            value={formData.exam}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-lg font-semibold text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                    ></textarea>
                </div>

                <div className="text-right">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-transform duration-300 transform hover:scale-105"
                    >
                        Confirm Submission
                    </button>
                </div>
            </form>

            {showSubmitConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 text-center">Please enter the password to submit</h2>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter password"
                            className="w-full border border-gray-300 rounded-lg py-3 px-5 shadow-sm focus:ring-4 focus:ring-blue-300 focus:border-transparent transition duration-200"
                        />
                        {passwordError && <p className="text-red-500 text-center font-semibold">Incorrect password. Try again.</p>}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelSubmit}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-transform duration-300 transform hover:scale-105"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEntryForm;
