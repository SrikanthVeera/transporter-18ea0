import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocationService } from '../hooks/useLocationService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Truck, Clock, MapPin, Star, ArrowRight, Shield, Info, ChevronLeft, Navigation, User, Package } from 'lucide-react';
import { signInWithPhoneNumber } from "firebase/auth";
import { auth, initRecaptcha } from "../services/firebase";


import { calculateDistanceAndPrice } from '../utils/helpers';
import { verifyOtp as apiVerifyOtp } from '../services/api';
import { GoogleMap, DirectionsRenderer, MarkerF } from '@react-google-maps/api';

import autoImg from '../assets/auto1.jpg';
import carImg from '../assets/car1.jpg';
import truckImg from '../assets/truck1.jpg';
import customerAppImg from '../assets/playstorecustomer.png';
import driverAppImg from '../assets/playstoredriver.png';


const RideCard = ({ ride, selected, onSelect }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(ride.id)}
        className={`relative p-4 mb-3 rounded-2xl cursor-pointer border-2 transition-all duration-300 flex items-center gap-4 group overflow-hidden
            ${selected
                ? 'border-gray-900 bg-white shadow-xl z-10 ring-1 ring-gray-900/5'
                : 'border-transparent bg-white hover:bg-gray-50 hover:shadow-lg shadow-sm'
            }`}
    >
        {/* Selected Accent Background */}
        {selected && (
            <motion.div
                layoutId="selected-bg"
                className="absolute inset-0 bg-gray-50 -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}

        {/* Vehicle Image */}
        <div className={`relative w-16 h-16 shrink-0 rounded-xl flex items-center justify-center transition-colors
            ${selected ? 'bg-white shadow-sm' : 'bg-gray-50 group-hover:bg-white'}`}>
            {ride.image ? (
                <img src={ride.image} alt={ride.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
            ) : (
                <ride.icon size={32} className="text-gray-700" />
            )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight tracking-tight">{ride.name}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">{ride.description}</p>
                </div>
                <div className="text-right">
                    <span className="block font-extrabold text-xl text-gray-900 tracking-tight">
                        {ride.price ? `₹${ride.price}` : <span className="text-gray-300">--</span>}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-2.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border
                    ${selected ? 'bg-black text-white border-black' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    <Clock size={10} className={selected ? "text-white" : "text-green-600"} /> {ride.duration ? `${ride.duration} MIN` : '--'}
                </span>

                {ride.distance && (
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Navigation size={10} /> {ride.distance} km
                    </span>
                )}
            </div>
        </div>

        {/* Selection Checkmark */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300
            ${selected ? 'border-gray-900 bg-gray-900' : 'border-gray-200 bg-transparent'}`}>
            {selected && <div className="w-2.5 h-1.5 border-b-2 border-l-2 border-white -rotate-45 mb-0.5"></div>}
        </div>
    </motion.div>
);

const RideSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedRide, setSelectedRide] = useState(null);
    const [fareDetails, setFareDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serviceType, setServiceType] = useState(location.state?.serviceType || 'passenger'); // 'passenger' | 'goods'

    // OTP Flow States


    const [showLoginModal, setShowLoginModal] = useState(false);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        // Init Recaptcha on mount (container is now always present)
        try {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.warn("Recaptcha clear error:", e);
                }
                window.recaptchaVerifier = null;
            }
            initRecaptcha();
        } catch (error) {
            console.error("Failed to initialize recaptcha:", error);
        }

        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    // ignore
                }
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Initialize Location Service with fallback/default values
    const {
        pickup, setPickup,
        drop, setDrop,
        pickupCoords,
        dropCoords,
        isLocating, detectLocation,
        pickupInputRef, dropInputRef
    } = useLocationService(
        location.state?.pickup || "", // No auto-detect text
        location.state?.drop || ""
    );

    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [nearbyDrivers, setNearbyDrivers] = useState([]);

    // Generate random nearby drivers when route or ride type changes
    useEffect(() => {
        if (!directionsResponse?.routes[0]?.legs[0]?.start_location || !selectedRide) {
            setNearbyDrivers([]);
            return;
        }

        const startLoc = directionsResponse.routes[0].legs[0].start_location;
        const driverCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 drivers
        const newDrivers = [];

        for (let i = 0; i < driverCount; i++) {
            // Random offset within ~500m (0.005 deg is roughly 500m)
            const latOffset = (Math.random() - 0.5) * 0.006;
            const lngOffset = (Math.random() - 0.5) * 0.006;

            newDrivers.push({
                id: i,
                position: {
                    lat: startLoc.lat() + latOffset,
                    lng: startLoc.lng() + lngOffset
                },
                heading: Math.random() * 360 // For future rotation if needed
            });
        }
        setNearbyDrivers(newDrivers);
    }, [directionsResponse, selectedRide]);

    // Auto-detect removed as per requirement - explicit user action only for direct visits

    // 2. Fetch Ride Details Logic
    // 2. Fetch Ride Details Logic (Client-Side Estimator)
    useEffect(() => {
        const fetchDetails = async () => {
            if (!pickup || !drop || !window.google) return;

            setLoading(true);
            try {
                // Use Google Maps Directions Service for accurate distance/time
                const directionsService = new window.google.maps.DirectionsService();

                directionsService.route(
                    {
                        origin: pickup,
                        destination: drop,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === window.google.maps.DirectionsStatus.OK) {
                            setDirectionsResponse(result); // Store for Map Renderer
                            const route = result.routes[0].legs[0];
                            const distanceInMeters = route.distance.value;
                            const durationInSeconds = route.duration.value;

                            const distanceKM = (distanceInMeters / 1000).toFixed(1);
                            const durationMins = Math.ceil(durationInSeconds / 60);

                            // Pricing Logic (India - Uber/Ola style)
                            // AUTO: Base ₹40 + (Dist * ₹16) + (Time * ₹1.5). Min ₹60.
                            const priceAutoRaw = 40 + (parseFloat(distanceKM) * 16) + (durationMins * 1.5);
                            const priceAuto = Math.max(60, Math.round(priceAutoRaw));

                            // CAR: Base ₹60 + (Dist * ₹22) + (Time * ₹2.5). Min ₹100.
                            const priceCarRaw = 60 + (parseFloat(distanceKM) * 22) + (durationMins * 2.5);
                            const priceCar = Math.max(100, Math.round(priceCarRaw));

                            setFareDetails({
                                distanceKM,
                                durationMins, // Store duration for display
                                priceAuto,
                                priceCar
                            });
                        } else {
                            console.error(`Directions request failed due to ${status}`);
                            // Keep default/fallback or show error
                        }
                        setLoading(false);
                    }
                );
            } catch (err) {
                console.error("Failed to calculate ride details", err);
                setLoading(false);
            }
        };

        // Debounce the call to avoid hitting API on every keystroke if it was just text
        // But since we use autocomplete, usually pickup/drop are full addresses.
        // A small timeout helps avoid rapid updates.
        const timerId = setTimeout(() => {
            if (pickup && drop) {
                fetchDetails();
            }
        }, 1000);

        return () => clearTimeout(timerId);
    }, [pickup, drop]);

    const handleContinue = () => {
        if (selectedRide) {
            setShowLoginModal(true);
        }
    };

    const handleSendOtp = async () => {
        if (!mobile || mobile.length !== 10) {
            setLoginError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);
        setLoginError("");

        try {
            // --- SIMULATION MODE ---
            // Real SMS is blocked by Google on localhost ('invalid-app-credential').
            // We simulate the exact experience so you can proceed.
            const formattedMobile = `+91${mobile}`;
            console.log(`Simulating SMS to ${formattedMobile}...`);

            // 1. Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Mock the Firebase Confirmation Result
            const mockConfirmationResult = {
                confirm: async (otpCode) => {
                    // Simulate verification delay
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Accept logical OTPs for testing
                    if (otpCode.length === 6) {
                        return {
                            user: {
                                uid: "user-" + mobile,
                                phoneNumber: formattedMobile,
                                getIdToken: async () => "mock-token-" + Date.now()
                            }
                        };
                    } else {
                        throw new Error("Invalid OTP");
                    }
                }
            };

            setConfirmationResult(mockConfirmationResult);
            window.confirmationResult = mockConfirmationResult;
            setIsOtpSent(true);
            console.log("OTP Sent Successfully (Simulated)");

        } catch (error) {
            console.error(error);
            setLoginError("Network Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            if (!confirmationResult) throw new Error("Please request OTP again");

            // 1. Verify with Firebase
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // Backend unavailable? Simulate success for demo
            console.log("Firebase Verified, simulating backend success");

            setShowLoginModal(false);
            localStorage.setItem('token', "mock-token-for-demo");
            localStorage.setItem('user', JSON.stringify({ uid: user.uid, phone: user.phoneNumber }));

            // Redirect logic
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android/i.test(userAgent)) {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.customer";
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                window.location.href = "https://apps.apple.com/in/app/transporter-customer/id6755738681";
            } else {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.customer";
            }

            // const idToken = await user.getIdToken();
            // const response = await apiVerifyOtp(`+91${mobile}`, idToken);
            // if (response.data.success) { ... }

        } catch (error) {
            console.error(error);
            setLoginError('Invalid OTP or Network Error.');
        } finally {
            setLoading(false);
        }
    };

    const vehicles = [
        {
            id: 'auto',
            name: 'Auto',
            icon: Truck,
            image: autoImg,
            price: fareDetails?.priceAuto,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins, // Add duration here
            description: 'No bargaining, doorstep pickup'
        },
        {
            id: 'car',
            name: 'Car',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceCar,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins, // Add duration here
            description: 'Comfy, AC ride for you'
        },
        {
            id: 'truck',
            name: 'Truck',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceCar ? Math.round(fareDetails.priceCar * 1.5) : null, // Mock price for truck
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins ? fareDetails.durationMins + 10 : null, // Slower duration
            description: 'For moving goods and heavy loads'
        }
    ];

    const filteredVehicles = vehicles.filter(v => {
        if (serviceType === 'passenger') return ['auto', 'car'].includes(v.id);
        if (serviceType === 'goods') return ['truck'].includes(v.id);
        return false;
    });

    return (
        <div className="min-h-screen w-full bg-gray-100 font-sans">
            <Navbar />

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(50%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                }
            `}</style>

            {/* Mobile Layout: Full Page Fixed Container */}
            <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-0 bg-gray-100 flex flex-col isolate overflow-hidden">

                {/* 1. Map Section (Fixed Top) */}
                <div className="h-[42%] w-full relative shrink-0 z-0">
                    {window.google && (
                        <GoogleMap
                            center={{ lat: 28.6139, lng: 77.2090 }}
                            zoom={12}
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            options={{
                                zoomControl: false,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: false,
                                disableDefaultUI: true,
                                clickableIcons: false,
                            }}
                        >
                            {directionsResponse && (
                                <>
                                    <DirectionsRenderer
                                        directions={directionsResponse}
                                        options={{
                                            polylineOptions: {
                                                strokeColor: '#7C3AED',
                                                strokeWeight: 5,
                                                strokeOpacity: 0.9,
                                            },
                                            suppressMarkers: true,
                                            // preserveViewport: true, 
                                        }}
                                    />
                                    {
                                        directionsResponse.routes[0]?.legs[0] && (
                                            <>
                                                <MarkerF
                                                    position={directionsResponse.routes[0].legs[0].start_location}
                                                    icon={{
                                                        path: window.google.maps.SymbolPath.CIRCLE,
                                                        scale: 7,
                                                        fillColor: "#10B981",
                                                        fillOpacity: 1,
                                                        strokeColor: "white",
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                                <MarkerF
                                                    position={directionsResponse.routes[0].legs[0].end_location}
                                                    icon={{
                                                        path: window.google.maps.SymbolPath.CIRCLE,
                                                        scale: 7,
                                                        fillColor: "#EF4444",
                                                        fillOpacity: 1,
                                                        strokeColor: "white",
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                            </>
                                        )
                                    }

                                    {/* Nearby Drivers Simulation */}
                                    {nearbyDrivers.map((driver) => (
                                        <MarkerF
                                            key={driver.id}
                                            position={driver.position}
                                            icon={{
                                                url: selectedRide === 'auto'
                                                    ? 'https://cdn-icons-png.flaticon.com/512/75/75780.png' // Top-down Car/Auto fallback
                                                    : 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Top-down Car
                                                scaledSize: new window.google.maps.Size(32, 32),
                                                anchor: new window.google.maps.Point(16, 16),
                                            }}
                                            options={{
                                                zIndex: 10,
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </GoogleMap>
                    )}



                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg z-10 active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={22} className="text-gray-900" />
                    </button>
                </div>

                {/* 2. Bottom Sheet (Flex Grow - Scrollable) */}
                <div className="flex-1 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] relative z-10 -mt-6 flex flex-col overflow-hidden">

                    {/* Visual Drag Handle */}
                    <div className="w-full flex justify-center pt-3 pb-2 bg-white shrink-0 z-20" onClick={() => { }}>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Scrollable Container */}
                    <div className="flex-1 overflow-y-auto overscroll-y-contain px-5 pb-32 scroll-smooth">

                        {/* Inputs Section */}
                        <div className="py-2 mb-2">
                            <div className="space-y-4 relative">
                                <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-gray-100"></div>

                                {/* Pickup */}
                                <div className="relative group z-30">
                                    <div className="absolute left-3 top-3.5 text-purple-600">
                                        <div className="w-3 h-3 rounded-full bg-purple-600 border-[3px] border-white shadow-sm ring-1 ring-gray-100"></div>
                                    </div>
                                    <input
                                        ref={pickupInputRef}
                                        type="text"
                                        placeholder="Current Location"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500 rounded-xl py-2.5 pl-10 pr-12 text-gray-900 font-medium placeholder-gray-400 text-sm"
                                    />
                                    {/* Locate Button inside input */}
                                    <button
                                        onClick={detectLocation}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 active:scale-90 transition-all rounded-full hover:bg-gray-100"
                                        title="Use current location"
                                    >
                                        <Navigation size={18} fill={isLocating ? "#7C3AED" : "none"} className={isLocating ? "text-purple-600 animate-spin" : ""} />
                                    </button>
                                </div>

                                {/* Drop */}
                                <div className="relative group z-20">
                                    <div className="absolute left-3 top-3.5 text-black">
                                        <div className="w-3 h-3 bg-black rotate-45 border-[2px] border-white shadow-sm ring-1 ring-gray-100"></div>
                                    </div>
                                    <input
                                        ref={dropInputRef}
                                        type="text"
                                        placeholder="Enter Destination"
                                        value={drop}
                                        onChange={(e) => setDrop(e.target.value)}
                                        className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-black rounded-xl py-2.5 pl-10 pr-4 text-gray-900 font-medium placeholder-gray-400 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Promo Ticker */}
                        <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 text-purple-900 text-xs font-bold py-2.5 px-3 rounded-lg mb-4 flex items-center gap-2 shadow-sm">
                            <span className="animate-pulse">⚡</span>
                            <span className="truncate">50% off | Heavy traffic reported</span>
                        </div>

                        {/* Service Selection (Mobile) */}
                        <div className="mb-6 px-1">
                            <h3 className="text-gray-900 font-bold text-base mb-3">What do you need?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className={`relative p-2.5 rounded-xl border-2 flex flex-row items-center justify-center gap-2 transition-all duration-200
                                        ${serviceType === 'passenger'
                                            ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]'
                                            : 'border-transparents bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <User size={18} />
                                    <span className="text-sm font-bold">Ride</span>
                                    {serviceType === 'passenger' && <div className="absolute -bottom-1 w-8 h-1 bg-white/20 rounded-full"></div>}
                                </button>
                                <button
                                    onClick={() => { setServiceType('goods'); setSelectedRide(null); }}
                                    className={`relative p-2.5 rounded-xl border-2 flex flex-row items-center justify-center gap-2 transition-all duration-200
                                        ${serviceType === 'goods'
                                            ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]'
                                            : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <Package size={18} />
                                    <span className="text-sm font-bold">Package</span>
                                    {serviceType === 'goods' && <div className="absolute -bottom-1 w-8 h-1 bg-white/20 rounded-full"></div>}
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-3 px-1">
                            {serviceType === 'passenger' ? 'Available Rides' : 'Transport Options'}
                        </h3>

                        {/* Ride Options List */}
                        <div className="space-y-1 px-1">
                            <AnimatePresence mode='popLayout'>
                                {filteredVehicles.map((ride) => (
                                    <RideCard
                                        key={ride.id}
                                        ride={ride}
                                        selected={selectedRide === ride.id}
                                        onSelect={setSelectedRide}
                                    />
                                ))}
                            </AnimatePresence>


                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed Bottom Button (Inside Sheet - Flex Child) */}
                    <div className="shrink-0 p-4 bg-white border-t border-gray-100 z-30 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center mb-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-900 border border-gray-200 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Cash
                            </button>
                        </div>
                        <button
                            disabled={!selectedRide}
                            onClick={handleContinue}
                            className={`w-full py-3 rounded-xl text-base font-bold shadow-xl transition-all flex items-center justify-center gap-2
                                ${selectedRide
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98] shadow-purple-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {selectedRide ? `Book ${vehicles.find(v => v.id === selectedRide)?.name}` : 'Select Ride'}
                            {selectedRide && <ArrowRight size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex h-screen pt-16">
                {/* Left Side - Ride Selection Box */}
                <div className="w-full lg:w-[500px] p-4 bg-gray-100">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
                        {/* NEWS TICKER / HEADLINE */}
                        <div className="bg-purple-600 text-white text-xs font-bold py-2 overflow-hidden whitespace-nowrap">
                            <div className="animate-marquee inline-block">
                                ⚡ 50% OFF on your first Auto ride! &nbsp;&bull;&nbsp; 🌧️ Heavy traffic reported in Cyber Hub &nbsp;&bull;&nbsp; 🛡️ All drivers are vaccinated & verified &nbsp;&bull;&nbsp; 🚕 Premium Sedans now available in your area &nbsp;&bull;&nbsp;
                            </div>
                        </div>

                        {/* Location Inputs (Home Page Style) */}
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="space-y-4 relative">
                                {/* Connector Line */}
                                <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-gray-200"></div>

                                {/* Pickup Input */}
                                <div className="relative group z-30">
                                    <div className="absolute left-3 top-3.5 text-purple-600">
                                        <div className="w-3 h-3 rounded-full bg-purple-600 border-2 border-white shadow-sm"></div>
                                    </div>
                                    <input
                                        ref={pickupInputRef}
                                        type="text"
                                        placeholder="Current Location"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:border-purple-500 rounded-xl py-3 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-body"
                                    />
                                    <button
                                        onClick={detectLocation}
                                        className={`absolute right-3 top-3 p-1 hover:bg-gray-200 rounded-full transition-colors ${isLocating ? 'animate-spin text-purple-600' : 'text-gray-500'}`}
                                        title="Use Current Location"
                                    >
                                        <Navigation size={14} fill={isLocating ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Drop Input */}
                                <div className="relative group z-20">
                                    <div className="absolute left-3 top-3.5 text-black">
                                        <div className="w-3 h-3 bg-black/80 rotate-45 border-2 border-white shadow-sm"></div>
                                    </div>
                                    <input
                                        ref={dropInputRef}
                                        type="text"
                                        placeholder="Enter Destination"
                                        value={drop}
                                        onChange={(e) => setDrop(e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:border-black rounded-xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-body"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ride List - Scrollable */}
                        <div className="flex-1 p-4 bg-gray-50/50 overflow-y-auto">

                            {/* Service Selection (Desktop) */}
                            <div className="mb-6">
                                <h3 className="text-gray-900 font-bold text-base mb-3">What do you need?</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setServiceType('passenger'); setSelectedRide(null); }}
                                        className={`relative p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-200
                                            ${serviceType === 'passenger'
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]'
                                                : 'border-transparents bg-white text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <User size={20} />
                                        <span className="text-sm font-bold">Passenger</span>
                                    </button>
                                    <button
                                        onClick={() => { setServiceType('goods'); setSelectedRide(null); }}
                                        className={`relative p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-200
                                            ${serviceType === 'goods'
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-[1.02]'
                                                : 'border-transparent bg-white text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Package size={20} />
                                        <span className="text-sm font-bold">Sending Goods</span>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {serviceType === 'passenger' ? 'Available Rides' : 'Transport Options'}
                            </h3>

                            <div className="space-y-1">
                                <AnimatePresence mode='popLayout'>
                                    {filteredVehicles.map((ride) => (
                                        <RideCard
                                            key={ride.id}
                                            ride={ride}
                                            selected={selectedRide === ride.id}
                                            onSelect={setSelectedRide}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>


                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100 flex gap-3">
                                <Info size={16} className="text-purple-600 shrink-0" />
                                <p className="text-xs text-purple-700 leading-relaxed">
                                    Prices may vary due to high demand. Book now to lock in this fare.
                                </p>
                            </div>
                        </div>

                        {/* Bottom Action Area - Desktop */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 cursor-pointer group" onClick={handleContinue}>
                                    <div className="p-1.5 bg-gray-100 rounded-md group-hover:bg-gray-200 transition-colors">
                                        <span className="font-bold text-sm">Cash</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!selectedRide}
                                onClick={handleContinue}
                                className={`w-full py-3 rounded-lg text-base font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                    ${selectedRide
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 transform active:scale-[0.98]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {selectedRide ? `Book ${vehicles.find(v => v.id === selectedRide)?.name}` : 'Select a ride'}
                                {selectedRide && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Live Map */}
                <div className="flex-1 relative bg-gray-200">
                    {/* Live Map Container */}
                    <div className="absolute inset-0">
                        {window.google && (
                            <GoogleMap
                                center={{ lat: 28.6139, lng: 77.2090 }} // Default center (Delhi) or dynamic
                                zoom={12}
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                options={{
                                    zoomControl: false,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    fullscreenControl: false,
                                }}
                            >
                                {directionsResponse && (
                                    <>
                                        <DirectionsRenderer
                                            directions={directionsResponse}
                                            options={{
                                                polylineOptions: {
                                                    strokeColor: '#7C3AED', // Purple
                                                    strokeWeight: 6,
                                                    strokeOpacity: 0.8,
                                                },
                                                suppressMarkers: true, // Hide default A/B markers
                                            }}
                                        />

                                        {/* Custom Markers based on Route content */}
                                        {directionsResponse.routes[0]?.legs[0] && (
                                            <>
                                                {/* Start Marker (Green) */}
                                                <MarkerF
                                                    position={directionsResponse.routes[0].legs[0].start_location}
                                                    icon={{
                                                        path: window.google.maps.SymbolPath.CIRCLE,
                                                        scale: 6,
                                                        fillColor: "#10B981", // Green
                                                        fillOpacity: 1,
                                                        strokeColor: "white",
                                                        strokeWeight: 2,
                                                    }}
                                                />

                                                {/* End Marker (Red) */}
                                                <MarkerF
                                                    position={directionsResponse.routes[0].legs[0].end_location}
                                                    icon={{
                                                        path: window.google.maps.SymbolPath.CIRCLE,
                                                        scale: 6,
                                                        fillColor: "#EF4444", // Red
                                                        fillOpacity: 1,
                                                        strokeColor: "white",
                                                        strokeWeight: 2,
                                                    }}
                                                />
                                            </>
                                        )}

                                        {/* Nearby Drivers Simulation (Desktop) */}
                                        {nearbyDrivers.map((driver) => (
                                            <MarkerF
                                                key={driver.id}
                                                position={driver.position}
                                                icon={{
                                                    url: selectedRide === 'auto'
                                                        ? 'https://cdn-icons-png.flaticon.com/512/75/75780.png' // Top-down Car/Auto fallback
                                                        : 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Top-down Car
                                                    scaledSize: new window.google.maps.Size(32, 32),
                                                    anchor: new window.google.maps.Point(16, 16),
                                                }}
                                                options={{
                                                    zIndex: 10,
                                                }}
                                            />
                                        ))}
                                    </>
                                )}
                            </GoogleMap>
                        )}
                    </div>

                    {/* Distance & Time Info */}
                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-3 rounded-xl shadow-lg">
                        <div className="text-xs text-gray-500 font-medium">Estimated</div>
                        <div className="text-lg font-bold text-gray-900">{fareDetails?.distanceKM || '24.5'} km</div>
                        <div className="text-sm text-gray-600">~{fareDetails?.durationMins || '35'} mins</div>
                    </div>
                </div>
            </div>

            {/* App Download Section (Desktop Only) */}
            <section className="hidden lg:block py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Download our apps for the best experience</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Get seamless rides and drive opportunities with our mobile apps</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Customer App */}
                        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                    <img src={customerAppImg} alt="Transporter Customer App" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-purple-600 group-hover:translate-x-2 transition-transform">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Transporter</h3>
                            <p className="text-gray-600 text-sm mb-6">Book rides, track your journey, and enjoy seamless transportation</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Google Play
                                </button>
                            </div>
                        </div>

                        {/* Driver App */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                                    <img src={driverAppImg} alt="Transporter Driver App" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-purple-600 group-hover:translate-x-2 transition-transform">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Transporter Driver</h3>
                            <p className="text-gray-600 text-sm mb-6">Register as a driver, accept rides, and start earning with flexible hours</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    App Store
                                </button>
                                <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    Google Play
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer for Desktop */}
            <div className="hidden lg:block">
                <Footer />
            </div>

            {/* Always-present Recaptcha Container */}
            <div id="recaptcha-container"></div>

            {/* Login / OTP Modal */}
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
                                    {isOtpSent ? 'Enter Verification Code' : 'Find your account'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {isOtpSent ? `Sent to +91 ${mobile}` : 'Enter your mobile number to proceed.'}
                                </p>
                            </div>

                            <div className="space-y-5">
                                {!isOtpSent ? (
                                    <div>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-300 pr-3">
                                                <span className="text-sm font-bold text-gray-700">IN</span>
                                                <span className="text-sm font-medium text-gray-500">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                maxLength="10"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-28 pr-4 py-3.5 text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                                                placeholder="00000 00000"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full text-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-2xl font-bold text-gray-900 tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                            placeholder="······"
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center mt-3 px-1">
                                            <button
                                                onClick={() => { setIsOtpSent(false); setOtp(''); setLoginError(''); }}
                                                className="text-xs text-gray-500 hover:text-purple-600 font-medium"
                                            >
                                                Change Number
                                            </button>
                                            <button className="text-xs text-gray-500 hover:text-purple-600 font-medium">
                                                Resend Code
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {loginError && (
                                    <p className="text-red-600 text-xs font-medium bg-red-50 p-2 rounded flex items-center gap-2">
                                        <Info size={14} /> {loginError}
                                    </p>
                                )}

                                <button
                                    onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
                                    className="w-full bg-purple-600 text-white rounded-lg py-3.5 font-bold text-base shadow-lg hover:bg-purple-700 transform transition-all active:scale-[0.98]"
                                >
                                    {isOtpSent ? 'Verify' : 'Continue'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RideSelection;