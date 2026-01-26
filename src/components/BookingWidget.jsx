import React, { useState } from 'react';
import { Navigation, ArrowRight, User, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocationService } from '../hooks/useLocationService';
import autoImg from '../assets/auto1.jpg';
import carImg from '../assets/car1.jpg';
import truckImg from '../assets/truck1.jpg';

const BookingWidget = () => {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState('passenger'); // 'passenger' | 'goods'

    const {
        pickup, setPickup,
        drop, setDrop,
        detectLocation,
        pickupInputRef, dropInputRef,
        isLocating
    } = useLocationService();

    const handleContinue = () => {
        if (!pickup || !drop) return;
        navigate('/rides', {
            state: {
                pickup,
                drop,
                serviceType: selectedMode // Pass this to pre-filter the list
            }
        });
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl w-full md:max-w-[460px] mx-auto relative z-10 shadow-none md:shadow-2xl rounded-2xl md:rounded-3xl p-5 md:p-8 border border-white/50 md:border-white/50">

            <h2 className="text-2xl md:text-[28px] font-heading font-bold mb-6 text-gray-900 tracking-tight">
                Where to?
            </h2>

            {/* Inputs Section */}
            <div className="space-y-4 relative mb-8 md:mb-10">
                {/* Connecting Line */}
                <div className="absolute left-[23px] top-10 bottom-10 w-[2px] bg-gray-200 z-0"></div>

                {/* Pickup Input */}
                <div className="relative z-10">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-1">
                        <div className="w-3.5 h-3.5 rounded-full border-[3px] border-purple-600 bg-white shadow-sm"></div>
                    </div>
                    <input
                        ref={pickupInputRef}
                        type="text"
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full bg-gray-50 hover:bg-white focus:bg-white border-0 rounded-2xl py-4 pl-12 pr-12 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-base shadow-sm ring-1 ring-gray-100"
                    />
                    <button
                        onClick={detectLocation}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors ${isLocating ? 'animate-spin text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                        title="Use current location"
                    >
                        <Navigation size={18} fill={isLocating ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Drop Input */}
                <div className="relative z-10">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white p-1">
                        <div className="w-3.5 h-3.5 bg-purple-900 rounded-sm shadow-sm"></div>
                    </div>
                    <input
                        ref={dropInputRef}
                        type="text"
                        placeholder="Dropoff location"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        className="w-full bg-gray-50 hover:bg-white focus:bg-white border-0 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-base shadow-sm ring-1 ring-gray-100"
                    />
                </div>
            </div>

            {/* What do you need? */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">What do you need?</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-20 md:mb-8">
                {/* Passenger Ride Card */}
                <div
                    onClick={() => setSelectedMode('passenger')}
                    className={`relative cursor-pointer rounded-2xl p-3 md:p-4 transition-all duration-300 border-2 overflow-hidden group
                        ${selectedMode === 'passenger'
                            ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600/20 shadow-lg shadow-purple-900/5'
                            : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                    <div className="flex items-center gap-2 mb-3 text-purple-900">
                        <User size={18} className="fill-purple-900/20 md:w-5 md:h-5" />
                        <span className="font-bold text-xs md:text-sm">Passenger</span>
                    </div>

                    <div className="h-20 md:h-24 relative flex items-center justify-center -mx-2">
                        {/* Overlapping vehicles for dynamic effect */}
                        <img src={autoImg} alt="Auto" className="w-14 md:w-16 object-contain z-10 relative left-2 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500" />
                        <img src={carImg} alt="Car" className="w-20 md:w-24 object-contain z-0 relative -left-2 drop-shadow-md transform group-hover:scale-105 transition-transform duration-500 delay-75" />
                    </div>

                    <div className="text-center mt-2">
                        <span className={`text-xs md:text-sm font-bold ${selectedMode === 'passenger' ? 'text-purple-700' : 'text-gray-500'}`}>
                            Passenger
                        </span>
                    </div>
                </div>

                {/* Goods Transport Card */}
                <div
                    onClick={() => setSelectedMode('goods')}
                    className={`relative cursor-pointer rounded-2xl p-3 md:p-4 transition-all duration-300 border-2 overflow-hidden group
                        ${selectedMode === 'goods'
                            ? 'border-purple-600 bg-purple-50/30 ring-1 ring-purple-600/20 shadow-lg shadow-purple-900/5'
                            : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                    <div className="flex items-center gap-2 mb-3 text-amber-800">
                        <Package size={18} className="fill-amber-800/20 md:w-5 md:h-5" />
                        <span className="font-bold text-xs md:text-sm">Goods</span>
                    </div>

                    <div className="h-20 md:h-24 flex items-center justify-center">
                        <img src={truckImg} alt="Truck" className="w-24 md:w-28 object-contain drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div className="text-center mt-2">
                        <span className={`text-xs md:text-sm font-bold ${selectedMode === 'goods' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Goods
                        </span>
                    </div>
                </div>
            </div>

            {/* CTA Button - Sticky on Mobile */}
            <div className="fixed md:static left-4 right-4 bottom-4 z-50 md:z-auto">
                <button
                    onClick={handleContinue}
                    className={`w-full py-4 rounded-xl text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-3 border md:border-0
                        ${pickup && drop
                            ? 'bg-black text-white hover:bg-gray-900 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 shadow-purple-900/20'
                            : 'bg-white md:bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'}`}
                    disabled={!pickup || !drop}
                >
                    See prices
                    <ArrowRight size={20} className={pickup && drop ? "text-purple-400" : ""} />
                </button>
            </div>
        </div>
    );
};

export default BookingWidget;
