import React from "react";
import { cn } from "@/utils/cn";

type TProfitData = {
  section: string;
  items: {
    label: string;
    value: number;
    labelClassName?: string;
    valueClassName?: string;
  }[];
};

type TRevenueCalculationCardProps = {
  data: TProfitData[];
  bgColor: string;
};

const RevenueCalculationCard: React.FC<TRevenueCalculationCardProps> = ({
  data,
  bgColor,
}) => {
  return (
    <div className={cn(`w-full px-6 py-3 dark:bg-[#1A1C1E] dark:text-white bg-${bgColor}`)} style={{ borderLeft: "2px solid #f4f4f4"}}>
      {data.map((sectionData, index) => (
        <div key={index} className={cn("grid grid-cols-1 lg:grid-cols-2 ")}>
          {sectionData.items.map((item, idx) => (
            <div
              key={idx}
              className="items-center justify-between py-2 "
            >
              <div>
                <p
                  className={cn(
                    item.labelClassName,
                    "text-sm pr-2 py-2 font-medium  dark:bg-[#1A1C1E] dark:text-white"
                  )}
                >
                  {item.label}
                </p>
                <p className={cn(item.valueClassName, "text-xl font-meduim font-semibold ")}>
                  ${item.value.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RevenueCalculationCard;
