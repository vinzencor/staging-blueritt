import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAmazonTopProducts } from "@/api/product";
import { getCategory } from "@/api/savedProducts";

// Define the expected type for categories
interface Category {
  id: string;
  image: string;
  created_at: string;
  modified_at: string;
  name: string;
  description: string;
}

// Define the expected type for product items
interface Product {
  properties: {
    product_url: string;
    product_title: string;
  };
}

const MyListings: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAmazonTopProducts();
        setProducts(response.data); // ensure response.data is Product[]
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching top products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch saved categories with React Query
  const {
    data: savedCategoryData,
  } = useQuery({
    queryKey: ["getCategory"],
    queryFn: async () => {
      const response = await getCategory();
      return response.data;
    },
  });



  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* First Table */}
        <div className="col-span-1">
          <div className="box custom box">
            <div className="mx-6 mt-2 flex items-center justify-between border-b">
              <div className="font-semibold text-base">Top 5 Products</div>
            </div>
            <div className="box-body overflow-y-auto">
              <table className="table min-w-full whitespace-nowrap">
                <thead className="bg-success/10">
                  <tr className="border-defaultborder my-0">
                    <th>Most Search Products</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => (
                    <tr key={index} className="border-b border-defaultborder">
                      <td className="text-start break-words whitespace-normal max-w-xs hover:text-blue-500">
                        <a
                          href={item.properties.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.properties.product_title}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Second Table */}
        <div className="col-span-1">
          <div className="box custom box">
            <div className="mx-6 mt-2 flex items-center justify-between border-b">
              <div className="font-semibold text-base">Recent Searches</div>
            </div>
            <div className="box-body overflow-auto">
              <table className="table min-w-full whitespace-nowrap">
                <thead className="bg-success/10">
                  <tr className="border-b border-defaultborder">
                    <th>Saved Search</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedCategoryData?.map((category: Category) => (
                    <tr key={category.id} className="border-b border-defaultborder">
                      <th scope="row" className="text-start">
                        {category.name}
                      </th>
                      <td>
                        <Link to={`${import.meta.env.BASE_URL}listings/`}>
                          <button className="text-primary">View Search</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
