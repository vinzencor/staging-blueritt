import React, { useState } from "react";
import Spktitlecards from "@/@spk/uielements/spktitlecards";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getActiveAddons, postPurchaseAddon } from "@/api/addons";
import { useUserSubscriptionAndSearchQuota } from "@/hooks/useUserDetails";
import { fetchAccountSummary } from "@/api/pricing";

// Define types for addon
interface Addon {
  id: string;
  type_display: string;
  cost: number;
  num_searches: number;
}

interface AddonsTabProps {
  refreshAccountData?: () => void; // New prop to refresh account data
}

const AddonsTab = ({ refreshAccountData }: AddonsTabProps) => {
  const {
    data: addonsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getActiveAddons"],
    queryFn: getActiveAddons,
  });
  const { data: accountSummaryData, isLoading: isAccountLoading } = useQuery({
    queryKey: ["accountSummary"],
    queryFn: fetchAccountSummary,
  });
  const isTrial = accountSummaryData?.data.plan === "Trial";
  const isSubscribed = accountSummaryData?.data.activeSubscription === true;
  console.log(isSubscribed, "isSubscribed");

  const { refetch } = useUserSubscriptionAndSearchQuota();
  const addons = addonsResponse?.data || [];
  const [purchasingAddonId, setPurchasingAddonId] = useState<string | null>(
    null
  );

  // New states for confirmation modal with proper typing
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);

  const { mutate: purchaseAddon } = useMutation({
    mutationFn: postPurchaseAddon,
    onMutate: ({ id }) => {
      setPurchasingAddonId(id);
    },
    onSuccess: () => {
      toast.success("Addon purchased successfully!");
      setPurchasingAddonId(null);
      resetConfirmation();

      // Refresh account data to update the balance
      if (refreshAccountData) {
        refreshAccountData();
      }

      refetch();
    },
    onError: () => {
      toast.error("Failed to purchase addon");
      setPurchasingAddonId(null);
      resetConfirmation();
    },
  });

  // Function to handle opening the confirmation modal
  const handleBuyClick = (addon: Addon) => {
    setSelectedAddon(addon);
    setShowConfirmModal(true);
  };

  // Function to handle the actual purchase after confirmation
  const handleConfirmPurchase = () => {
    if (confirmText.toLowerCase() === "confirm" && selectedAddon) {
      purchaseAddon({ id: selectedAddon.id });
      setShowConfirmModal(false);
    } else {
      toast.error("Please type 'confirm' to proceed with purchase");
    }
  };

  // Function to reset confirmation state
  const resetConfirmation = () => {
    setShowConfirmModal(false);
    setConfirmText("");
    setSelectedAddon(null);
  };

  const displayNames: { [key: string]: string } = {
    "AI Supplier Matches": "Supplier Discoveries",
    "MarginMax Gross Profit Search": "Calculate Gross Profit ",
    "MarginMax Net Profit Search": "Calculate Net Profit",
  };
  const displayicon: { [key: string]: JSX.Element } = {
    "AI Supplier Matches": <i className="ti ti-building-factory-2"></i>,
    "Product Searches": <i className="ri-search-line"></i>,
    "MarginMax Gross Profit Search": <i className="bx bx-calculator"></i>,
    "MarginMax Net Profit Search": <i className="bx bx-calculator"></i>,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 items-stretch">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="box h-full flex flex-col animate-pulse">
            <div className="w-full h-20 rounded"></div>
            <div className="box-header p-4">
              <div className="w-3/4 h-6 rounded"></div>
            </div>
            <div className="box-body flex-1 p-4 space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="p-4">
              <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p>Failed to load addons</p>;

  return (
    <>
      <div>
        {/* Grid for "product searches" type */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {addons
            .filter(
              (addon: Addon) =>
                addon.type_display.toLowerCase() === "product searches"
            )
            .sort((a: any, b: any) => a.cost - b.cost)
            .map((addon: Addon) => (
              <Spktitlecards
                key={addon.id}
                Navigate="#!"
                Customclass="custom-card h-full flex flex-col min-h-[140px] w-[100%]"
              >
                <div className="flex-grow space-y-4">
                  <span className="flex items-center text-primary justify-center text-[30px] mt-3">
                    {displayicon[addon.type_display] && (
                      <span>{displayicon[addon.type_display]}</span>
                    )}
                  </span>

                  <div className="flex flex-wrap justify-center items-center text-[15px] font-bold gap-x-1 gap-y-1 whitespace-nowrap">
                    {addon.num_searches > 0 && (
                      <span>{addon.num_searches}</span>
                    )}
                    <span className="break-keep">
                      {displayNames[addon.type_display] || addon.type_display}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-primary text-center mt-4">
                    {addon.cost} $
                  </p>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handleBuyClick(addon)}
                    className={`w-[60%] px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-medium disabled:opacity-50

          ${
            isTrial || !isSubscribed
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }
      `}
                    disabled={
                      purchasingAddonId !== null || isTrial || !isSubscribed
                    }

                  >
                    {isTrial
                      ? "Buy now"
                      : purchasingAddonId === addon.id
                      ? "Processing..."
                      : "Buy now"}
                  </button>
                </div>
              </Spktitlecards>
            ))}
        </div>

        {/* Grid for "AI Supplier Matches" type */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch mt-8">
          {addons
            .filter(
              (addon: Addon) =>
                addon.type_display.toLowerCase() === "ai supplier matches"
            )
            .sort((a: any, b: any) => a.cost - b.cost)
            .map((addon: Addon) => (
              <Spktitlecards
                key={addon.id}
                Navigate="#!"
                Customclass="custom-card h-full flex flex-col min-h-[140px] w-[100%]"
              >
                <div className="flex-grow space-y-4">
                  <span className="flex items-center text-primary justify-center text-[30px] mt-3">
                    {displayicon[addon.type_display] && (
                      <span>{displayicon[addon.type_display]}</span>
                    )}
                  </span>

                  <div className="flex flex-wrap justify-center items-center text-[15px] font-bold gap-x-1 gap-y-1 whitespace-nowrap">
                    {addon.num_searches > 0 && (
                      <span>{addon.num_searches}</span>
                    )}
                    <span className="break-keep">
                      {displayNames[addon.type_display] || addon.type_display}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-primary text-center mt-4">
                    {addon.cost} $
                  </p>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handleBuyClick(addon)}
                    className={`w-[60%]  px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-medium disabled:opacity-50
     ${
    isTrial || !isSubscribed
      ? "bg-gray-400 text-black cursor-not-allowed"
      : "bg-primary text-white hover:bg-primary/90"
  }
  `}
                    disabled={purchasingAddonId !== null || isTrial || !isSubscribed}
                  >
                    {isTrial
                      ? "Buy now"
                      : purchasingAddonId === addon.id
                      ? "Processing..."
                      : "Buy now"}
                  </button>
                </div>
              </Spktitlecards>
            ))}
        </div>

        {/* Grid for "Gross profit" type */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch mt-8">
          {addons
            .filter(
              (addon: Addon) =>
                addon.type_display.toLowerCase() ===
                "marginmax gross profit search"
            )
            .sort((a: any, b: any) => Number(a.cost) - Number(b.cost))
            .map((addon: Addon) => (
              <Spktitlecards
                key={addon.id}
                Navigate="#!"
                Customclass="custom-card h-full flex flex-col min-h-[140px] w-[100%]"
              >
                <div className="flex-grow space-y-4">
                  <span className="flex items-center text-primary justify-center text-[30px] mt-3">
                    {displayicon[addon.type_display] && (
                      <span>{displayicon[addon.type_display]}</span>
                    )}
                  </span>

                  <div className="flex flex-wrap justify-center items-center text-[15px] font-bold gap-x-1 gap-y-1 whitespace-nowrap">
                    {addon.num_searches > 0 && (
                      <span>{addon.num_searches}</span>
                    )}
                    <span className="break-keep truncate">
                      {displayNames[addon.type_display] || addon.type_display}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-primary text-center mt-4">
                    {addon.cost} $
                  </p>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handleBuyClick(addon)}
                    className={`w-[60%]  px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-medium disabled:opacity-50
     ${
    isTrial || !isSubscribed
      ? "bg-gray-400 text-black cursor-not-allowed"
      : "bg-primary text-white hover:bg-primary/90"
  }
  `}
                    disabled={purchasingAddonId !== null || isTrial || !isSubscribed}
                  >
                    {isTrial
                      ? "Buy now"
                      : purchasingAddonId === addon.id
                      ? "Processing..."
                      : "Buy now"}
                  </button>
                </div>
              </Spktitlecards>
            ))}
        </div>

        {/* Grid for "Net profit" type */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch mt-8 mb-4">
          {addons
            .filter(
              (addon: Addon) =>
                addon.type_display.toLowerCase() ===
                "marginmax net profit search"
            )
            .sort((a: any, b: any) => Number(a.cost) - Number(b.cost))
            .map((addon: Addon) => (
              <Spktitlecards
                key={addon.id}
                Navigate="#!"
                Customclass="custom-card h-full flex flex-col min-h-[140px] w-[100%]"
              >
                <div className="flex-grow space-y-4">
                  <span className="flex items-center text-primary justify-center text-[30px] mt-3">
                    {displayicon[addon.type_display] && (
                      <span>{displayicon[addon.type_display]}</span>
                    )}
                  </span>

                  <div className="flex flex-wrap justify-center items-center text-[15px] font-bold gap-x-1 gap-y-1 whitespace-nowrap">
                    {addon.num_searches > 0 && (
                      <span className="">{addon.num_searches}</span>
                    )}
                    <span className="break-keep truncate">
                      {displayNames[addon.type_display] || addon.type_display}
                    </span>
                  </div>

                  <p className="text-base font-semibold text-primary text-center mt-4">
                    {addon.cost} $
                  </p>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handleBuyClick(addon)}
                    className={`w-[60%]  px-3 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-medium disabled:opacity-50
   ${

    isTrial || !isSubscribed
      ? "bg-gray-400 text-black cursor-not-allowed"
      : "bg-primary text-white hover:bg-primary/90"
  }

  `}
                    disabled={purchasingAddonId !== null || isTrial || !isSubscribed}
                  >
                    {isTrial
                      ? "Buy now"
                      : purchasingAddonId === addon.id
                      ? "Processing..."
                      : "Buy now"}
                  </button>
                </div>
              </Spktitlecards>
            ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedAddon && (
        <div className="fixed px-4 lg:px-0 inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg box rounded-lg shadow-lg">
            <div className="p-6">
              <div className="box p-6 rounded-lg mb-6">
                <div className="flex items-center gap-x-2">
                  <i className="bi bi-file-check text-primary text-2xl"></i>
                  <div>
                    <div className="font-medium text-gray-600">
                      Confirm Purchase
                    </div>
                    <p className="text-sm font-semibold">
                      Are you sure you want to purchase{" "}
                      {selectedAddon.type_display} for {selectedAddon.cost}{" "}
                      credits?
                    </p>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-medium mb-4">Verify Your Purchase</h2>
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">
                  Type "confirm" in the box below to proceed.
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 box"
                  placeholder="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="mr-2 px-4 py-2 text-gray-700 bg-gray-100 rounded"
                  onClick={resetConfirmation}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white rounded ${
                    confirmText.toLowerCase() !== "confirm"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary"
                  }`}
                  onClick={handleConfirmPurchase}
                  disabled={confirmText.toLowerCase() !== "confirm"}
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddonsTab;
