
import React, { useState, useEffect } from 'react';
import { X, Cast, Tv, Loader2, Smartphone, Wifi } from 'lucide-react';

interface CastModalProps {
  onClose: () => void;
}

export const CastModal: React.FC<CastModalProps> = ({ onClose }) => {
  const [searching, setSearching] = useState(true);
  const [devices, setDevices] = useState<string[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);

  useEffect(() => {
    // Simulate searching
    const timer = setTimeout(() => {
      setDevices(['Living Room TV', 'Samsung 7 Series', 'Bedroom Chromecast', 'Office TV']);
      setSearching(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = (device: string) => {
    setConnectingTo(device);
    setTimeout(() => {
        setConnectingTo(null);
        setConnected(device);
        // Auto close after successful connection simulation
        setTimeout(onClose, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center pointer-events-none">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in" 
         onClick={onClose}
       />
       
       {/* Modal Content */}
       <div className="relative pointer-events-auto w-full sm:max-w-sm bg-[#1a1a1a] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-white/10">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#222]">
              <h3 className="text-white font-bold flex items-center gap-2">
                  <Cast className="w-4 h-4" />
                  Cast to device
              </h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
              </button>
          </div>

          <div className="p-2 min-h-[200px]">
             {connected ? (
                 <div className="flex flex-col items-center justify-center h-[200px] text-green-500 gap-3">
                     <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                         <Wifi className="w-8 h-8" />
                     </div>
                     <div className="text-center">
                         <p className="font-bold">Connected to</p>
                         <p className="text-white text-lg">{connected}</p>
                     </div>
                 </div>
             ) : (
                 <div className="flex flex-col gap-1">
                     {searching ? (
                         <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                             <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                             <p className="text-xs font-medium">Searching for devices...</p>
                         </div>
                     ) : (
                         devices.map((device, i) => (
                             <button 
                                key={i}
                                onClick={() => handleConnect(device)}
                                disabled={!!connectingTo}
                                className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors text-left group disabled:opacity-50"
                             >
                                 <div className="bg-[#333] p-2 rounded-full group-hover:bg-indigo-600 transition-colors">
                                     <Tv className="w-5 h-5 text-gray-300 group-hover:text-white" />
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-white font-medium text-sm">{device}</p>
                                     <p className="text-gray-500 text-xs">Available</p>
                                 </div>
                                 {connectingTo === device && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                             </button>
                         ))
                     )}
                     
                     {!searching && (
                         <div className="mt-2 pt-2 border-t border-white/5 px-2">
                             <button className="flex items-center gap-4 p-2 w-full text-left text-gray-400 hover:text-white">
                                <div className="p-2">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <span className="text-sm">Link with TV Code</span>
                             </button>
                         </div>
                     )}
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};
