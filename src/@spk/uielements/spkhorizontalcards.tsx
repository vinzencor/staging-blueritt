import React, { Fragment } from "react";
import { Link } from "react-router-dom";
interface Horizontal {
  Imagesrc?: string;
  CardFooter?: boolean;
  Footertext?: string;
  Title?: string;
  Linktag?: boolean;
  children?: React.ReactNode;
  CardHeader?: boolean;
  Imgposition?: string;
  Imgclass?: string;
  Navigate: string | URL;
  onDelete?: () => void;
  onViewSearch?: () => void;
}

const Spkhorizontalcards: React.FC<Horizontal> = ({
  Imagesrc,
  CardHeader,
  Imgclass,
  Navigate,
  Imgposition,
  children,
  CardFooter,
  Title,
  Linktag,
  Footertext,
  onDelete,
  onViewSearch,
}) => {
  return (
    <Fragment>
      <div className="box border rounded-md px-2 py-2 !mb-4">
        {Linktag ? (
          <Link
            aria-label="anchor"
            to={Navigate}
            className="card-anchor"
          ></Link>
        ) : (
          ""
        )}
        <div className="grid grid-cols-12 gap-0">
          {Imgposition === "before" ? (
            <div className="lg:col-span-2 xl:col-span-1 md:p-2 col-span-12">
              <img src={Imagesrc} className={Imgclass} alt="..." />
            </div>
          ) : (
            ""
          )}
          <div className="lg:col-span-10 xl:col-span-11 col-span-12">
            <div className="flex flex-col lg:flex-row">
              {CardHeader ? (
                <div className="box-header">
                  <div className="box-title">{Title}</div>
                </div>
              ) : (
                ""
              )}
              <div className="box-body !py-2 !px-2">{children}</div>
              {CardFooter ? (
                <div className="box-footer !py-2 !px-2">
                  <p className="card-text">
                    <small className="text-[#8c9097] dark:text-white/50">
                      {Footertext}
                    </small>
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-x-2  !px-2">
              <div
                className="px-5 py-1 bg-danger whitespace-nowrap   duration-100 rounded-md text-white cursor-pointer"
                onClick={onDelete}
              >
                Remove Search
              </div>

              <div
                className="px-5 py-1  bg-primary whitespace-nowrap   duration-100 rounded-md text-white cursor-pointer"
                onClick={onViewSearch}
              >
                View Search
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Spkhorizontalcards;
