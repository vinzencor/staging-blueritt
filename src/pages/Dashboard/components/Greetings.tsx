import { Fragment, useState } from "react";
import Pageheader from "@/components/common/page-header/pageheader";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { useUserName } from "@/hooks/useUserDetails";
const Greetings = () => {
  const { data: userName } = useUserName();

  return (
    <Fragment>
      <Pageheader
        currentpage="BlueRitt Home"
        activepage="BlueRitt Home"
        mainpage="Dashboard"
      />
      <div className="w-full bg-white dark:bg-black text-black dark:text-white rounded-md">
        <div className="xl:col-span-12 col-span-12">
          <div className="box">
            <div className="mx-2 mt-1">
              <h4 className="font-semibold">Welcome back {userName} </h4>
            </div>
            <hr />
            <div className=" mx-2 p-1 mb-1">
              <span>Find the right product for your business</span>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Greetings;
