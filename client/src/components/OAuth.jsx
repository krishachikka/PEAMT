import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import google from '../assets/google.png'

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                }),
            });
            const data = await res.json();
            console.log(data);
            dispatch(signInSuccess(data));
            navigate('/');
        } catch (error) {
            console.log('could not login with google', error);
        }
    };
    return (
        <button
            type='button'
            onClick={handleGoogleClick}
            className='googleBtn bg-sky-500 text-white rounded-3xl p-3 uppercase'
        >
            <img src={google} style={{ width: '18px', padding: '2px' }}></img>
            Continue with google
        </button>
    );
}