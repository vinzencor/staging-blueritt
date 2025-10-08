import { Fragment } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <Fragment>
      <footer className="footer mt-auto xl:ps-[15rem]  font-normal font-inter bg-white text-defaultsize leading-normal text-[0.813] shadow-[0_0_0.4rem_rgba(0,0,0,0.1)] dark:bg-bodybg pt-3 pb-1 text-center">
        <div className="container">
          <span className="text-gray dark:text-defaulttextcolor/50">
            <span className="text-primary font-bold">BlueRitt®</span> is a
            proprietary product of{" "}
            <a
              href="https://www.blueritt.com/"
              target="_blank"
              className="text-defaulttextcolor font-semibold dark:text-defaulttextcolor"
            >
              ReverCe Technologies Ltd. UK
            </a>{" "}
            | © Copyright <span id="year">2025.</span> All Rights Reserved |
            <a
              href="https://www.blueritt.com/contact-us/"
              target="_blank"
              className="text-defaulttextcolor font-semibold dark:text-defaulttextcolor"
            >
              <span> www.blueritt.com</span>
            </a>
          </span>
        </div>
        <div className="items-center mb-0 p-0 m-0 leading-none">
          <span className="block leading-none"><span className="font-bold">Version:</span> 1.0.0</span>
        </div>
      </footer>
    </Fragment>
  );
};

export default Footer;
