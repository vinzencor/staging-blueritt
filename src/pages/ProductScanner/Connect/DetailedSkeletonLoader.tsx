import React, { useState, useEffect, useCallback } from "react";

const DetailedSkeletonLoader = React.memo(({ isLoading }: { isLoading: boolean }) => {
  const [progress, setProgress] = useState(0);
  let interval: NodeJS.Timeout | null = null;

  const startProgressTimer = useCallback(() => {
    if (!interval) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100; // Cap at 100%
          if (prev >= 90) return prev + 5;
          return prev + 15;
        });
      }, 5000); // every 5 seconds
    }
  }, []);

  const stopProgressTimer = useCallback(() => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      startProgressTimer();
    } else {
      setProgress(100);
      stopProgressTimer();
    }

    return () => {
      stopProgressTimer(); // Cleanup on unmount
    };
  }, [isLoading, startProgressTimer, stopProgressTimer]);

  const Custom = [
    {
      id: 1,
      class: "progress-striped",
      color: "",
      valuenow: progress,
      width: `w-${Math.min(progress, 100)}`,
    },
  ];

  const idx = Custom[0];

  return (
    <>
      <div className="flex w-full items-center justify-center gap-4 mb-4">
        <div className="text-center text-primary text-lg font-bold flex flex-col items-center ">
          <div>
            Analyzing Product, Discovering Verified Suppliers and Computing AI
            Match Score.... <br />
          </div>
          <div className="text-center text-gray-500 italic text-sm mt-1 mb-4">
            <span className="">
              The process may take up to 30-45 seconds. Please wait while we
              generate the results
            </span>
            <br />
          </div>

          <div
            className={`progress !w-[110%] progress-xl !h-[30px] ${idx.class} progress-animate custom-progress-4 ${idx.color}`}
            role="progressbar"
            aria-valuenow={Number(idx.valuenow)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000 ease-out rounded-sm"
              style={{ width: `${idx.valuenow}%` }}
            ></div>
            <div
              className={`absolute inset-0 flex items-end justify-end font-semibold z-10 transition-colors duration-300 ${
                Number(idx.valuenow) === 100 ? "text-white dark:text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {Number(idx.valuenow)}%
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default DetailedSkeletonLoader;