import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import feature1 from "@/assets/images/our-features/feature04.png";
import feature2 from "@/assets/images/our-features/feature06.png";
import feature3 from "@/assets/images/our-features/feature05.png";
import feature4 from "@/assets/images/our-features/feature02.png";
import feature5 from "@/assets/images/our-features/feature01.png";
import feature6 from "@/assets/images/our-features/feature05.png";
import feature7 from "@/assets/images/our-features/feature03.png";
import feature8 from "@/assets/images/our-features/feature01.png";
import { Link } from "react-router-dom";
import { string } from "yup";

export const CardSlider = () => {
  const features = [
    {
      title: "Blueritt Explorer",
      img: feature1,
      discription:
        "Explore products, match top suppliers using AI, evaluate margins and save to catalog",
      link: "https://www.blueritt.com/solutions/blueritt-explorer/",
    },
    {
      title: "BlueRitt IntelliScan",
      img: feature2,
      discription:
        "Search top-selling products to sell on eCommerce marketplaces Effeciently",
      link: "https://www.blueritt.com/solutions/blueritt-explorer/",
    },
    {
      title: "BlueRitt SourceLink",
      img: feature3,
      discription:
        "Match products with trusted suppliers using AI for smarter sourcing",
      link: "https://www.blueritt.com/solutions/blueritt-explorer/",
    },
    {
      title: "BlueRitt MarginMax",
      img: feature4,
      discription:
        "Optimize gross profit margins for improved pricing and higher profits",
      link: "https://www.blueritt.com/solutions/blueritt-marginmax/",
    },
    {
      title: "BlueRitt ProductVault",
      img: feature5,
      discription:
        "Save and organize chosen products in your catalog for easy management",
    },
    {
      title: "BlueRitt AnalyticsPro",
      img: feature6,
      discription:
        "Monitor keywords, optimize listings, gain competitive insights, and manage PPC ",
      link: "https://www.blueritt.com/solutions/blueritt-analyticspro/",
    },
    {
      title: "Blueritt AI Companion",
      img: feature7,
      discription:
        "Unlock AI-powered insights, optimize decisions and drive eCommerce growth",
      link: "https://www.blueritt.com/solutions/blueritt-ai-companion/",
    },
    {
      title: "Blueritt SocialPulse",
      img: feature8,
      discription:
        "Analyze social media product trends, identify top-selling opportunities",
      link: "https://www.blueritt.com/solutions/blueritt-socialpulse/",
    },
  ];
  const [startIndex, setStartIndex] = useState(0);

  // Define visible cards based on screen size
  const getVisibleCards = () => {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const visibleCards = getVisibleCards();

  const prevSlide = () => {
    setStartIndex((prev) => Math.max(prev - 2, 0));
  };

  const nextSlide = () => {
    setStartIndex((prev) => Math.min(prev + 2, features.length - visibleCards));
  };
  return (
    <div className="col-span-12  dark:text-white">
      {/* our feature carousal */}
      <div className="box bg-white dark:bg-black text-black dark:text-white">
        <div className="box-header font-semibold text-base">Our Features</div>
        <div className="relative overflow-hidden">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-black text-black dark:text-white p-2 rounded-full"
            onClick={prevSlide}
            disabled={startIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-8 transition-all duration-300">
            {features
              .slice(startIndex, startIndex + visibleCards)
              .map((feature, index) => (
                <div
                  key={index}
                  className="box bg-white dark:bg-black text-black dark:text-white p-1 rounded-lg shadow-md"
                >
                  <img
                    src={feature.img}
                    className="w-full rounded-md mb-4"
                    alt={feature.title}
                  />
                  <h6 className="font-semibold text-lg">{feature.title}</h6>
                  <p className="text-[13px] text-gray-600">
                    {feature.discription}
                  </p>
                  <a
                    href={feature.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="block w-28 bg-primary text-white text-center mt-2 py-2 rounded-md">
                      Explore
                    </button>
                  </a>
                </div>
              ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2  p-2 rounded-full bg-white dark:bg-black text-black dark:text-white"
            onClick={nextSlide}
            disabled={startIndex >= features.length - visibleCards}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};
