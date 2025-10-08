import React, { Fragment, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface SpkJobsCardsProps {
  svg?: ReactNode;
  ratio?: string | number;
  text: string;
  color?: string;
  path?: string;
}

const SpkJobsCards: React.FC<SpkJobsCardsProps> = ({
  svg,
  path,
  ratio,
  color,
}) => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <div className="bg-white box rounded-xl border-2">
        <div className="box-body">
          <div className="flex">
            <div className="me-4 gap-0">
              <span className={`avatar avatar-xxl pr-5${color}`}>{svg}</span>
            </div>
            <div className="w-full pt-4 justify-center items-center">
              <div className="flex-grow">
                <div className="flex pl-2 items-center justify-between">
                  <div className="font-semibold text-base">{ratio}</div>
                </div>
              </div>
              <div className="flex pt-3 justify-end">
                <div
                  className="bg-primary w-3/5 lg:w-2/5 flex items-center justify-center text-white px-6 py-2 rounded-full cursor-pointer hover:bg-blue-700"
                  onClick={() => navigate(`/settings/${path}`)}
                >
                  View
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SpkJobsCards;
