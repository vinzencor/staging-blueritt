import api from ".";

const getActiveAddons = () => {
  return api.get("/common/addons/active/");
};

const postPurchaseAddon = ({ id }: { id: string }) => {
  return api.post(`/common/wallet/purchase_addon/`, {
    addon_id: id,
  });
};

export { getActiveAddons, postPurchaseAddon };
