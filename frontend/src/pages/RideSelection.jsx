import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocationService } from '../hooks/useLocationService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Truck, Clock, MapPin, Star, ArrowRight, Shield, Info, ChevronLeft, Navigation, User, Package } from 'lucide-react';
import { auth, initRecaptcha, signInWithPhoneNumber } from "../services/firebase";


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
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelect(ride.id)}
        className={`relative p-4 mb-3 rounded-xl cursor-pointer border transition-all duration-200 flex items-center justify-between group bg-white
            ${selected
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
    >
        {/* Selected Accent Background */}
        {/* subtle background handled via container classes */}

        {/* Vehicle Image */}
        <div className="relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white">
            {ride.image ? (
                <img src={ride.image} alt={ride.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
            ) : (
                <ride.icon size={32} className="text-gray-700" />
            )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-3">
            <h3 className="font-bold text-gray-900 text-base leading-tight">{ride.name}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-1">{ride.description}</p>
        </div>

        {/* Price & meta */}
        <div className="text-right shrink-0">
            <span className="block font-bold text-sm text-gray-900">
                {ride.price ? `₹${ride.price}` : <span className="text-gray-300">--</span>}
            </span>
            {ride.distance && ride.duration && (
                <span className="block text-[11px] text-gray-400 mt-1">
                    {ride.distance} km · {ride.duration} min
                </span>
            )}
        </div>
    </motion.div>
);

const RideSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedRide, setSelectedRide] = useState(null);
    const [fareDetails, setFareDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serviceType, setServiceType] = useState(location.state?.serviceType || 'auto'); // 'auto' | 'car' | 'truck' | 'outstation'

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

    const mobileMapRef = useRef(null);
    const desktopMapRef = useRef(null);

    // Auto-fit map to route bounds when route loads or ride is selected
    useEffect(() => {
        if (directionsResponse?.routes?.[0]?.bounds) {
            const bounds = directionsResponse.routes[0].bounds;
            // Delay to ensure map/DOM is fully ready (adjusted for mobile)
            const timer = setTimeout(() => {
                if (mobileMapRef.current) {
                    mobileMapRef.current.fitBounds(bounds);
                }
                if (desktopMapRef.current) {
                    desktopMapRef.current.fitBounds(bounds);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedRide, directionsResponse]);

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

                const origin = pickupCoords || pickup;
                const destination = dropCoords || drop;

                directionsService.route(
                    {
                        origin: origin,
                        destination: destination,
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
                            // AUTO: Base ₹40 + (Dist * ₹16)
                            const priceAutoRaw = 40 + (parseFloat(distanceKM) * 16) + (durationMins * 1.5);
                            const priceAuto = Math.max(60, Math.round(priceAutoRaw));

                            // CAR (Mini): Base ₹50 + (Dist * ₹18)
                            const priceMiniRaw = 50 + (parseFloat(distanceKM) * 18) + (durationMins * 2.0);
                            const priceMini = Math.max(90, Math.round(priceMiniRaw));

                            // CAR (Sedan): Base ₹60 + (Dist * ₹22)
                            const priceSedanRaw = 60 + (parseFloat(distanceKM) * 22) + (durationMins * 2.5);
                            const priceSedan = Math.max(120, Math.round(priceSedanRaw));

                            // CAR (SUV): Base ₹80 + (Dist * ₹38)
                            const priceSUVRaw = 80 + (parseFloat(distanceKM) * 28) + (durationMins * 3.5);
                            const priceSUV = Math.max(180, Math.round(priceSUVRaw));

                            setFareDetails({
                                distanceKM,
                                durationMins, // Store duration for display
                                priceAuto,
                                priceMini,
                                priceSedan,
                                priceSUV
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
    }, [pickup, drop, pickupCoords, dropCoords]);

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
            const formattedMobile = `+91${mobile}`;

            // Handle reCAPTCHA (Skip strict check if on localhost to allow Test Numbers)
            const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

            if (!window.recaptchaVerifier) {
                try {
                    await initRecaptcha();
                } catch (e) {
                    // On localhost, we can proceed without recaptcha if using test numbers
                    // if (!isLocalhost) throw e; 
                    // console.warn("Localhost: Recaptcha init failed, proceeding with Test Number mode.");
                    throw e;
                }
            }

            const appVerifier = window.recaptchaVerifier;
            // For production, verifier is mandatory. For localhost, it can be null (Test Mode).
            if (!appVerifier) {
                throw new Error("reCAPTCHA verifier not available. Please refresh and try again.");
            }

            const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);

            setConfirmationResult(confirmation);
            window.confirmationResult = confirmation;
            setIsOtpSent(true);
            console.log("OTP sent via Firebase SMS");

        } catch (error) {
            console.error("Send OTP failed:", error);
            if (error.code === "auth/too-many-requests") {
                setLoginError("Too many attempts. Please try again later.");
            } else if (error.code === "auth/invalid-phone-number") {
                setLoginError("Invalid phone number format.");
            } else if (error.code === "auth/invalid-app-credential") {
                setLoginError("Config Error: Add 'localhost' to Authorized Domains in Firebase Console.");
            } else if (error.code === "auth/network-request-failed") {
                setLoginError("Network Error: Check your connection or Firebase API Key restrictions.");
            } else if (error.message && error.message.includes("reCAPTCHA")) {
                setLoginError("reCAPTCHA error. Please refresh and try again.");
            } else {
                setLoginError(error.message || "Failed to send OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            if (!confirmationResult) throw new Error("Please request OTP again");

            // 1. Verify with Firebase (real)
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            const idToken = await user.getIdToken();

            // 2. Verify with backend and get JWT
            const response = await apiVerifyOtp(mobile, idToken);

            if (!response.data?.success) {
                throw new Error(response.data?.error || "OTP verification failed");
            }

            setShowLoginModal(false);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect logic
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android/i.test(userAgent)) {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.customer";
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                window.location.href = "https://apps.apple.com/in/app/transporter-customer/id6755738681";
            } else {
                window.location.href = "https://play.google.com/store/apps/details?id=com.transporter.customer";
            }

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
            category: 'auto',
            name: 'Auto',
            icon: Truck,
            image: autoImg,
            price: fareDetails?.priceAuto,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'No bargaining, doorstep pickup',
            capacity: '3 people'
        },
        {
            id: 'cab_ac',
            category: 'car',
            name: 'Cab AC',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceMini ? Math.round(fareDetails.priceMini * 1.1) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'AC Cooling in Hot Weather',
            capacity: '4 people'
        },
        {
            id: 'mini',
            category: 'car',
            name: 'Mini Cab',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceMini,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Affordable & Compact',
            capacity: '4 people'
        },
        {
            id: 'sedan',
            category: 'car',
            name: 'Sedan premium',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceSedan,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Comfortable Sedan to commute',
            capacity: '4 people'
        },
        {
            id: 'suv',
            category: 'car',
            name: 'SUV',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceSUV,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'EXTRA for extraa...',
            capacity: '6-7 people'
        },
        // --- TRUCKS START ---
        {
            id: '3_wheeler_topless',
            category: 'truck',
            name: '3 - Wheeler Topless',
            icon: Truck,
            image: autoImg, // Using Auto image as it looks similar to 3-wheeler truck
            price: fareDetails?.priceAuto ? Math.round(fareDetails.priceAuto * 1.2) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 5.5ft x 4.5ft x 5ft',
            capacity: '500kgs'
        },
        {
            id: '3_wheeler_top',
            category: 'truck',
            name: '3 - wheeler with Top',
            icon: Truck,
            image: autoImg,
            price: fareDetails?.priceAuto ? Math.round(fareDetails.priceAuto * 1.3) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 5.5ft x 4.5ft x 5ft',
            capacity: '500kgs'
        },
        {
            id: 'tata_ace_top',
            category: 'truck',
            name: 'Tata Ace with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceMini ? Math.round(fareDetails.priceMini * 1.4) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 7ft x 4ft x 5ft',
            capacity: '750kgs'
        },
        {
            id: 'tata_ace_topless',
            category: 'truck',
            name: 'Tata Ace Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceMini ? Math.round(fareDetails.priceMini * 1.3) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 7ft x 4ft x 5ft',
            capacity: '750kgs'
        },
        {
            id: 'pick_8ft_top',
            category: 'truck',
            name: 'Pick 8ft with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.2) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 8ft x 4.5ft x 5.5ft',
            capacity: '1200kgs'
        },
        {
            id: 'pickup_8ft_topless',
            category: 'truck',
            name: 'Pickup 8ft Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.1) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 8ft x 4.5ft x 5.5ft',
            capacity: '1200kgs'
        },
        {
            id: 'pickup_9ft_topless',
            category: 'truck',
            name: 'Pickup 9ft Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.3) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 9.0ft x 5.5ft x 5.5ft',
            capacity: '1700kgs'
        },
        {
            id: 'pickup_9ft_top',
            category: 'truck',
            name: 'Pickup 9ft with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.4) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 9.0ft x 5.5ft x 5.5ft',
            capacity: '1700kgs'
        },
        {
            id: '407_truck_top',
            category: 'truck',
            name: '407 Truck with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.8) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 9ft x 5.5ft x 5ft',
            capacity: '2400kgs'
        },
        {
            id: '407_truck_topless',
            category: 'truck',
            name: '407 Truck Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.7) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 9ft x 5.5ft x 5ft',
            capacity: '2400kgs'
        },
        {
            id: '14ft_truck_topless',
            category: 'truck',
            name: '14ft Truck Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 2.2) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 14ft x 6ft x 6ft',
            capacity: '3500kgs'
        },
        {
            id: '14ft_truck_top',
            category: 'truck',
            name: '14ft Truck with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 2.3) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 14ft x 6ft x 6ft',
            capacity: '3500kgs'
        },
        {
            id: '17ft_truck_top',
            category: 'truck',
            name: '17ft Truck with Top',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 2.6) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 17ft x 6ft x 6ft',
            capacity: '4500kgs'
        },
        {
            id: '17ft_truck_topless',
            category: 'truck',
            name: '17ft Truck Topless',
            icon: Truck,
            image: truckImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 2.5) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Dimensions : 17ft x 6ft x 6ft',
            capacity: '4500kgs'
        },
        // --- TRUCKS END ---

        // --- OUTSTATION START ---
        {
            id: 'outstation_hatchback',
            category: 'outstation',
            name: 'Outstation Hatchback',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceMini ? Math.round(fareDetails.priceMini * 1.8) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Comfy AC Hatchbacks for small families',
            capacity: '4 people'
        },
        {
            id: 'outstation_sedan',
            category: 'outstation',
            name: 'Outstation Sedan',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceSedan ? Math.round(fareDetails.priceSedan * 1.8) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Spacious Sedans for long drives',
            capacity: '4 people'
        },
        {
            id: 'outstation_suv',
            category: 'outstation',
            name: 'Outstation SUV / 7 Seater',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 1.5) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Innova / Ertiga for big groups',
            capacity: '6-7 people'
        },
        {
            id: 'outstation_premium',
            category: 'outstation',
            name: 'Premium Luxury',
            icon: Car,
            image: carImg,
            price: fareDetails?.priceSUV ? Math.round(fareDetails.priceSUV * 2.5) : null,
            distance: fareDetails?.distanceKM,
            duration: fareDetails?.durationMins,
            description: 'Travel in Class (Merc, Audi, BMW)',
            capacity: '4 people'
        },

        // --- OUTSTATION END ---
    ];

    const filteredVehicles = vehicles.filter(v => v.category === serviceType);

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

            {/* Mobile Layout: Full Page Fixed Container (No Map) */}
            <div className="lg:hidden fixed top-24 left-0 right-0 bottom-0 z-0 bg-white flex flex-col isolate overflow-hidden">

                {/* Main Content Wrapper */}
                <div className="flex-1 flex flex-col overflow-hidden relative mt-4">

                    {/* Scrollable Container */}
                    <div className="flex-1 overflow-y-auto overscroll-y-contain px-5 pb-32 scroll-smooth pt-4">

                        {/* Inputs Section - card style like summary */}
                        <div className="py-2 mb-4">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-3 py-2">
                                <div className="space-y-3 relative">
                                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100"></div>

                                    {/* Pickup */}
                                    <div className="relative group z-30">
                                        <div className="absolute left-3 top-2.5 text-green-500">
                                            <div className="w-3 h-3 rounded-full bg-green-500 border-[3px] border-white shadow-sm ring-1 ring-gray-100"></div>
                                        </div>
                                        <input
                                            ref={pickupInputRef}
                                            type="text"
                                            placeholder="Current Location"
                                            value={pickup}
                                            onChange={(e) => setPickup(e.target.value)}
                                            className="w-full bg-transparent border-0 focus:ring-0 rounded-xl py-1.5 pl-8 pr-10 text-gray-900 font-medium placeholder-gray-400 text-sm"
                                        />
                                        {/* Locate Button inside input */}
                                        <button
                                            onClick={detectLocation}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 active:scale-90 transition-all rounded-full hover:bg-gray-100"
                                            title="Use current location"
                                        >
                                            <Navigation size={16} fill={isLocating ? "#7C3AED" : "none"} className={isLocating ? "text-purple-600 animate-spin" : ""} />
                                        </button>
                                    </div>

                                    {/* Divider line */}
                                    <div className="h-px bg-gray-100 mx-2"></div>

                                    {/* Drop */}
                                    <div className="relative group z-20">
                                        <div className="absolute left-3 top-2.5 text-red-500">
                                            <div className="w-3 h-3 bg-red-500 rotate-45 border-[2px] border-white shadow-sm ring-1 ring-gray-100"></div>
                                        </div>
                                        <input
                                            ref={dropInputRef}
                                            type="text"
                                            placeholder="Enter Destination"
                                            value={drop}
                                            onChange={(e) => setDrop(e.target.value)}
                                            className="w-full bg-transparent border-0 focus:ring-0 rounded-xl py-1.5 pl-8 pr-4 text-gray-900 font-medium placeholder-gray-400 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promo Removed */}

                        {/* Service Selection (Mobile) */}
                        <div className="mb-4 px-1">
                            <h3 className="text-gray-900 font-bold text-base mb-3">Select Vehicle Type</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'car', label: 'Car', img: carImg },
                                    { id: 'auto', label: 'Auto', img: autoImg },
                                    { id: 'truck', label: 'Truck', img: truckImg },
                                    { id: 'outstation', label: 'Stations', img: carImg },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => { setServiceType(type.id); setSelectedRide(null); }}
                                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all duration-200 h-full
                                            ${serviceType === type.id
                                                ? 'bg-purple-50 border-purple-600 shadow-md ring-1 ring-purple-600 z-10'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <div className="w-full h-8 flex items-center justify-center mb-1">
                                            <img src={type.img} alt={type.label} className="w-full h-full object-contain drop-shadow-sm" />
                                        </div>
                                        <span className={`text-[10px] font-bold tracking-wide ${serviceType === type.id ? 'text-purple-900' : 'text-gray-500'}`}>
                                            {type.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-3 px-1">
                            {serviceType === 'passenger' ? 'Available Rides' : 'Transport Options'}
                        </h3>

                        {/* Ride Options List */}
                        <div className="space-y-2 px-1">
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
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-md text-xs font-semibold text-gray-800 border border-gray-300 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Cash
                            </button>
                        </div>
                        <button
                            disabled={!selectedRide}
                            onClick={handleContinue}
                            className={`w-full py-3 rounded-xl text-base font-bold shadow-md transition-all flex items-center justify-center gap-2
                                ${selectedRide
                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500 active:scale-[0.98]'
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
                {/* Left Side - Ride Selection Box (60%) */}
                <div className="w-full lg:w-[40%] p-4 bg-gray-100 h-full">
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
                                <h3 className="text-gray-900 font-bold text-base mb-3">Select Vehicle Type</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'car', label: 'Car', img: carImg },
                                        { id: 'auto', label: 'Auto', img: autoImg },
                                        { id: 'truck', label: 'Truck', img: truckImg },
                                        { id: 'outstation', label: 'Outstation', img: carImg },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => { setServiceType(type.id); setSelectedRide(null); }}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all
                                                ${serviceType === type.id
                                                    ? 'bg-purple-50 border-purple-600 shadow-md transform scale-105'
                                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg'}`}
                                        >
                                            <div className="w-14 h-10 flex items-center justify-center">
                                                <img
                                                    src={type.img}
                                                    alt={type.label}
                                                    className="w-full h-full object-contain drop-shadow-sm"
                                                />
                                            </div>
                                            <span className={`text-xs font-bold ${serviceType === type.id ? 'text-purple-900' : 'text-gray-500'}`}>{type.label}</span>
                                        </button>
                                    ))}
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
                                onLoad={(map) => {
                                    desktopMapRef.current = map;
                                    if (directionsResponse?.routes?.[0]?.bounds) {
                                        map.fitBounds(directionsResponse.routes[0].bounds);
                                    }
                                }}
                                onUnmount={() => {
                                    desktopMapRef.current = null;
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
                                                // preserveViewport: true, // Removed to allow default centering
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
                                                    path: window.google.maps.SymbolPath.CIRCLE,
                                                    scale: 6,
                                                    fillColor: "#7C3AED", // Purple for vehicle
                                                    fillOpacity: 1,
                                                    strokeColor: "white",
                                                    strokeWeight: 2,
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
                                        {/* {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                                            <div className="mb-3 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 leading-snug">
                                                <strong>Dev Mode:</strong> Use a <a href="https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictitious-phone-numbers" target="_blank" rel="noreferrer" className="underline">Firebase Test Number</a> to bypass OTP.
                                            </div>
                                        )} */}
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