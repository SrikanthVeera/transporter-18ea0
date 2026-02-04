import React from 'react';
import BookingWidget from './BookingWidget';
import { ShieldCheck, Zap } from 'lucide-react';

import HeroBg from '../assets/main1.jpg';

const Hero = () => {
    return (
        <div className="relative min-h-screen w-full flex flex-col md:flex-row items-start md:items-center md:pt-20 pb-0 md:pb-20 overflow-x-hidden bg-gray-50 md:bg-transparent">

            {/* --- DESKTOP BACKGROUND (Hidden on Mobile) --- */}
            <div className="hidden md:absolute md:inset-0 md:z-0 md:block">
                <img
                    src={HeroBg}
                    alt="Background"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* --- MOBILE HEADER (Title) --- */}
            <div className="md:hidden pt-28 pb-4 w-full text-center z-20 px-4">
                <h1 className="text-4xl font-black font-heading text-slate-900 tracking-widest uppercase">
                    TRANSPORTER
                </h1>
                <p className="text-slate-500 text-sm font-bold tracking-wide mt-1">
                    Fast. Safe. Reliable.
                </p>
            </div>

            {/* --- DESKTOP TITLE (Original) --- */}
            <div className="hidden md:block absolute top-[12%] right-16 z-10 text-right">
                <h1 className="text-7xl font-black font-heading text-white tracking-widest uppercase layer-shadow">
                    TRANSPORTER
                </h1>
                <div className="flex items-center justify-end gap-3 mt-2 mr-1">
                    <p className="text-2xl font-bold text-white tracking-wide shadow-black/20 drop-shadow-md font-heading">
                        Fast. Safe. Reliable.
                    </p>
                    <span className="h-1.5 w-16 bg-yellow-400 border border-black/10"></span>
                </div>
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="w-full flex-grow flex flex-col md:flex-row justify-start items-start md:items-start relative z-10 max-w-7xl mx-auto md:px-6 lg:px-8 pt-2 md:pt-12">

                {/* Booking Widget Wrapper */}
                <div className="w-full md:max-w-md px-4 md:px-0 z-20">
                    <BookingWidget />
                </div>

                {/* --- MOBILE FOOTER IMAGE (Down & After Form) --- */}
                <div className="md:hidden w-full mt-auto pt-8 -mb-1">
                    <div className="relative w-full h-64">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent z-10 h-12"></div>
                        <img
                            src={HeroBg}
                            alt="Background"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
