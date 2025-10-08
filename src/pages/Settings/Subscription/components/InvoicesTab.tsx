import React, { useEffect, useState } from "react";
import Spktables from "@/@spk/uielements/spk-tables";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionInvoices,
  emailInvoice,
  fetchAccountSummary,
} from "@/api/pricing";
import { toast } from "react-toastify";

interface Invoice {
  id: string;
  card: string;
  transactionId: string;
  invoiceDate: string;
  amount: string;
  description: string;
  status: string;
  viewInvoicePdf: string;
  downloadInvoicePdf: string;
}

interface InvoicesTabProps {
  dueDate: string;
  refreshTrigger?: number;
}


const InvoicesTab: React.FC<InvoicesTabProps> = ({
  dueDate,
  refreshTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Invoice | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [emailingInvoiceIds, setEmailingInvoiceIds] = useState<string[]>([]);
  const invoicesPerPage = 10;
  const [subscriptionData, setSubscriptionData] = useState({
    isActiveSubscription: false,
    lastPaymentDate: null,
  });
  const {
    data: invoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Invoice[]>({
    queryKey: ["getSubscriptionInvoices", refreshTrigger],
    queryFn: getSubscriptionInvoices,
  });

  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger]);

  //cencel subscription condition data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await fetchAccountSummary();

        setSubscriptionData({
          isActiveSubscription: summary?.data?.activeSubscription,
          lastPaymentDate: summary?.data?.lastPaymentDate,
        });
      } catch (error) {
        console.error("Error fetching account summary:", error);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full border border-gray-300 rounded-lg p-4">
        {/* Table Header */}
        <div className="flex w-full bg-gray-200 p-3 rounded-md animate-pulse">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex-1 h-6 bg-gray-300 rounded"></div>
          ))}
        </div>

        {/* Table Body - 3 Rows */}
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex overflow-x-auto w-full gap-x-10 border-b border-gray-300 p-3 animate-pulse"
          >
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 h-6 bg-gray-200 rounded"
              ></div>
            ))}
            {/* Last Column with 3 Rounded Buttons */}
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, btnIndex) => (
                <div
                  key={btnIndex}
                  className="h-8 w-8 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) return <p className="text-red-500">Error fetching invoices.</p>;

  // Handle sorting
  const handleSort = (field: keyof Invoice) => {
    setSortDirection(
      sortField === field && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortField(field);
  };

  // Sort icon helper
  const getSortIcon = (field: keyof Invoice) => {
    if (sortField !== field)
      return <i className="ri-arrow-up-down-line text-gray-400 ml-1"></i>;
    return sortDirection === "asc" ? (
      <i className="ri-arrow-up-line text-primary ml-1"></i>
    ) : (
      <i className="ri-arrow-down-line text-primary ml-1"></i>
    );
  };

  // Filter and sort invoices
  const filteredInvoices = invoices.filter((invoice: any) =>
    Object.values(invoice).some((val: any) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === "invoiceDate") {
      return sortDirection === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedInvoices.length / invoicesPerPage);
  const currentInvoices = sortedInvoices.slice(
    (currentPage - 1) * invoicesPerPage,
    currentPage * invoicesPerPage
  );

  const isEmailingInvoice = (invoiceId: string) => {
    return emailingInvoiceIds.includes(invoiceId);
  };

  return (
    <div className="table-responsive">
      <div className="mb-4">
        <div className=" mb-2">
          Your next payment will be on <br />
          <span className="text-lg font-semibold ">  {subscriptionData.isActiveSubscription
          ? subscriptionData.lastPaymentDate
          : "N/A"}</span>
        </div>
        <input
          type="text"
          placeholder="Search here"
          className="w-3/5 lg:w-1/5 p-2 border box rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
                onClick={() => handleSort("card")}
              >
                Card {getSortIcon("card")}
              </div>
            ),
          },
          {
            headerClassname: "text-start cursor-pointer",
            title: (
              <div
                className="flex items-center"
                onClick={() => handleSort("invoiceDate")}
              >
                Invoice Date {getSortIcon("invoiceDate")}
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
                onClick={() => handleSort("transactionId")}
              >
                Description {getSortIcon("transactionId")}
              </div>
            ),
          },

          {
            headerClassname: "text-start cursor-pointer",
            title: (
              <div
                className="flex items-center"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </div>
            ),
          },
          { headerClassname: "text-start", title: "Actions" },
        ]}
      >
        {currentInvoices.map((invoice) => (
          <tr className="border-b border-primary/10" key={invoice.id}>
            <th scope="row" className="text-start">
              {invoice.card}
            </th>
            <td>{invoice.invoiceDate}</td>
            <td>{invoice.amount}</td>
            <td>{invoice.description}</td>

            <td>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  invoice.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {invoice.status}
              </span>
            </td>
            <td>
              <div className="hstack flex gap-3 text-[.9375rem]">
                <div className="relative group">
                  <Link
                    to={invoice.viewInvoicePdf}
                    target="_blank"
                    className="ti-btn ti-btn-sm ti-btn-success !rounded-full"
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    View
                  </span>
                </div>
                <div className="relative group">
                  <Link
                    to={invoice.downloadInvoicePdf}
                    target="_blank"
                    className="ti-btn ti-btn-sm ti-btn-info !rounded-full"
                  >
                    <i className="bi bi-download"></i>
                  </Link>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    Download
                  </span>
                </div>
                <div className="relative group">
                  <div
                    className={`ti-btn ti-btn-sm ${
                      isEmailingInvoice(invoice.id)
                        ? "ti-btn-secondary opacity-75"
                        : "ti-btn-secondary"
                    } !rounded-full`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEmailingInvoice(invoice.id)) return;
                      setEmailingInvoiceIds((prev) => [...prev, invoice.id]);

                      emailInvoice(invoice.id)
                        .then(() => {
                          toast.success("Invoice email sent successfully!");
                        })
                        .catch((error) => {
                          console.error("Error sending invoice email:", error);
                          toast.error(
                            error?.response?.data?.error ||
                              "Failed to send invoice email. Please try again."
                          );
                        })
                        .finally(() => {
                          setEmailingInvoiceIds((prev) =>
                            prev.filter((id) => id !== invoice.id)
                          );
                        });
                    }}
                  >
                    {isEmailingInvoice(invoice.id) ? (
                      <span className="inline-block animate-spin">
                        <i className="bi bi-arrow-repeat"></i>
                      </span>
                    ) : (
                      <i className="bi bi-envelope"></i>
                    )}
                  </div>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    Email
                  </span>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </Spktables>

      {/* Pagination */}
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
    </div>
  );
};

export default InvoicesTab;
