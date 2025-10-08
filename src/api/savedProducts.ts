import api from ".";

const saveProducts = (dataObj: any) => {
  return api.post("/calculator/product/", dataObj);
};

const updateProducts = ({ saveID, ...obj }: any) => {
  return api.patch(`/calculator/product/${saveID}/`, { ...obj });
};

const getSavedProducts = () => {
  return api.get("/calculator/product/");
};

const getSavedProductsDetail = ({ id }: { id: string }) => {
  return api.get(`/calculator/product/${id}`);
};

const deleteSavedProducts = ({ saveID }: { saveID: string }) => {
  return api.delete(`/calculator/product/${saveID}`);
};

const getProfitProCalculations = ({ saveID }: { saveID: string }) => {
  return api.get(`/calculator/calculations/${saveID}`);
};

const getListingDetailSuggestionByAI = ({
  listingID,
  prompt,
  title,
  description,
}: {
  listingID: string;
  prompt: string;
  title: string;
  description: string;
}) => {
  return api.post(`/calculator/create-listing/${listingID}/`, {
    prompt: prompt,
    data: {
      ProductTitle: title,
      ProductDescription: description,
    },
  });
};

const saveListingDetail = ({
  listingID,
  title,
  description,
}: {
  listingID: string;
  title: string;
  description: string;
}) => {
  return api.post(`/calculator/listing-save/`, {
    product: listingID,
    data: {
      ProductTitle: title,
      ProductDescription: description,
    },
  });
};

const getCategory = () => {
  return api.get("/calculator/category/");
};

const createCategory = (dataObj: any) => {
  return api.post("/calculator/category/", dataObj);
};

const deleteCategory = ({ saveID }: { saveID: string }) => {
  return api.delete(`/calculator/category/${saveID}`);
};

const getSavedCategoriesDetail = ({ id }: { id: string }) => {
  return api.get(`/calculator/category/${id}`);
};

export {
  saveProducts,
  getSavedProducts,
  deleteSavedProducts,
  getSavedProductsDetail,
  getProfitProCalculations,
  updateProducts,
  getListingDetailSuggestionByAI,
  saveListingDetail,
  getCategory,
  createCategory,
  deleteCategory,
  getSavedCategoriesDetail,
};
