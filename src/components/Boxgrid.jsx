import React, { useState, useEffect } from "react";

export default function Grid({
  count = 12,
  isSpinning = false,
  winners = [],
  prizeName = "HADIAH",
  isDesktop = true,       // Pastikan di parent diatur: window.innerWidth >= 1024 (Laptop ke atas)
  countdown = 0,
  participantPool = [],
  mode = "reguler"        // BARU: Menerima tipe event (super, grand, reguler)
}) {
  const [displayNames, setDisplayNames] = useState([]);

  // ==========================================
  // LOGIKA UKURAN DINAMIS BERDASARKAN MODE
  // ==========================================
  const getStyleByMode = () => {
    switch (mode) {
      case 'super':
        return {
          gap: "gap-6 sm:gap-8",
          // Super: Ukuran sangat besar (Hanya 1 Pemenang)
          cardSize: "w-80 sm:w-[500px] h-60 sm:h-[320px]", 
          numSize: "text-2xl sm:text-4xl",
          prizeSize: "text-base sm:text-xl",
          nameSize: "text-2xl sm:text-5xl",
        };
      case 'grand':
        return {
          gap: "gap-4 sm:gap-6",
          // Grand: Ukuran medium (Untuk 2 - 4 Pemenang)
          cardSize: "w-64 sm:w-80 h-48 sm:h-56", 
          numSize: "text-xl sm:text-2xl",
          prizeSize: "text-sm sm:text-base",
          nameSize: "text-xl sm:text-3xl",
        };
      default:
        // Reguler: Ukuran standar (Untuk batch banyak pemenang)
        return {
          gap: "gap-3 sm:gap-4", // Gap diperkecil agar tidak terlalu jauh
          cardSize: "w-48 sm:w-60 h-36 sm:h-44", 
          numSize: "text-base sm:text-lg",
          prizeSize: "text-xs sm:text-sm",
          nameSize: "text-sm sm:text-lg",
        };
    }
  };

  const style = getStyleByMode();

  // ==========================================
  // LOGIKA ANIMASI RNG
  // ==========================================
  useEffect(() => {
    let intervalId;

    if (isSpinning && isDesktop) {
      const pool = participantPool.length > 0 
        ? participantPool 
        : [{ nama_lengkap: "Mengacak..." }];

      intervalId = setInterval(() => {
        const randomNames = Array.from({ length: count }, () => {
          const randomIndex = Math.floor(Math.random() * pool.length);
          return pool[randomIndex].nama_lengkap; 
        });
        setDisplayNames(randomNames);
      }, 70); 
    } else {
      const currentDisplay = Array.from({ length: count }, (_, i) => {
        if (winners[i]) return `${winners[i].nama_lengkap} (${winners[i].id_divisi || ''})`;
        return "???";
      });
      setDisplayNames(currentDisplay);
    }

    return () => clearInterval(intervalId);
  }, [isSpinning, isDesktop, count, winners, participantPool]);

  // -------------------------------------------------------------
  // RENDER 1: MOBILE & TABLET SAAT SPINNING (Hitung Mundur)
  // -------------------------------------------------------------
  if (!isDesktop && isSpinning) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center my-auto min-h-[50vh]">
        <p className="text-xl sm:text-3xl text-kuning font-bold mb-4 uppercase tracking-widest animate-pulse">
          Mengacak Pemenang...
        </p>
        <div className="text-[120px] sm:text-[180px] font-black text-biru leading-none drop-shadow-xl animate-bounce">
          {countdown > 0 ? countdown : 1}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: GRID KARTU (Desktop / Mobile Result)
  // -------------------------------------------------------------
  return (
    <div className="w-full p-4">
      {/* Container Grid dengan Gap Dinamis */}
      <div className={`mx-auto flex flex-wrap justify-center w-full max-w-7xl pt-4 ${style.gap}`}>
        
        {Array.from({ length: count }).map((_, index) => {
          const slotNumber = String(index + 1).padStart(2, "0");
          const displayName = displayNames[index] || "???";
          const hasWinner = winners[index] && !isSpinning;

          return (
            <div
              key={index}
              className={`
                bg-white border border-gray-200 rounded-md shadow-md overflow-hidden transition-all duration-300
                ${style.cardSize} 
                ${hasWinner ? "ring-4 ring-kuning scale-105" : ""}
              `}
            >
              {/* Bagian Atas: Label & Nomor */}
              <div className="relative bg-gray-300 w-full h-[32%]">
                <div className="absolute top-[0.5px] left-[0.5px] z-10 bg-white w-[44%] h-[78%] [clip-path:polygon(0_0,91%_0,60%_100%,0%_100%)]" />
                
                <div className={`relative z-20 bg-blue-900 w-[39%] h-[66%] flex items-center pl-[6%] text-white font-black [clip-path:polygon(0_0,91%_0,60%_100%,0%_100%)] ${style.numSize}`}>
                  {slotNumber}
                </div>
                
                <div className={`absolute right-[8%] top-1/2 -translate-y-1/2 z-30 font-bold text-gray-600 truncate max-w-[50%] text-right ${style.prizeSize}`}>
                  {prizeName}
                </div>
              </div>

              {/* Bagian Bawah: Nama Pemenang / Animasi Roll */}
              <div className="h-[68%] flex justify-center items-center px-4 text-center">
                <span className={`
                  transition-all line-clamp-3 font-bold
                  ${style.nameSize}
                  ${isSpinning && isDesktop ? "text-blue-600 animate-pulse" : "text-gray-800"}
                  ${hasWinner ? "text-green-700 font-extrabold" : ""}
                `}>
                  {displayName}
                </span>
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}