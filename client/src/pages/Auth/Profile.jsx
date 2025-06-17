import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';
import { useDispatch } from 'react-redux';
import {
    updateUserStart,
    updateUserFailure,
    updateUserSuccess,
    deleteUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    signOut,
} from '../../redux/user/userSlice';
import '../../styles/pages/Signin.css';

const ADMIN_PROFILE_PIC_URL = 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg';

export default function Profile() {
    const dispatch = useDispatch();
    const fileRef = useRef(null);
    const [image, setImage] = useState(undefined);
    const [imagePercent, setImagePercent] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({});
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { currentUser, loading, error } = useSelector((state) => state.user);
    const isAdmin = currentUser?.isAdmin; // Check if the user is an admin

    useEffect(() => {
        if (currentUser) {
            setFormData({
                username: currentUser.username,
                email: currentUser.email,
                password: '',
                profilePicture: currentUser.profilePicture,
            });
        }
    }, [currentUser]);

    useEffect(() => {
        if (image) {
            handleFileUpload(image);
        }
    }, [image]);

    const handleFileUpload = async (image) => {
        if (!currentUser) {
            setImageError(true);
            console.error("User is not authenticated.");
            return;
        }

        const storage = getStorage(app);
        const fileName = new Date().getTime() + image.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImagePercent(Math.round(progress));
            },
            (error) => {
                console.error("Upload failed:", error);
                setImageError(true);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData((prevData) => ({ ...prevData, profilePicture: downloadURL }));
                } catch (err) {
                    console.error("Failed to get download URL:", err);
                    setImageError(true);
                }
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to update your profile?')) {
            try {
                dispatch(updateUserStart());
                const updateData = isAdmin ? { profilePicture: formData.profilePicture } : formData;
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/update/${currentUser._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });
                const data = await res.json();
                if (data.success === false) {
                    dispatch(updateUserFailure(data));
                    return;
                }
                dispatch(updateUserSuccess(data));
                setUpdateSuccess(true);
            } catch (error) {
                dispatch(updateUserFailure(error));
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                dispatch(deleteUserStart());
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/delete/${currentUser._id}`, {
                    method: 'DELETE',
                });
                const data = await res.json();
                if (data.success === false) {
                    dispatch(deleteUserFailure(data));
                    return;
                }
                dispatch(deleteUserSuccess(data));
            } catch (error) {
                dispatch(deleteUserFailure(error));
            }
        }
    };

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            try {
                await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/signout`);
                dispatch(signOut());
            } catch (error) {
                console.log(error);
            }
        }
    };

    // Determine profile picture URL
    const profilePicUrl = currentUser.isAdmin
        ? ADMIN_PROFILE_PIC_URL
        : formData.profilePicture || currentUser.profilePicture;

    return (
        <section className='bg-gradient-to-r from-cyan-600 to-indigo-300 p-10' style={{ width: '900', height: '100vh' }}>
            <div className='max-w-screen-lg mx-auto p-6 bg-white rounded-3xl shadow-lg'>
                <h1 className='text-3xl text-center font-semibold mb-7'>Profile</h1>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='relative'>
                        <input
                            type='file'
                            ref={fileRef}
                            hidden
                            accept='image/*'
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                        <img
                            src={profilePicUrl}
                            alt='profile'
                            className='h-32 w-32 mx-auto rounded-full border-4 border-gray-300 object-cover cursor-pointer hover:border-gray-500 transition-all'
                            onClick={() => fileRef.current.click()}
                        />
                        <p className='text-center mt-2'>
                            {imageError ? (
                                <span className='text-red-600'>
                                    Error uploading image
                                </span>
                            ) : imagePercent > 0 && imagePercent < 100 ? (
                                <span className='text-gray-600'>{`Uploading: ${imagePercent}%`}</span>
                            ) : imagePercent === 100 ? (
                                <span className='text-green-600'>Image uploaded successfully</span>
                            ) : (
                                ''
                            )}
                        </p>
                    </div>
                    <input
                        value={formData.username || ''}
                        type='text'
                        id='username'
                        placeholder='Username'
                        className='inputBox w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors'
                        onChange={handleChange}
                        disabled={isAdmin} // Disable if admin
                    />
                    <input
                        value={formData.email || ''}
                        type='email'
                        id='email'
                        placeholder='Email'
                        className='inputBox w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors'
                        onChange={handleChange}
                        disabled={isAdmin} // Disable if admin
                    />
                    <input
                        type='password'
                        id='password'
                        placeholder='Password'
                        className='inputBox w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors'
                        onChange={handleChange}
                        disabled={isAdmin} // Disable if admin
                    />

                    <button
                        type='submit'
                        className='formButton w-full text-white p-3 rounded-lg uppercase transition-colors disabled:opacity-80'
                    >
                        {loading ? 'Loading...' : 'Update'}
                    </button>
                </form>
                <div className='flex justify-between mt-6'>
                    <span
                        onClick={handleDeleteAccount}
                        className='text-red-600 cursor-pointer hover:underline'
                    >
                        Delete Account
                    </span>
                    <span
                        onClick={handleSignOut}
                        className='text-red-600 cursor-pointer hover:underline'
                    >
                        Sign out
                    </span>
                </div>
                {error && <p className='text-red-600 mt-4 text-center'>{'Something went wrong!'}</p>}
                {updateSuccess && <p className='text-green-600 mt-4 text-center'>{'User updated successfully!'}</p>}
            </div>
        </section>
    );
}
