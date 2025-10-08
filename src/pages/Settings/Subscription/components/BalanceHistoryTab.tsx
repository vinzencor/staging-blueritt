import Spktables from "@/@spk/uielements/spk-tables";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBalanceHistory } from "@/api/pricing";

interface BalanceHistoryTabProps {
  remainingBalance: string;
  refreshTrigger?: number; // New prop to refresh account data
}

interface BalanceHistory {
  id: string;
  amount: string;
  transaction_type: string;
  transaction_type_display: string;
  description: string;
  status: string;
  status_display: string;
  transaction_id: string | null;
  created_at: string;
  modified_at: string;
}

type SortField = keyof BalanceHistory | null;
type SortDirection = "asc" | "desc";

const BalanceHistoryTab: React.FC<BalanceHistoryTabProps> = ({
  remainingBalance,
  refreshTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const balanceHistoryPerPage = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["balanceHistory"],
    queryFn: getBalanceHistory,
    refetchOnWindowFocus: false,
    staleTime: 300000,

  });

  const balanceHistory: BalanceHistory[] = data?.data || [];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <i className="ri-arrow-up-down-line text-gray-400 ml-1"></i>;
    }
    return sortDirection === "asc" ? (
      <i className="ri-arrow-up-line text-primary ml-1"></i>
    ) : (
      <i className="ri-arrow-down-line text-primary ml-1"></i>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatAmount = (amount: string) => {
    return `$${amount}`;
  };

  const filteredBalanceHistory = balanceHistory.filter((item: BalanceHistory) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedBalanceHistory = [...filteredBalanceHistory].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "created_at") {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    const aValue = a[sortField];
    const bValue = b[sortField];

    const aString = aValue?.toString() || "";
    const bString = bValue?.toString() || "";

    if (aString < bString) return sortDirection === "asc" ? -1 : 1;
    if (aString > bString) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(
    sortedBalanceHistory.length / balanceHistoryPerPage
  );
  const currentSortedBalanceHistory = sortedBalanceHistory.slice(
    (currentPage - 1) * balanceHistoryPerPage,
    currentPage * balanceHistoryPerPage
  );

  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger]);

  return (
    <div className="table-responsive">
      <div className="mb-4">
        <div className=" mb-2">
          Remaining balance <br />
          <span className="text-lg font-semibold ">
            {remainingBalance}
          </span>
        </div>
        <input
          type="text"
          placeholder="Search here"
          className="w-3/5 lg:w-1/5 p-2 border box rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : isError ? (
        <div className="text-red-500 py-4">
          Error loading balance history. Please try again.
        </div>
      ) : (
        <>
          <Spktables
            tableRowclass="border-b border-primary/10"
            headerClass="bg-primary/10"
            tableClass="table whitespace-nowrap min-w-full"
            header={[
              {
                headerClassname: "text-start cursor-pointer",
                title: (
                  <div
                    className="flex items-center"
                    onClick={() => handleSort("transaction_type_display")}
                  >
                    Transaction Type {getSortIcon("transaction_type_display")}
                  </div>
                ),
              },
              {
                headerClassname: "text-start cursor-pointer",
                title: (
                  <div
                    className="flex items-center"
                    onClick={() => handleSort("amount")}
                  >
                    Amount {getSortIcon("amount")}
                  </div>
                ),
              },
              {
                headerClassname: "text-start cursor-pointer",
                title: (
                  <div
                    className="flex items-center"
                    onClick={() => handleSort("description")}
                  >
                    Description {getSortIcon("description")}
                  </div>
                ),
              },
              {
                headerClassname: "text-start cursor-pointer",
                title: (
                  <div
                    className="flex items-center"
                    onClick={() => handleSort("status_display")}
                  >
                    Status {getSortIcon("status_display")}
                  </div>
                ),
              },
              {
                headerClassname: "text-start cursor-pointer",
                title: (
                  <div
                    className="flex items-center"
                    onClick={() => handleSort("created_at")}
                  >
                    Transaction Date {getSortIcon("created_at")}
                  </div>
                ),
              },
            ]}
          >
            {currentSortedBalanceHistory.map((item) => (
              <tr className="border-b border-primary/10" key={item.id}>
                <td>{item.transaction_type_display}</td>
                <td>{formatAmount(item.amount)}</td>
                <td>{item.description}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.status_display}
                  </span>
                </td>
                <td>{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </Spktables>

          <div className="flex justify-end items-center gap-2 mt-4">
            <p className="text-xs">
              {currentPage} of {totalPages} pages
            </p>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <div className="flex items-center justify-center text-black bg-gray-300 rounded-full w-8 h-8 text-sm">
              {currentPage}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-primary/10 p-3 grid grid-cols-5 gap-4">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-6 bg-gray-200 rounded"></div>
          ))}
      </div>
      {Array(3)
        .fill(0)
        .map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-primary/10 p-3 grid grid-cols-5 gap-4"
          >
            {Array(5)
              .fill(0)
              .map((_, colIndex) => (
                <div key={colIndex} className="h-5 bg-gray-200 rounded"></div>
              ))}
          </div>
        ))}
    </div>
  );
};

export default BalanceHistoryTab;
