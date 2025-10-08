import { useEffect } from "react";
import ProductScannerPage from "../ProductScanner";
import Connect from "../ProductScanner/Connect";
import ProProfitPro from "../ProfitPro/Pro/index";
import { useDispatch } from "react-redux";
import { useLayoutEffect } from 'react';

const DynamicPage = () => {
const dispatch = useDispatch();
useLayoutEffect(() => {
    dispatch({
      type: "SET_SCANNER_ACTIVE_COMPONENT",
      payload: "ProductScanner",
    });
    return () => {
      dispatch({
        type: "SET_PROFIT_PRO_SOURCE",
        payload: "history",
      });
      dispatch({
        type: "SET_SCANNER_ACTIVE_COMPONENT",
        payload: "",
      });
      dispatch({
        type: "SET_SCANNER_PRODUCT_DETAILS",
        payload: {},
      });
      dispatch({
        type: "SET_SCANNER_SELECTED_SUPPLIER",
        payload: {},
      });
    };
  }, []);
  return (
    <div>
      <ProductScannerPage />
      <Connect />
      <ProProfitPro />
    </div>
  );
};

export default DynamicPage;
