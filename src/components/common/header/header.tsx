import React, { FC, Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modalsearch from "../modal-search/modalsearch";
import { connect } from "react-redux";
import { ThemeChanger } from "../../../redux/action";
import { useUserName } from "@/hooks/useUserDetails";
import { useAuth } from "@/contexts/UserAuth";

import SpkDropdown from "../../../@spk/uielements/spk-dropdown";
import flag from "@/assets/images/our-features/americanflag.png";

import store from "../../../redux/store";
import us from "../../../assets/images/flags/us_flag.jpg";

import face9 from "../../../assets/images/faces/9.jpg";
import desktoplogo from "@/assets/images/brand-logos/blueritt-logo.png";
import togglelogo from "@/assets/images/brand-logos/blueritt-mini.png";
import desktopdark from "@/assets/images/brand-logos/blueritt-logo.png";
import toggledark from "@/assets/images/brand-logos/blueritt-mini.png";
import desktopwhite from "@/assets/images/brand-logos/blueritt-logo.png";
import togglewhite from "@/assets/images/brand-logos/blueritt-mini.png";
import product1 from "../../../assets/images/ecommerce/jpg/1.jpg";
import product3 from "../../../assets/images/ecommerce/jpg/3.jpg";
import product5 from "../../../assets/images/ecommerce/jpg/5.jpg";
import product4 from "../../../assets/images/ecommerce/jpg/4.jpg";
import product6 from "../../../assets/images/ecommerce/jpg/6.jpg";
import { logout } from "@/api/auth";
import SpkButton from "../../../@spk/uielements/spk-button";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateUserQuotaData } from "@/utils/prefetch";

interface HeaderProps {}

