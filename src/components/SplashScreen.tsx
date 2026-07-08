import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Receipt } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  appName?: string;
  appLogo?: string;
}

export default function SplashScreen({ 
  onComplete,
  appName = 'Hinov Factures',
  appLogo = '/logo.jpeg'
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600); // Small buffer for fade
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50">
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-20 h-20 bg-white border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden mb-6 shrink-0"
        >
          <img src={appLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </motion.div>

        {/* Animated Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl font-extrabold tracking-tight text-white mb-2"
        >
          {appName}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm font-medium text-slate-400 mb-12 uppercase tracking-widest"
        >
          Gestion Financière de Précision
        </motion.p>

        {/* Progress Bar Container */}
        <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden relative mb-4">
          <motion.div 
            className="bg-blue-500 h-full rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <span className="font-mono text-xs text-slate-500 font-semibold">
          Chargement de l'environnement... {progress}%
        </span>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-6 text-xs text-slate-600 font-medium font-mono">
        Hinove Group &copy; 2026
      </div>
    </div>
  );
}
