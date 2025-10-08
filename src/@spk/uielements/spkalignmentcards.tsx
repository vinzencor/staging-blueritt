import React, { Fragment } from "react";

interface Alignment {
  Iconsrc?: string;
  bgColor?: string;
  Buttontext?: string;
  Text1?: string | number;
  Title1?: string;
  Text2?: string | number;
  Title2?: string;
  Customclass?: string;
  Customtitleclass?: string;
  Loading?: boolean;
  Icon?: boolean;
}
const Spkalignmentcards: React.FC<Alignment> = ({
  Iconsrc,
  bgColor,
  Customclass,
  Customtitleclass,
  Title1,
  Text1,
  Title2,
  Text2,
  Icon,
  Loading,
  //   Buttontext,
  //   Navigate,
}) => {
  return (
    <Fragment>
      <div
        className={`box duration-300 border w-full ${Customclass}`}
      >
        <div className="box-body">
          <div className="flex items-top justify-between">
          <div className="">
            <span className="avatar avatar-xl">
              {Loading ? (
                <>
                  <div className="animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                  </div>
                </>
              ) : (
                <div
                  className={`!rounded-full w-14 h-14 flex items-center justify-center bg-${bgColor}`}
                >
                  <i className={`${Iconsrc} text-4xl text-white`}></i>
                </div>
              )}
            </span>
          </div>

          {Loading ? (
            <>
              <div className="animate-pulse">
                <div className="h-6 w-28 rounded bg-gray-300"></div>
                <div className="mt-2 h-4 w-5/6 rounded bg-gray-300"></div>
                <div className="mt-2 h-4 w-full max-w-sm rounded bg-gray-300"></div>
                <div className="mt-2 h-4 w-4/6 rounded bg-gray-300"></div>
              </div>
            </>
          ) : (
            <div className="flex-grow ms-5">
                <div className="flex items-center justify-between flex-wrap">
                  <div>
                  <p
                    className={`text-[#8c9097] dark:text-white/50 text-[0.875rem] mb-0`}
                  >
                    {Title1}
                  </p>
                  <h4 className=" card-text font-semibold  text-[1.375rem] !mb-2 mb-0">
                    {Text1}
                  </h4>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap">
                  <div>
                    <p
                      className={`text-[#8c9097] dark:text-white/50 text-[0.875rem] mb-0`}
                    >
                      {Title2}
                    </p>
                    <h4 className="font-semibold  text-[1.375rem] !mb-2 mb-0">
                      {Text2}
                    </h4>
                  </div>

                  {Icon ? (
                <div className="text-primary text-[0.813rem] cursor-pointer">
                  Search Volume <i className="ti ti-arrow-right"></i>
                </div>
              ) : (
                <></>
              )}

                </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Spkalignmentcards;
