import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp as apiVerifyOtp, sendOtp as apiSendOtp } from '../services/api';
import { auth, signInWithCustomToken } from '../services/firebase';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = Mobile, 2 = OTP
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`; // Default to India

        try {
            // Backend-driven OTP (Fast2SMS)
            await apiSendOtp(formattedMobile);
            setStep(2);
            alert('OTP Sent via SMS! (Mocked if no API Key)');
        } catch (error) {
            console.error("OTP Send Error:", error);
            alert('Failed to send OTP: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Format mobile again (safe & consistent)
            const formattedMobile = mobile.startsWith('+')
                ? mobile
                : `+91${mobile}`;

            // 1. Verify OTP with Backend & Get Tokens
            const res = await apiVerifyOtp(formattedMobile, otp);
            const { token, firebaseToken, user, success } = res.data;

            if (success && firebaseToken) {
                // 2. Sign in to Firebase Client SDK with Custom Token
                // This ensures Maps, Firestore (client-side) work as this user.
                await signInWithCustomToken(auth, firebaseToken);
                console.log("Firebase Custom Auth Successful");

                // 3. Store Backend JWT & User
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                navigate('/app');
            } else {
                throw new Error('Verification failed or missing tokens');
            }

        } catch (err) {
            console.error(err);
            alert('Invalid OTP or Server Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Transporter</h2>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                type="tel"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="9876543210"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
                        >
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
