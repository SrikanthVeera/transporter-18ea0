import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, DollarSign, Clock, Shield, MapPin, Smartphone, Info, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';
import driverImg from '../assets/driver1.png';
import autoImg from '../assets/auto1.jpg';
import carImg from '../assets/car1.jpg';
import truckImg from '../assets/truck1.jpg';
import customerAppImg from '../assets/playstorecustomer.png';
import driverAppImg from '../assets/playstoredriver.png';

const Drive = () => {
    // Auth State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(false); // Default to Sign Up
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUpToDrive = () => {
        setIsLoginMode(false);
        setShowLoginModal(true);
    };

    const handleAuth = async () => {
        if (!email || !password) {
            setAuthError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setAuthError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setAuthError('');

        try {
            let userCredential;
            if (isLoginMode) {
                // Login
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Sign Up
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;
            console.log("Driver Auth Success:", user.uid);

            // Close modal
            setShowLoginModal(false);

            // Redirect logic
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android/i.test(userAgent)) {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.driver";
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                window.location.href = "https://apps.apple.com/in/app/transporter-driver/id6755738682";
            } else {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.driver";
            }

        } catch (error) {
            console.error("Driver Auth Error:", error);
            let msg = "Authentication failed.";
            if (error.code === 'auth/email-already-in-use') msg = "Email already in use. Please login.";
            if (error.code === 'auth/wrong-password') msg = "Invalid password.";
            if (error.code === 'auth/user-not-found') msg = "No driver account found with this email.";
            if (error.code === 'auth/invalid-email') msg = "Invalid email address.";
            setAuthError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section - Mobile Optimized */}
            <div className="relative min-h-[auto] md:min-h-[85vh] w-full bg-slate-50 overflow-hidden flex flex-col md:flex-row">

                {/* Left Content */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-16 relative z-20 pt-28 md:pt-16">
                    <div className="max-w-xl space-y-6 md:space-y-8 text-center md:text-left">
                        <div className="inline-block">
                            <span className="bg-orange-100 text-orange-700 font-bold px-4 py-1.5 rounded-full text-xs md:text-sm tracking-wide border border-orange-200">
                                🚀 Hiring in 25+ Cities
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-slate-900 leading-tight">
                            Turn <br />
                            <span className="text-purple-600 relative">
                                Kilometers
                                <svg className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-purple-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                            </span> <br />
                            Into Cash.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed px-2 md:px-0">
                            Join the revolution. Zero joining fees. Instant payouts.
                            The freedom to earn is just a ride away.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                            <button
                                onClick={handleSignUpToDrive}
                                className="w-full md:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                Become a Captain
                                <div className="bg-white/20 rounded-full p-1">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Image Side */}
                <div className="w-full md:w-1/2 relative h-[45vh] md:h-auto bg-purple-600 mt-8 md:mt-0">
                    <img
                        src={driverImg}
                        alt="Transporter Captain"
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
                    />
                    {/* Creative Connector */}
                    <div className="absolute -top-1 left-0 w-full h-16 bg-slate-50 z-10 block md:hidden" style={{ clipPath: 'ellipse(50% 60% at 50% 0%)' }}></div>
                    <div className="absolute top-0 left-0 w-16 h-full bg-slate-50 z-10 hidden md:block" style={{ clipPath: 'ellipse(60% 50% at 0% 50%)' }}></div>
                </div>
            </div>

            {/* Make Money / Vehicle Selection Section */}
            <div className="py-16 md:py-24 bg-white relative">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight">
                            Attach your <span className="text-purple-600">Auto, Car, or Truck</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                            Apply now to become a Transporter driver-partner. Start earning in 24 hours!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                        {/* Auto Card */}
                        <div className="group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white -z-10 group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Attach Auto</h3>
                                <p className="text-slate-500 text-sm mb-6">Earn up to ₹35,000/month</p>
                                <div className="h-40 md:h-48 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-yellow-100 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={autoImg} alt="Auto" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
                                </div>
                                <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-purple-600 transition-colors">
                                    Register Auto <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Car Card */}
                        <div className="group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white -z-10 group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Attach Car</h3>
                                <p className="text-slate-500 text-sm mb-6">Earn up to ₹55,000/month</p>
                                <div className="h-48 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={carImg} alt="Car" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
                                </div>
                                <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-purple-600 transition-colors">
                                    Register Car <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Truck Card */}
                        <div className="group relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10 group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Attach Truck</h3>
                                <p className="text-slate-500 text-sm mb-6">Earn up to ₹70,000/month</p>
                                <div className="h-48 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={truckImg} alt="Truck" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
                                </div>
                                <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-purple-600 transition-colors">
                                    Turn Miles to Money <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-20 bg-white">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Why Drive with Us?</h2>
                        <p className="text-gray-500 text-lg">We put our partners first. Experience the difference with Transporter.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: DollarSign, title: "Zero Commission", desc: "Keep 100% of what you earn during promotional periods. Low commission thereafter." },
                            { icon: Clock, title: "Flexible Schedule", desc: "You decide when and how long you want to drive. No minimum hours required." },
                            { icon: Shield, title: "Safety First", desc: "24/7 designated support line and in-app emergency button for your safety." },
                            { icon: Smartphone, title: "Easy App", desc: "Navigate easily with our driver-friendly app. See earnings in real-time." },
                            { icon: MapPin, title: "High Demand", desc: "Get more rides with our growing user base in top cities across the country." },
                            { icon: CheckCircle, title: "Insurance Cover", desc: "Comprehensive accidental insurance coverage for you and your family." },
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className="py-20 bg-purple-900 text-white">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-6">How to get started?</h2>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Sign Up Online", desc: "Fill out a simple form with your basic details and vehicle information." },
                                    { step: "02", title: "Upload Documents", desc: "Upload your driving license, vehicle registration, and ID proof." },
                                    { step: "03", title: "Get Verified", desc: "Our team will verify your documents within 24 hours." },
                                    { step: "04", title: "Start Driving", desc: "Download the driver app, log in, and start accepting rides!" }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center font-bold text-white font-heading text-xl">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                                            <p className="text-purple-200">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {/* Placeholder for an image or app screenshot */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Smartphone size={64} className="mx-auto mb-4 opacity-50 text-purple-200" />
                                    <p>Driver App Interface</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Download Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Download our apps to get the best experience</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Start your journey as a driver or book rides with our mobile apps</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Customer App */}
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                    <img src={customerAppImg} alt="Transporter Customer App" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-purple-600 group-hover:translate-x-2 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Transporter</h3>
                            <p className="text-gray-600 text-sm mb-6">Book rides, track your journey, and enjoy seamless transportation</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Google Play
                                </button>
                            </div>
                        </div>

                        {/* Driver App */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                    <img src={driverAppImg} alt="Transporter Driver App" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-purple-600 group-hover:translate-x-2 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Transporter Driver</h3>
                            <p className="text-gray-600 text-sm mb-6">Register as a driver, accept rides, and start earning with flexible hours</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    Google Play
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Login / Auth Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/20 backdrop-blur-sm p-4 w-full h-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isLoginMode ? 'Welcome Back, Driver' : 'Become a Driver'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {isLoginMode ? 'Log in to access your dashboard' : 'Join India\'s best driver community'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {authError && (
                                    <p className="text-red-600 text-xs font-medium bg-red-50 p-2 rounded flex items-center gap-2">
                                        <Info size={14} /> {authError}
                                    </p>
                                )}

                                <button
                                    onClick={handleAuth}
                                    disabled={loading}
                                    className="w-full bg-purple-600 text-white rounded-lg py-3.5 font-bold text-sm shadow-lg hover:bg-purple-700 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : (isLoginMode ? 'Login to Dashboard' : 'Sign Up & Drive')}
                                </button>

                                <div className="text-center mt-2">
                                    <button
                                        onClick={() => {
                                            setIsLoginMode(!isLoginMode);
                                            setAuthError('');
                                        }}
                                        className="text-xs text-purple-600 hover:text-purple-800 font-bold"
                                    >
                                        {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Drive;
