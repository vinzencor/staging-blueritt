import React, { Fragment } from "react";
// import SpkButton from "../spk-button";
import { Link } from "react-router-dom";

interface Titlecards {
  CustomBodyclass?: string;
  CustomHeaderclass?: string;
  Imgsrc?: string;
  Footertext?: string;
  Title?: string;
  Customclass?: string;
  Customfooterclass?: string;
  Icon?: string;
  LinkClass?: string;
  Icontag?: boolean;
  Linktag?: boolean;
  ButtonTag?: boolean;
  Cardheader?: boolean;
  Imagetag?: boolean;
  Cardfooter?: boolean;
  Anchortagbefore?: boolean;
  children?: React.ReactNode;
  OnclickFunc?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => void;
  Navigate?: string | URL; // Made optional
  AnchortagNavigate?: string | URL; // Made optional
}
const Spktitlecards: React.FC<Titlecards> = ({
  ButtonTag,
  Imgsrc,
  Anchortagbefore = false,
  OnclickFunc,
  Navigate,
  AnchortagNavigate,
  Cardheader,
  Imagetag = false,
  Icontag = false,
  LinkClass,
  CustomBodyclass,
  Customfooterclass,
  Icon,
  Cardfooter,
  Customclass,
  CustomHeaderclass,
  children,
  Footertext,
  Title,
  Linktag,
}) => {
  return (
    <Fragment>
      <div
        className={`box mt-2 border-gray-300 border h-full flex flex-col ${Customclass}`}
      >
        {Imagetag ? (
          <img src={Imgsrc} className="card-img-top" alt="..." />
        ) : (
          ""
        )}
        {Anchortagbefore && AnchortagNavigate && (
          <Link
            aria-label="anchor"
            to={AnchortagNavigate}
            className="card-anchor"
          ></Link>
        )}
        {Cardheader ? (
          <div className={` ${CustomHeaderclass}`}>
            <div className="">{Title}</div>
            {Linktag && Navigate && (
              <Link
                aria-label="anchor"
                to={Navigate}
                className={LinkClass}
                onClick={OnclickFunc}
              >
                {Icontag ? <i className={Icon}></i> : ""}
              </Link>
            )}
          </div>
        ) : (
          ""
        )}

        <div className={` ${CustomBodyclass}`}>{children}</div>
      </div>
    </Fragment>
  );
};

export default Spktitlecards;
