import React, { useMemo } from 'react';
import ApexchartsComponent from '../spk-packages/apexcharts-component';

interface RadialScoreChartProps {
  score: number;
  width?: string | number;
  height?: string | number;
}

const getGradientColor = (score: number) => {
  if (score >= 75) return ["#22c55e"]; // Green
  if (score >= 50) return ["#3b82f6"]; // Blue
  if (score >= 30) return ["#f97316"]; // Orange
  return ["#ef4444"]; // Red
};

const RadialScoreChart: React.FC<RadialScoreChartProps> = ({ score, width = "100", height = "100" }) => {
  // Memoize chart options to prevent recalculation on each render
  const chartOptions: any = useMemo(() => ({
    chart: {
      height: 320,
      type: "radialBar" as "radialBar",
      offsetY: -15,
      toolbar: {
        show: false,
      },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "80%",
          background: "#fff",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "#fff",
          strokeWidth: "100%",
          margin: 0,
          dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            right: 10,
            blur: 4,
            opacity: 0.35,
          },
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            offsetY: -10,
            color: "#888",
            fontSize: "12px",
            formatter: () => "",
          },
          value: {
            show: true,
            offsetY: -1,
            fontSize: "12px",
            color: "#111",
            formatter: function () {
              return '';
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: getGradientColor(score),
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: `${score}, 100`,
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["AI Match"],
  }), [score]);

  // Memoize chart series to prevent recalculation on each render
  const chartSeries = useMemo(() => [score || 0], [score]);

  return (
    <div className="relative">
      <ApexchartsComponent
        chartOptions={chartOptions}
        chartSeries={chartSeries}
        type="radialBar"
        width={width}
        height={height}
      />
      <div
        style={{
          position: "absolute",
          top: "17%",
          left: "50%",
          transform: "translate(-50%, -10%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{ fontSize: "10px", fontWeight: "bold" }}
          className="text-black dark:text-gray-500"
        >
          AI Match
        </div>
        <div
          style={{ fontSize: "10px", fontWeight: "bold" }}
          className="text-black dark:text-gray-500"
        >
          Score
        </div>
        <div
          style={{ fontSize: "11px", fontWeight: "bold" }}
          className="text-black dark:text-gray-300"
        >
          {score}%
        </div>
      </div>
    </div>
  );
};

export default React.memo(RadialScoreChart);