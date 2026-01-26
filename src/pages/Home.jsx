import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Shield, Smartphone, Map, CreditCard, Star, Clock, CheckCircle, Car, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import autoImg from '../assets/auto1.jpg';
import carImg from '../assets/car1.jpg';
import truckImg from '../assets/truck1.jpg';
import customerAppImg from '../assets/playstorecustomer.png';
import driverAppImg from '../assets/playstoredriver.png';

const FeatureCard = ({ image, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer overflow-hidden h-full flex flex-col"
    >
        <div className="h-48 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-transparent transition-colors z-10"></div>
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
        </div>
        <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-heading font-bold mb-3 text-slate-900 group-hover:text-purple-600 transition-colors">{title}</h3>
            <p className="text-slate-500 text-base leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);

const Home = () => {
    return (
        <div className="min-h-screen w-full bg-white">
            <Navbar />
            <Hero />

            {/* Our Services Section */}
            <section className="py-24 w-full bg-white">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900">
                            Our <span className="text-purple-600">Services</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            Choose the perfect ride for your journey. Safe, reliable, and affordable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Auto */}
                        <div className="bg-slate-50 rounded-[32px] p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group text-center border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-yellow-100/50 rounded-full scale-75 group-hover:scale-100 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                                <img src={autoImg} alt="Auto" className="w-48 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 group-hover:rotate-1 transition-all duration-500" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">Auto</h3>
                            <p className="text-slate-500">Fast & Affordable. No bargaining. Doorstep pickup.</p>
                        </div>

                        {/* Car */}
                        <div className="bg-slate-50 rounded-[32px] p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group text-center border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-purple-100/50 rounded-full scale-75 group-hover:scale-100 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                                <img src={carImg} alt="Car" className="w-64 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 group-hover:-rotate-1 transition-all duration-500" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">Cab</h3>
                            <p className="text-slate-500">Top-rated AC minis, sedans, and SUVs for your comfort.</p>
                        </div>

                        {/* Truck */}
                        <div className="bg-slate-50 rounded-[32px] p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group text-center border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            <div className="h-48 w-full flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-blue-100/50 rounded-full scale-75 group-hover:scale-100 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                                <img src={truckImg} alt="Truck" className="w-56 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 group-hover:rotate-1 transition-all duration-500" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">Truck</h3>
                            <p className="text-slate-500">Reliable goods transport and house shifting services.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services/Features Section - LIGHT GRAY BG */}
            <section className="py-24 relative bg-slate-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900">
                            Why Choose <span className="text-purple-600">Transporter?</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            We're not just moving people; we're moving the world forward.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80"
                            title="Unmatched Safety"
                            desc="Every ride is tracked in real-time. Our SOS features and vetted drivers ensure your peace of mind."
                            delay={0.1}
                        />
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1493514789931-586cb2dbdf1f?auto=format&fit=crop&w=800&q=80"
                            title="Always On Time"
                            desc="Our predictive algorithms ensure that your ride arrives exactly when you need it. No delays."
                            delay={0.2}
                        />
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80"
                            title="Seamless Payments"
                            desc="Go cashless with our integrated wallet. Pay via UPI, Card, or Apple Pay securely in seconds."
                            delay={0.3}
                        />
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80"
                            title="Live Tracking"
                            desc="Share your ride details with loved ones. Watch your ride arrive in real-time on the map."
                            delay={0.4}
                        />
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80"
                            title="Super App"
                            desc="Book rides, order food, and send packages—all from a single, beautifully designed application."
                            delay={0.5}
                        />
                        <FeatureCard
                            image="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
                            title="Premium Comfort"
                            desc="Choose from our fleet of top-rated vehicles. Clean, air-conditioned, and maintained for your comfort."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* App Download Section - WHITE BG */}
            <section className="py-24 bg-white relative overflow-hidden w-full">
                <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900">
                            Download our apps for the best experience
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Get seamless rides and drive opportunities with our mobile apps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Customer App */}
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-200">
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
                                <button className="flex-1 bg-slate-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-slate-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    Google Play
                                </button>
                            </div>
                        </div>

                        {/* Driver App */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-200">
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
        </div>
    );
};

export default Home;
