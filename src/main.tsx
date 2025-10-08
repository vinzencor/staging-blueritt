import React, { lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Sentry from "@sentry/react";
import { setupDynamicImportErrorHandlers } from "./utils/errorHandlers";

// Set up error handlers for dynamic import failures
// This will automatically reload the page when module loading fails
setupDynamicImportErrorHandlers();

if (import.meta.env.MODE !== "development") {
  Sentry.init({
    dsn: "https://314fb12a36180520b19cbefd0ed955a4@o4509509245599744.ingest.de.sentry.io/4509509247041616",
    sendDefaultPii: true,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true
      })
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}

const App = lazy(() => import("./pages/App.tsx"));
const Crm = lazy(() => import("./container/dashboards/crm/crm.tsx"));
const Error401 = lazy(
  () => import("./container/error/error-401/error-401.tsx")
);
const Error404 = lazy(
  () => import("./container/error/error-404/error-404.tsx")
);
const Error500 = lazy(
  () => import("./container/error/error-500/error-500.tsx")
);


const Loader = lazy(() => import("./components/common/loader/loader.tsx"));
import "../src/assets/scss/tailwind/_tailwind.scss";
import "./index.scss";
import { Provider } from "react-redux";
import store from "./redux/store.tsx";
import RootWrapper from "./pages/Rootwrapper.tsx";
import AppRoutes from "./routing/AppRoutes.tsx";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import UserAuthContextProvider from "./contexts/UserAuth.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppWithPrefetch = () => {
  return (
    <RootWrapper>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
      <UserAuthContextProvider>
        <AppRoutes />
      </UserAuthContextProvider>
    </RootWrapper>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.Fragment>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppWithPrefetch />
      </Provider>
    </QueryClientProvider>
  </React.Fragment>
);
