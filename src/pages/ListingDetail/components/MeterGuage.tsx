import { useEffect, useRef } from "react";

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  profitAmount: number;
  color?: string;
}

const Gauge = ({
  value,
  profitAmount,
  min,
  max,
  color = "green",
}: GaugeProps) => {
  const gaugeRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    green: {
      fill: "bg-success",
      background: "bg-gray-100",
    },
    blue: {
      fill: "bg-info",
      background: "bg-gray-100",
    },
    orange: {
      fill: "bg-warning",
      background: "bg-gray-100",
    },
    red: {
      fill: "bg-danger",
      background: "bg-gray-100",
    },
  };

  const isNegative = value < 0;
  const gaugeColor = !isNegative ? colorClasses[color as keyof typeof colorClasses] : null;

  useEffect(() => {
    if (gaugeRef.current && !isNegative) {
      const fillElement = gaugeRef.current.querySelector(
        ".gauge-fill"
      ) as HTMLElement;

      if (fillElement) {
        const clampedPercentage = Math.min((value - min) / (max - min), 1);
        fillElement.style.transform = `rotate(${clampedPercentage / 2}turn)`;
      }
    }
  }, [value, min, max, isNegative]);

  return (
    <div
      ref={gaugeRef}
      className="flex h-full w-9/12 flex-col justify-between pb-4"
    >
      <div className="relative h-0 w-full overflow-hidden rounded-t-full pb-[50%]">
        {/* Background */}
        <div
          className={`absolute inset-0 ${
            gaugeColor?.background ?? "bg-gray-100"
          }`}
        />

        {/* Fill (only when not negative) */}
        {!isNegative && gaugeColor?.fill && (
          <div
            className={`gauge-fill absolute left-0 top-full h-full w-full origin-top transition-transform duration-200 ease-out ${gaugeColor.fill}`}
            style={{ transform: "rotate(0turn)" }}
          />
        )}

        {/* Cover */}
        <div className="absolute left-1/2 top-1/4 h-[150%] w-3/4 -translate-x-1/2 rounded-full" />
      </div>
      <div className="mx-2 flex justify-between">
        <p className="text-sm dark:text-gray-300  text-black">{min}%</p>
        <div className="font-medium">
        <p className="text-sm dark:text-gray-300  text-black">{(Math.abs(min) + Math.abs(max)) / 2}%</p>
        </div>
        <p className="text-sm dark:text-gray-300  text-black">{max}%</p>

      </div>
    </div>
  );
};

export default Gauge;
