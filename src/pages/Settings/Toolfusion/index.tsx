import Pageheader from "@/components/common/page-header/pageheader";

const Toolfusion = () => {
  const cards = [
    {
      title: "Google Patent Check",
      description: "Verify product patent status and avoid legal risks",
      buttonTittle: "Verify Patent Status ",
      link: "https://patents.google.com/",
    },
    {
      title: "AMZ Data Studio",
      description: "Get insights on Amazon products, sales, and keyword data",
      buttonTittle: "Optimize Product Strategy  ",
      link: "https://amzdatastudio.com/",
    },
    {
      title: "Nationwide Barcode",
      description: "Buy authentic UPC barcodes for Amazon and retail platforms",
      buttonTittle: "Get Your Barcodes  ",
      link: "https://nationwidebarcode.com/purchase-barcodes/barcodes-for-amazon/",
    },
    {
      title: "Influencer Marketing (Heepsy)",
      description: "Find influencers to promote and grow your product reach",
      buttonTittle: "Find Perfect Influencers  ",
      link: "https://www.heepsy.com/",
    },

    {
      title: "Rakuten Chrome Extension",
      description: "Earn cashback on business-related online purchases easily",
      buttonTittle: "Start Earning Cashback",
      link: "https://www.rakuten.com/extension",
    },
    {
      title: "Trustpilot ",
      description: "Check reviews and ratings of suppliers and distributors",
      buttonTittle: "Check Supplier Ratings   ",
      link: "https://www.trustpilot.com/",
    },

    {
      title: "Inspection Services – QIMA",
      description: "Ensure quality of products sourced Top suppliers",
      buttonTittle: "Ensure Product Quality ",
      link: "https://www.qima.com/consumer-products/quality-control/quality-control-in-china",
    },
    {
      title: "Inspection Services – Zoom ",
      description: "Verify product standards and quality before shipment",
      buttonTittle: "Verify Product Standards    ",
      link: "https://zoominspect.com/",
    },
  ];
console.log(cards)
  return (
    <>
      <Pageheader
        currentpage="BlueRitt ToolFusion"
        activepage="BlueRitt ToolFusion"
        mainpage="Tools & Services"
      />
      <div className="flex flex-col items-start text-start dark:text-white ">
        <h6 className="font-semibold">Welcome to BlueRitt® ToolFusion</h6>
        <p className="mt-1">
          Explore a curated suite of trusted third-party tools — including
          Patent Checks, Barcode Verification, Product Optimization, Inspection
          Services, and more — all designed to accelerate your eCommerce success
          and streamline your operations under one unified platform.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="w-[90%] h-[95%] rounded-2xl mt-3 shadow-md box p-9 bg-white flex flex-col justify-between mx-auto text-center"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                <p className="text-gray-600 mb-4">{card.description}</p>
              </div>
              <a
                href={card.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="mt-4 w-[94%] bg-primary text-white px-3 py-2 rounded-lg shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                  {card.buttonTittle}
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start text-start text-[11px] mt-16 mb-4 dark:text-white">
        <p className="font-semibold">Disclaimer:</p>
        <p className="my-1">
          BlueRitt® connects you with reputable and widely used
          external service providers. However, these services are delivered
          independently, and BlueRitt® holds no responsibility for their
          accuracy, results, or outcomes
        </p>
      </div>
    </>
  );
};

export default Toolfusion;
