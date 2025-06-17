import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInFailure, signInSuccess } from '../../redux/user/userSlice';
import OAuth from '../../components/OAuth';
import '../../styles/pages/Signin.css';

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const { loading, error, currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Check if user is already signed in
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
            dispatch(signInStart());
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to sign in');
            }

            const data = await res.json();
            if (data.success === false) {
                dispatch(signInFailure(data.errorMessage));
                return;
            }

            dispatch(signInSuccess(data));

            if (data.isAdmin) {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            dispatch(signInFailure(error.message));
        }
    };

    return (
        <section className='bg-gradient-to-r from-cyan-600 to-indigo-300 p-10' style={{ width: '100%', height: '100vh' }}>
            <section className='signInBox flex row max-w-screen-lg mx-auto my-auto rounded-3xl bg-white'
                data-aos="flip-left"
                data-aos-easing="ease-out-cubic"
                data-aos-duration="1000"
            >
                <div className='SignInimageSection'>
                    {/* Image or other content */}
                </div>
                <div className='mx-auto my-auto p-4'>
                    <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>
                        <OAuth />
                    </form>
                    <div className='flex gap-2 mt-5'>
                        <p>Don't have an account?</p>
                        <Link to='/sign-up'>
                            <span className='text-sky-500 font-bold transition-all ease-in-out hover:text-sky-700 hover:drop-shadow-xl'>Sign up</span>
                        </Link>
                    </div>
                    <p className='text-red-700 mt-5'>
                        {error ? error.message || 'Something went wrong!' : ''}
                    </p>
                </div>
            </section>
        </section>
    );
}
