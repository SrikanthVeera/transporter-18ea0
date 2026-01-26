import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Target, Award, Globe, Shield, Heart, Zap, CheckCircle, Car, Truck as TruckIcon, Crown } from 'lucide-react';
import customerAppImg from '../assets/playstorecustomer.png';
import driverAppImg from '../assets/playstoredriver.png';
import autoImg from '../assets/auto1.jpg';
import carImg from '../assets/car1.jpg';
import truckImg from '../assets/truck1.jpg';

const About = () => {
    return (
        <div className="min-h-screen w-full bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative min-h-screen w-full flex items-center pt-20 pb-20 overflow-hidden bg-white">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/4"></div>

                <div className="w-full px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10 max-w-7xl mx-auto">

                    {/* Text Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-medium shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                            About Transporter
                        </div>

                        <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight text-slate-900">
                            Revolutionizing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Urban Mobility</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                            We're not just a ride-hailing service. We're building the future of transportation,
                            connecting communities and empowering millions across India.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 font-bold">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-heading font-bold leading-none text-slate-900">Safety First</h4>
                                    <span className="text-xs text-slate-500">24/7 Support</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 font-bold">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-heading font-bold leading-none text-slate-900">Innovation</h4>
                                    <span className="text-xs text-slate-500">Cutting-edge Tech</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Widget / Right Side */}
                    <div className="relative">
                        {/* Decorative Floaties */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-100 rounded-2xl rotate-12 opacity-60"></div>
                        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-indigo-50 rounded-full opacity-60"></div>

                        <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Impact</h3>
                                <p className="text-slate-500 text-sm">Transforming mobility across India</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="text-3xl font-black text-purple-600">10M+</div>
                                    <div className="text-xs text-slate-600 font-medium">Happy Riders</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="text-3xl font-black text-purple-600">500K+</div>
                                    <div className="text-xs text-slate-600 font-medium">Driver Partners</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="text-3xl font-black text-purple-600">50+</div>
                                    <div className="text-xs text-slate-600 font-medium">Cities</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <div className="text-3xl font-black text-purple-600">24/7</div>
                                    <div className="text-xs text-slate-600 font-medium">Support</div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                                Learn More About Us
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-white w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Target className="text-purple-600" size={24} />
                                    </div>
                                    <h2 className="text-3xl font-heading font-bold text-gray-900">Our Mission</h2>
                                </div>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To make transportation accessible, affordable, and reliable for everyone.
                                    We believe mobility is a fundamental right that should connect people to
                                    opportunities, not create barriers.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Globe className="text-purple-600" size={24} />
                                    </div>
                                    <h2 className="text-3xl font-heading font-bold text-gray-900">Our Vision</h2>
                                </div>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To become India's most trusted mobility platform, creating sustainable
                                    livelihoods for millions while building smarter, cleaner cities for
                                    future generations.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-indigo-50 blur-3xl rounded-full opacity-70 transform scale-90"></div>
                            <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { icon: Shield, title: "Safety First", desc: "24/7 support & tracking" },
                                        { icon: Heart, title: "Community", desc: "Supporting local drivers" },
                                        { icon: Zap, title: "Innovation", desc: "Cutting-edge technology" },
                                        { icon: Award, title: "Excellence", desc: "Premium service quality" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mx-auto">
                                                <item.icon className="text-purple-600" size={28} />
                                            </div>
                                            <h4 className="font-bold text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <section className="py-24 bg-gray-50 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Our Services</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose from our range of vehicles designed to meet every travel need
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Auto Service */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all group overflow-hidden">
                            <div className="text-center space-y-6">
                                <div className="h-40 flex items-center justify-center relative mb-4">
                                    <div className="absolute inset-0 bg-yellow-50 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={autoImg} alt="Auto" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Auto</h3>
                                    <p className="text-gray-600 mb-4">Quick and affordable rides for short distances</p>
                                </div>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">No bargaining, fixed rates</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Doorstep pickup</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Real-time tracking</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Eco-friendly option</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="text-2xl font-bold text-purple-600">₹8/km</div>
                                    <div className="text-sm text-gray-500">Starting fare</div>
                                </div>
                            </div>
                        </div>

                        {/* Car Service */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">

                            </div>
                            <div className="text-center space-y-6">
                                <div className="h-40 flex items-center justify-center relative mb-4">
                                    <div className="absolute inset-0 bg-purple-50 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={carImg} alt="Car" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Car</h3>
                                    <p className="text-gray-600 mb-4">Comfortable AC rides for city travel</p>
                                </div>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Air-conditioned comfort</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">4-seater capacity</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Professional drivers</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Clean & sanitized</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="text-2xl font-bold text-purple-600">₹12/km</div>
                                    <div className="text-sm text-gray-500">Starting fare</div>
                                </div>
                            </div>
                        </div>

                        {/* Truck Service (Replaces Premium Car) */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all group overflow-hidden">
                            <div className="text-center space-y-6">
                                <div className="h-40 flex items-center justify-center relative mb-4">
                                    <div className="absolute inset-0 bg-blue-50 rounded-full blur-2xl opacity-60 scale-75 group-hover:scale-100 transition-all"></div>
                                    <img src={truckImg} alt="Truck" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Truck</h3>
                                    <p className="text-gray-600 mb-4">Reliable goods transport & logistics</p>
                                </div>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Heavy load capacity</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Safe goods transport</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Verified partners</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-purple-600" size={16} />
                                        <span className="text-sm text-gray-600">Inter-city options</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="text-2xl font-bold text-purple-600">₹25/km</div>
                                    <div className="text-sm text-gray-500">Starting fare</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Features */}
                    <div className="mt-16 grid md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Shield className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Safety First</h4>
                            <p className="text-sm text-gray-600">All drivers verified with background checks</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Zap className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Quick Booking</h4>
                            <p className="text-sm text-gray-600">Get a ride in under 3 minutes</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Target className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Live Tracking</h4>
                            <p className="text-sm text-gray-600">Track your ride in real-time</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Heart className="text-purple-600" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">24/7 Support</h4>
                            <p className="text-sm text-gray-600">Round-the-clock customer assistance</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "People First",
                                desc: "Every decision we make prioritizes the safety, comfort, and well-being of our riders and drivers."
                            },
                            {
                                icon: CheckCircle,
                                title: "Reliability",
                                desc: "We build trust through consistent, dependable service that our community can count on every day."
                            },
                            {
                                icon: Zap,
                                title: "Innovation",
                                desc: "We continuously evolve our technology and services to stay ahead of tomorrow's mobility needs."
                            },
                            {
                                icon: Heart,
                                title: "Community",
                                desc: "We're committed to creating positive impact in every city and neighborhood we serve."
                            },
                            {
                                icon: Shield,
                                title: "Integrity",
                                desc: "Transparency, honesty, and ethical practices form the foundation of our business."
                            },
                            {
                                icon: Globe,
                                title: "Sustainability",
                                desc: "Building a greener future through electric vehicles and environmentally conscious practices."
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all group text-center">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                                    <value.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-purple-600 to-purple-800 text-white w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-heading font-bold mb-6">Join Our Journey</h2>
                    <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                        Be part of India's transportation revolution. Whether you're a rider or driver,
                        we're building the future together.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">
                            Start Riding
                        </button>
                        <button className="px-8 py-4 bg-purple-700 text-white rounded-xl font-bold text-lg hover:bg-purple-800 transition-all border border-purple-500">
                            Become a Driver
                        </button>
                    </div>
                </div>
            </section>

            {/* App Download Section */}
            <section className="py-20 bg-gray-50">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Download our apps to get the best experience</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Experience seamless rides and drive opportunities with our mobile apps</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Customer App */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer">
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
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer">
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
                                <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
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

export default About;