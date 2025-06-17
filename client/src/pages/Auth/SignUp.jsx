import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OAuth from '../../components/OAuth';

export default function SignUp() {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    // Redirect to home if the user is already signed in
    useEffect(() => {
        if (currentUser) {
            navigate('/'); // Redirect to home page if user is already signed in
        }
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(false);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            console.log(data);
            setLoading(false);
            if (data.success === false) {
                setError(true);
                return;
            }
            navigate('/sign-in');
        } catch (error) {
            setLoading(false);
            setError(true);
        }
    };

    return (
        <section className='bg-gradient-to-r from-cyan-600 to-indigo-300 p-10' style={{ width: '100%', height: '100vh' }}>
            <section className='signUpBox flex row max-w-screen-lg mx-auto my-auto rounded-3xl bg-white'
                data-aos="flip-right"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="1000"
            >
                <div className='mx-auto p-4'>
                    <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <input
                            type='text'
                            placeholder='Username'
                            id='username'
                            className='inputBox'
                            onChange={handleChange}
                        />
                        <input
                            type='email'
                            placeholder='Email'
                            id='email'
                            className='inputBox'
                            onChange={handleChange}
                        />
                        <input
                            type='password'
                            placeholder='Password'
                            id='password'
                            className='inputBox'
                            onChange={handleChange}
                        />
                        <button
                            disabled={loading}
                            className='formButton'
                        >
                            {loading ? 'Loading...' : 'Sign Up'}
                        </button>
                        <OAuth />
                    </form>
                    <div className='flex gap-2 mt-5'>
                        <p>Have an account?</p>
                        <Link to='/sign-in'>
                            <span className='text-cyan-500 font-bold transition-all ease-in-out hover:text-cyan-700 hover:drop-shadow-xl'>Sign in</span>
                        </Link>
                    </div>
                    <p className='text-red-700 mt-5'>{error && 'Something went wrong!'}</p>
                </div>
                <div className='SignUpimageSection'>
                    {/* Image or other content */}
                </div>
            </section>
        </section>
    );
}