const Header: FC<HeaderProps> = ({ local_varaiable, ThemeChanger }: any) => {
  const data = (
    <span className="font-[600] py-[0.25rem] px-[0.45rem] rounded-[0.25rem] bg-pinkmain/10 text-pinkmain text-[0.625rem]">
      Free shipping
    </span>
  );
  const { data: userName, isLoading: nameLoading } = useUserName();
  const navigate = useNavigate();
  const { setAccessToken, setCurrentUser } = useAuth();
  const queryClient = useQueryClient();

  const cartProduct = [
    {
      id: 1,
      src: product1,
      name: "SomeThing Phone",
      price: "$1,299.00",
      color: "Metallic Blue",
      text: "6gb Ram",
      class: "",
    },
    {
      id: 2,
      src: product3,
      name: "Stop Watch",
      price: "$179.29",
      color: "Analog",
      text: data,
      class: "",
    },
    {
      id: 3,
      src: product5,
      name: "Photo Frame",
      price: "$29.00",
      color: "Decorative",
      text: "",
      class: "",
    },
    {
      id: 4,
      src: product4,
      name: "Kikon Camera",
      price: "$4,999.00",
      color: "Black",
      text: "50MM",
      class: "",
    },
    {
      id: 5,
      src: product6,
      name: "Canvas Shoes",
      price: "$129.00",
      color: "Gray",
      text: "Sports",
      class: "border-b-0",
    },
  ];

  const [cartItems, setCartItems] = useState([...cartProduct]);
  const [cartItemCount, setCartItemCount] = useState(cartProduct.length);
  const handleRemove = (
    itemId: number,
    event: { stopPropagation: () => void }
  ) => {
    event.stopPropagation();
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    setCartItemCount(updatedCart.length);
  };

  //Notifications

  const span1 = <span className="text-warning">ID: #1116773</span>;
  const span2 = <span className="text-success">ID: 7731116</span>;

  //  const span3 = <span className="font-[600] py-[0.25rem] px-[0.45rem] rounded-[0.25rem] bg-pinkmain/10 text-pinkmain text-[0.625rem]">Free shipping</span>

  const notifydata = [
    {
      id: 1,
      class: "Your Order Has Been Shipped",
      data: "Order No: 123456 Has Shipped To Your Delivery Address",
      icon: "gift",
      class2: "",
      color: "!bg-primary/10",
      color2: "primary",
    },
    {
      id: 2,
      class: "Discount Available",
      data: "Discount Available On Selected Products",
      icon: "discount-2",
      class2: "",
      color: "!bg-secondary/10",
      color2: "secondary",
    },
    {
      id: 3,
      class: "Account Has Been Verified",
      data: "Your Account Has Been Verified Sucessfully",
      icon: "user-check",
      class2: "",
      color: "!bg-pinkmain/10",
      color2: "pink",
    },
    {
      id: 4,
      class: "Order Placed",
      data: "Order Placed Successfully",
      icon: "circle-check",
      class2: span1,
      color: "!bg-warning/10",
      color2: "warning",
    },
    {
      id: 5,
      class: "Order Delayed",
      data: "Order Delayed Unfortunately",
      icon: "clock",
      class2: span2,
      color: "!bg-success/10",
      color2: "success",
    },
  ];

  const [notifications, setNotifications] = useState([...notifydata]);

  const handleNotificationClose = (
    index: number,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (event) {
      event.stopPropagation();
    }
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
  };

  //full screen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const windowObject = window;
      if (windowObject.innerWidth <= 991) {
        // ThemeChanger({ ...local_varaiable, "dataToggled": "close" })
      } else {
        // ThemeChanger({...local_varaiable,"dataToggled":""})
      }
    };
    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function menuClose() {
    const theme = store.getState();
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, dataToggled: "close" });
    }
    if (window.innerWidth >= 992) {
      ThemeChanger({
        ...theme,
        dataToggled: local_varaiable.dataToggled
          ? local_varaiable.dataToggled
          : "",
      });
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const windowObject = window;
      if (windowObject.innerWidth <= 991) {
      } else {
      }
    };
    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    const theme = store.getState();
    const sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        const verticalStyle = theme.dataVerticalStyle;
        const navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.dataToggled === "close-menu-close") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.dataToggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, dataToggled: "", iconOverlay: "" });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({
                  ...theme,
                  dataToggled: "icon-overlay-close",
                  iconOverlay: "",
                });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.dataToggled === "icon-text-close") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, dataNavStyle: "" });
            ThemeChanger({ ...theme, dataNavStyle: "" });
            if (theme.dataToggled === "double-menu-open") {
              ThemeChanger({ ...theme, dataToggled: "double-menu-close" });
            } else {
              const sidemenu = document.querySelector(
                ".side-menu__item.active"
              );
              if (sidemenu) {
                ThemeChanger({ ...theme, dataToggled: "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add(
                    "double-menu-active"
                  );
                } else {
                  ThemeChanger({ ...theme, dataToggled: "double-menu-close" });
                  // ThemeChanger({ ...theme, "dataToggled": "" });
                }
              }
            }
            // doublemenu(ThemeChanger);
            break;
          // detached
          case "detached":
            if (theme.dataToggled === "detached-close") {
              ThemeChanger({ ...theme, dataToggled: "", iconOverlay: "" });
            } else {
              ThemeChanger({
                ...theme,
                dataToggled: "detached-close",
                iconOverlay: "",
              });
            }

            break;

          // default
          case "default":
            ThemeChanger({ ...theme, dataToggled: "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.dataToggled === "menu-click-closed") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.dataToggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "menu-hover-closed" });
            }
            break;
          case "icon-click":
            if (theme.dataToggled === "icon-click-closed") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "icon-click-closed" });
            }
            break;
          case "icon-hover":
            if (theme.dataToggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, dataToggled: "" });
            } else {
              ThemeChanger({ ...theme, dataToggled: "icon-hover-closed" });
            }
            break;
        }
      }
    } else {
      if (theme.dataToggled === "close") {
        ThemeChanger({ ...theme, dataToggled: "open" });

        setTimeout(() => {
          if (theme.dataToggled == "open") {
            const overlay = document.querySelector("#responsive-overlay");

            if (overlay) {
              overlay.classList.add("active");
              overlay.addEventListener("click", () => {
                const overlay = document.querySelector("#responsive-overlay");

                if (overlay) {
                  overlay.classList.remove("active");
                  menuClose();
                }
              });
            }
          }

          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              const overlay = document.querySelector("#responsive-overlay");

              if (overlay) {
                overlay.classList.remove("active");
              }
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, dataToggled: "close" });
      }
    }
  };
  //Dark Model

  const ToggleDark = () => {
    ThemeChanger({
      ...local_varaiable,
      class: local_varaiable.class == "dark" ? "light" : "dark",
      dataHeaderStyles: local_varaiable.class == "dark" ? "light" : "dark",
      dataMenuStyles:
        local_varaiable.dataNavLayout == "horizontal"
          ? local_varaiable.class == "dark"
            ? "light"
            : "dark"
          : "dark",
    });
    const theme = store.getState();

    if (theme.class != "dark") {
      ThemeChanger({
        ...theme,
        bodyBg: "",
        Light: "",
        darkBg: "",
        inputBorder: "",
      });
      localStorage.setItem("ynexlighttheme", "light");
      localStorage.removeItem("ynexdarktheme");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("ynexHeader");
      localStorage.removeItem("darkBgRGB");
      localStorage.removeItem("bodyBgRGB");
      localStorage.removeItem("Light");
    } else {
      localStorage.setItem("ynexdarktheme", "dark");
      localStorage.removeItem("ynexlighttheme");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("ynexHeader");
    }
  };
  const handleLogout = async () => {
    try {
      // Call the logout API
      await logout();

      // Clear authentication data from context
      setAccessToken("");
      setCurrentUser({
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        phone: "",
      });

      // Clear all cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      // Clear localStorage
      localStorage.clear();

      // Clear user quota cache
      invalidateUserQuotaData(queryClient);

      // Redirect to login page
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if the API call fails, we still want to clear local data and redirect
      setAccessToken("");
      setCurrentUser({
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        phone: "",
      });
      localStorage.clear();
      // Clear user quota cache
      invalidateUserQuotaData(queryClient);
      navigate("/login");
      window.location.reload();
    }
  };

  useEffect(() => {
    const navbar = document?.querySelector(".header");
    const navbar1 = document?.querySelector(".app-sidebar");
    const sticky: any = navbar?.clientHeight;
    // const sticky1 = navbar1.clientHeight;

    function stickyFn() {
      if (window.pageYOffset >= sticky) {
        navbar?.classList.add("sticky-pin");
        navbar1?.classList.add("sticky-pin");
      } else {
        navbar?.classList.remove("sticky-pin");
        navbar1?.classList.remove("sticky-pin");
      }
    }

    window.addEventListener("scroll", stickyFn);
    window.addEventListener("DOMContentLoaded", stickyFn);

    // Cleanup event listeners when the component unmounts
    return () => {
      window.removeEventListener("scroll", stickyFn);
      window.removeEventListener("DOMContentLoaded", stickyFn);
    };
  }, []);

  return (
    <Fragment>
      <div className="app-header">
        <nav className="main-header !h-[3.75rem]" aria-label="Global">
          <div className="main-header-container ps-[0.725rem] pe-[1rem] ">
            <div className="header-content-left">
              <div className="header-element">
                <div className="horizontal-logo">
                  <Link to="/" className="header-logo">
                    <img
                      src={desktoplogo}
                      alt="logo"
                      className="desktop-logo"
                    />
                    <img src={togglelogo} alt="logo" className="toggle-logo" />
                    <img
                      src={desktopdark}
                      alt="logo"
                      className="desktop-dark"
                    />
                    <img src={toggledark} alt="logo" className="toggle-dark" />
                    <img
                      src={desktopwhite}
                      alt="logo"
                      className="desktop-white"
                    />
                    <img
                      src={togglewhite}
                      alt="logo"
                      className="toggle-white"
                    />
                  </Link>
                </div>
              </div>
              <div
                className="header-element md:px-[0.325rem] !items-center"
                onClick={() => toggleSidebar()}
              >
                <Link
                  aria-label="Hide Sidebar"
                  className="sidemenu-toggle animated-arrow  hor-toggle horizontal-navtoggle inline-flex items-center"
                  to="#"
                >
                  <span></span>
                </Link>
              </div>
            </div>
            <div className="header-content-right">
              {/* Search Button*/}
              {/* <div className="header-element py-[1rem] md:px-[0.40rem] px-2 header-search">
                <SpkButton Label="button" buttontype="button" Overlay="#search-modal" customClass="inline-flex flex-shrink-0 justify-center items-center gap-2  rounded-full font-medium focus:ring-offset-0 focus:ring-offset-white transition-all text-xs dark:bg-bgdark dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10">
                    <i className="bx bx-search-alt-2 header-link-icon"></i>
                </SpkButton>
              </div> */}

              {/* Country Dropdown */}

              <span className="flex items-center">
                {/* <img src={flag} alt="flag" className="h-[1.40rem] w-[1.40rem] rounded-full mr-3" /> */}
                <span className="mr-2">ENG</span>
              </span>

              {/* Dark Mode Toggle Switch */}
              <div
                className="header-element header-theme-mode hidden !items-center sm:block !py-[1rem] md:!px-[0.40rem] px-2"
                onClick={() => ToggleDark()}
              >
                <SpkButton
                  Label="anchor"
                  customClass="hs-dark-mode-active:hidden flex hs-dark-mode group flex-shrink-0 justify-center items-center gap-2  rounded-full font-medium transition-all text-xs dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                  Themevalue="dark"
                >
                  <i className="bx bx-moon header-link-icon"></i>
                </SpkButton>
                <SpkButton
                  Label="anchor"
                  customClass="hs-dark-mode-active:flex hidden hs-dark-mode group flex-shrink-0 justify-center items-center gap-2  rounded-full font-medium text-defaulttextcolor  transition-all text-xs  dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                  Themevalue="light"
                >
                  <i className="bx bx-sun header-link-icon"></i>
                </SpkButton>
              </div>

              {/* Cart Dropdown */}
              {/* <SpkDropdown
                Customclass="header-element cart-dropdown  md:!block !hidden py-[1rem] md:px-[0.40rem] px-2 [--placement:bottom-right] rtl:[--placement:bottom-left]"
                Custommenuclass="main-header-dropdown bg-white !-mt-3 !p-0 w-[22rem] border-0 border-defaultborder "
                Icon={true}
                Badgetext={cartItemCount}
                Badgetag={true}
                IconClass="bx bx-cart header-link-icon"
                Menulabel="dropdown-flag"
                buttonid="dropdown-cart"
                CustomToggleclass="relative !p-0 !border-0 flex-shrink-0  !rounded-full !shadow-none align-middle text-xs"
                Badgeclass="relative inline-flex !rounded-full h-[14.8px] w-[14px] !text-[0.625rem] bg-primary text-white justify-center items-center"
                Badgeid="cart-icon-badge"
              >
                <div className="ti-dropdown-header !bg-transparent flex justify-between items-center !m-0 !p-4">
                  <p className="text-defaulttextcolor  !text-[1.0625rem] font-semibold">
                    Cart Items
                  </p>
                  <Link
                    to="#"
                    className="font-[600] py-[0.25/2rem] px-[0.45rem] rounded-[0.25rem] bg-success/10 text-success text-[0.75em] "
                    id="cart-data"
                  >
                    {cartItemCount} Item{cartItemCount !== 1 ? "s" : ""}
                  </Link>
                </div>
                <div>
                  <hr className="dropdown-divider dark:border-white/10" />
                </div>
                <ul className="list-none mb-0" id="header-cart-items-scroll">
                  {cartItems.map((idx) => (
                    <li
                      className={`ti-dropdown-item border-b dark:border-defaultborder/10 border-defaultborder ${idx.class}`}
                      key={Math.random()}
                    >
                      <div className="flex items-start cart-dropdown-item">
                        <img
                          src={idx.src}
                          alt="img"
                          className="!h-[1.75rem] !w-[1.75rem] leading-[1.75rem] text-[0.40rem] rounded-[50%] br-5 me-3"
                        />

                        <div className="grow">
                          <div className="flex items-start justify-between mb-0">
                            <div className="mb-0 !text-[0.8125rem] text-defaulttextcolor dark:text-white font-semibold ">
                              <Link
                                to={`${
                                  import.meta.env.BASE_URL
                                }pages/ecommerce/cart`}
                              >
                                {idx.name}
                              </Link>
                            </div>

                            <div className="inline-flex">
                              <span className="text-black mb-1 dark:text-white !font-medium">
                                {idx.price}
                              </span>
                              <Link
                                aria-label="anchor"
                                to="#"
                                className="header-cart-remove ltr:float-right rtl:float-left dropdown-item-close"
                                onClick={(event) => handleRemove(idx.id, event)}
                              >
                                <i className="ti ti-trash"></i>
                              </Link>
                            </div>
                          </div>
                          <div className="min-w-fit flex  items-start justify-between">
                            <ul className="header-product-item dark:text-white/50 flex">
                              <li>{idx.color}</li>
                              <li>{idx.text}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  className={`p-3 empty-header-item border-t ${
                    cartItemCount === 0 ? "hidden" : "block"
                  }`}
                >
                  <div className="grid">
                    <Link
                      to={`${import.meta.env.BASE_URL}pages/ecommerce/checkout`}
                      className="w-full ti-btn ti-btn-primary-full p-2"
                    >
                      Proceed to checkout
                    </Link>
                  </div>
                </div>
                <div
                  className={`p-[3rem] empty-item ${
                    cartItemCount === 0 ? "block" : "hidden"
                  }`}
                >
                  <div className="text-center">
                    <span className="!w-[4rem] !h-[4rem] !leading-[4rem] rounded-[50%] avatar bg-warning/10 !text-warning">
                      <i className="ri-shopping-cart-2-line text-[2rem]"></i>
                    </span>
                    <h6 className="font-bold mb-1 mt-3 text-[1rem] text-defaulttextcolor dark:text-[#8c9097] dark:text-white/50">
                      Your Cart is Empty
                    </h6>
                    <span className="mb-3 !font-normal text-[0.8125rem] block text-defaulttextcolor dark:text-[#8c9097] dark:text-white/50">
                      Add some items to make me happy :)
                    </span>
                    <Link
                      to={`${import.meta.env.BASE_URL}pages/ecommerce/products`}
                      className="ti-btn ti-btn-primary btn-wave ti-btn-wave btn-sm m-1 !text-[0.75rem] !py-[0.25rem] !px-[0.5rem]"
                      data-abc="true"
                    >
                      continue shopping{" "}
                      <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </SpkDropdown> */}

              {/* Notification Dropdown */}
              {/* <div className="hs-dropdown ti-dropdown  header-element py-[1rem] md:px-[0.40rem] px-2 notifications-dropdown header-notification  !hidden md:!block [--placement:bottom-right]">
                <SpkButton
                  Id="dropdown-notification"
                  buttontype="button"
                  customClass="hs-dropdown-toggle relative ti-dropdown-toggle !p-0 !border-0 flex-shrink-0  !rounded-full !shadow-none align-middle text-xs"
                >
                  <i className="bx bx-bell header-link-icon  text-[1.125rem]"></i>
                  <span className="flex absolute h-5 w-5 -top-[0.25rem] end-0  -me-[0.6rem]">
                    <span className="animate-slow-ping absolute inline-flex -top-[2px] -start-[2px] h-full w-full rounded-full bg-secondary/40 opacity-75"></span>
                    <span
                      className="relative inline-flex justify-center items-center rounded-full  h-[14.7px] w-[14px] bg-secondary text-[0.625rem] text-white"
                      id="notification-icon-badge"
                    >
                      {notifications.length}
                    </span>
                  </span>
                </SpkButton>
                <div
                  className="main-header-dropdown !-mt-3 !p-0 hs-dropdown-menu ti-dropdown-menu bg-white !w-[22rem] border-0 border-defaultborder hidden !m-0"
                  aria-labelledby="dropdown-notification"
                >
                  <div className="ti-dropdown-header !m-0 !p-4 !bg-transparent flex justify-between items-center">
                    <p className="mb-0 text-[1.0625rem] text-defaulttextcolor font-semibold ">
                      Notifications
                    </p>
                    <span
                      className="text-[0.75em] py-[0.25rem/2] px-[0.45rem] font-[600] rounded-sm bg-secondary/10 text-secondary"
                      id="notifiation-data"
                    >{`${notifications.length} Unread`}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <ul
                    className="list-none !m-0 !p-0 end-0"
                    id="header-notification-scroll"
                  >
                    {notifications.map((idx, index) => (
                      <li
                        className="ti-dropdown-item dropdown-item"
                        key={Math.random()}
                      >
                        <div className="flex items-start">
                          <div className="pe-2">
                            <span
                              className={`inline-flex text-${idx.color2} justify-center items-center !w-[2.5rem] !h-[2.5rem] !leading-[2.5rem] !text-[0.8rem] ${idx.color} !rounded-[50%]`}
                            >
                              <i
                                className={`ti ti-${idx.icon} text-[1.125rem]`}
                              ></i>
                            </span>
                          </div>
                          <div className="grow flex items-center justify-between">
                            <div>
                              <p className="mb-0 text-defaulttextcolor dark:text-white text-[0.8125rem] font-semibold">
                                <Link
                                  to={`${
                                    import.meta.env.BASE_URL
                                  }pages/notifications/`}
                                >
                                  {idx.class} {idx.class2}
                                </Link>
                              </p>
                              <span className="text-[#8c9097] dark:text-white/50 font-normal text-[0.75rem] header-notification-text">
                                {idx.data}
                              </span>
                            </div>
                            <div>
                              <Link
                                aria-label="anchor"
                                to="#"
                                className="min-w-fit text-[#8c9097] dark:text-white/50 me-1 dropdown-item-close1"
                                onClick={(event) =>
                                  handleNotificationClose(index, event)
                                }
                              >
                                <i className="ti ti-x text-[1rem]"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`p-4 empty-header-item1 border-t mt-2 ${
                      notifications.length === 0 ? "hidden" : "block"
                    }`}
                  >
                    <div className="grid">
                      <Link
                        to={`${import.meta.env.BASE_URL}pages/notifications/`}
                        className="ti-btn ti-btn-primary-full !m-0 w-full p-2"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div
                    className={`p-[3rem] empty-item1 ${
                      notifications.length === 0 ? "block" : "hidden"
                    }`}
                  >
                    <div className="text-center">
                      <span className="!h-[4rem]  !w-[4rem] avatar !leading-[4rem] !rounded-full !bg-secondary/10 !text-secondary">
                        <i className="ri-notification-off-line text-[2rem]  "></i>
                      </span>
                      <h6 className="font-semibold mt-3 text-defaulttextcolor dark:text-[#8c9097] dark:text-white/50 text-[1rem]">
                        No New Notifications
                      </h6>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Related Apps Dropdown */}
              {/* <SpkDropdown
                Customclass="header-element header-apps dark:text-[#8c9097] dark:text-white/50 py-[1rem] md:px-[0.40rem] px-2 md:!block !hidden [--placement:bottom-left]"
                buttonid="dropdown-apps"
                CustomToggleclass="!p-0 !border-0 flex-shrink-0  !rounded-full !shadow-none text-xs"
                Menulabel="dropdown-apps"
                Icon={true}
                IconClass="bx bx-grid-alt header-link-icon text-[1.125rem]"
                Custommenuclass="main-header-dropdown !-mt-3 !w-[22rem] border-0 border-defaultborder"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="mb-0 text-defaulttextcolor text-[1.0625rem]  font-semibold">
                      Related Apps
                    </p>
                  </div>
                </div>
                <div className="dropdown-divider mb-0"></div>
                <div
                  className="ti-dropdown-divider divide-y divide-gray-200 dark:divide-white/10 main-header-shortcuts p-2"
                  id="header-shortcut-scroll"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <div>
                          <img
                            src={figma}
                            alt="figma"
                            className="!h-[1.75rem] !w-[1.75rem] text-2xl avatar text-primary flex justify-center items-center mx-auto"
                          />
                          <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                            Figma
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={powerpoint}
                          alt="miscrosoft"
                          className="leading-[1.75] text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Power Point
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={word}
                          alt="miscrodoftword"
                          className="leading-none
                         text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          MS Word
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={calender}
                          alt="calander"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Calendar
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={sketch}
                          alt="apps"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Sketch
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={googledocs}
                          alt="docs"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Docs
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={google}
                          alt="google"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Google
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={translate}
                          alt="translate"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Translate
                        </div>
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        to="#"
                        className="p-4 items-center related-app block text-center rounded-sm hover:bg-gray-50 dark:hover:bg-black/20"
                      >
                        <img
                          src={googlesheets}
                          alt="sheets"
                          className="leading-none text-2xl !h-[1.75rem] !w-[1.75rem] align-middle flex justify-center mx-auto"
                        />
                        <div className="text-[0.75rem] text-defaulttextcolor dark:text-white">
                          Sheets
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-4 first:pt-0 border-t">
                  <Link
                    className="w-full ti-btn ti-btn-primary-full p-2 !m-0"
                    to="#"
                  >
                    View All
                  </Link>
                </div>
              </SpkDropdown> */}

              {/* Fullscreen Toggle */}
              <div className="header-element header-fullscreen py-[1rem] md:px-[0.40rem] px-2">
                <SpkButton
                  Label="anchor"
                  onclickfunc={() => toggleFullscreen()}
                  customClass="inline-flex flex-shrink-0 justify-center items-center gap-2  !rounded-full font-medium dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                >
                  {isFullscreen ? (
                    <i className="bx bx-exit-fullscreen full-screen-close header-link-icon"></i>
                  ) : (
                    <i className="bx bx-fullscreen full-screen-open header-link-icon"></i>
                  )}
                </SpkButton>
              </div>
              <div className="header-element md:!px-[0.40rem] px-2 hs-dropdown !items-center ti-dropdown [--placement:bottom-left]">
                <SpkButton
                  Id="dropdown-profile"
                  buttontype="button"
                  customClass="inline-flex flex-shrink-0 justify-center items-center gap-2  !rounded-full font-medium dark:hover:bg-black/20 dark:text-[#8c9097] dark:text-white/50  dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                >
                  <i className="ti ti-user-circle text-[25px] !inline-flex mr-2"></i>
                  {/* <img
                    className="inline-block rounded-full "
                    src={face9}
                    width="32"
                    height="32"
                    alt="Image Description"
                  /> */}
                </SpkButton>
                <div className="md:block hidden dropdown-profile">
                  <p className="font-semibold mb-0 leading-none text-[#536485] text-[0.813rem] ">
                    {userName}
                  </p>
                  {/* <span className="opacity-[0.7] font-normal text-[#536485] block text-[0.6875rem] ">
                    Web Designer
                  </span> */}
                </div>
                <div
                  className="hs-dropdown-menu ti-dropdown-menu !-mt-3 border-0 w-[11rem] !p-0 border-defaultborder hidden main-header-dropdown  pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end"
                  aria-labelledby="dropdown-profile"
                >
                  <ul className="text-defaulttextcolor font-medium dark:text-[#8c9097] dark:text-white/50">
                    <li>
                      <Link
                        className="w-full ti-dropdown-item !text-[0.8125rem] !gap-x-0  !p-[0.40rem]"
                        to={`${import.meta.env.BASE_URL}settings/profile`}
                      >
                        <div className="flex items-center space-x-2">
                          <i className="ti ti-user-circle text-[1.125rem] opacity-[0.7]"></i>
                          <span>Profile</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="w-full ti-dropdown-item !text-[0.8125rem] !gap-x-0 !p-[0.40rem]"
                        to={`${import.meta.env.BASE_URL}settings/subscription/`}
                      >
                        <div className="flex items-center space-x-2">
                          <i className="ri-money-dollar-circle-line text-[1.125rem] opacity-[0.7]"></i>
                          <span>Payment</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="w-full ti-dropdown-item !text-[0.8125rem] !gap-x-0 !p-[0.40rem]"
                        to={`${import.meta.env.BASE_URL}settings/`}
                      >
                        <div className="flex items-center space-x-2">
                          <i className="ri-settings-2-line text-[1.125rem] opacity-[0.7]"></i>
                          <span>Settings</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="w-full ti-dropdown-item !text-[0.8125rem] !p-[0.40rem] !gap-x-0 !inline-flex"
                        to="/login"
                      >
                        <div
                          className="flex items-center space-x-2"
                          onClick={handleLogout}
                        >
                          <i className="ti ti-logout text-[1.125rem] opacity-[0.7]"></i>
                          <span>Log Out</span>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* Settings Dropdown */}
              {/* <div className="header-element md:px-[0.48rem]">
                <SpkButton
                  Label="button"
                  buttontype="button"
                  customClass="hs-dropdown-toggle switcher-icon inline-flex flex-shrink-0 justify-center items-center gap-2  rounded-full font-medium  align-middle transition-all text-xs dark:text-[#8c9097] dark:text-white/50 dark:hover:text-white dark:focus:ring-white/10 dark:focus:ring-offset-white/10"
                  Overlay="#hs-overlay-switcher"
                >
                  <i className="bx bx-cog header-link-icon animate-spin-slow"></i>
                </SpkButton>
              </div> */}
            </div>
          </div>
        </nav>
      </div>
      <Modalsearch />
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  local_varaiable: state,
});
export default connect(mapStateToProps, { ThemeChanger })(Header);
