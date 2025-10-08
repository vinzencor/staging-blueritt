import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { routes, type RouteType } from "./routes";
import ProtectedRoute from "./ProtectedRoute";
import VersionChecker from "../components/common/VersionChecker";
import { InactivityProvider } from "../components/InactivityProvider";

const Loader = lazy(() => import("../components/common/loader/loader.tsx"));

const renderRoutes = (
  routes: RouteType[],
  parentPath: string
): React.ReactNode => {
  return routes.map((route) => {
    // Remove trailing slash from parentPath if it exists
    const cleanParentPath = parentPath.endsWith("/")
      ? parentPath.slice(0, -1)
      : parentPath;
    // Remove leading slash from route.path if it exists
    const cleanRoutePath = route.path.startsWith("/")
      ? route.path.slice(1)
      : route.path;
    const fullPath = cleanParentPath
      ? `${cleanParentPath}/${cleanRoutePath}`
      : cleanRoutePath;

    // For nested routes where parent URLs have no element.
    if (!route.element) {
      return (
        <Route key={fullPath} path={route.path}>
          {route.children && renderRoutes(route.children, fullPath)}
        </Route>
      );
    }

    const RouteElement = route.isProtected ? (
      <ProtectedRoute>
        <route.element />
      </ProtectedRoute>
    ) : (
      <route.element />
    );

    const LayoutElement = route.layout ? (
      <route.layout>{RouteElement}</route.layout>
    ) : (
      RouteElement
    );

    return (
      <Route key={fullPath} path={route.path} element={LayoutElement}>
        {route.children && renderRoutes(route.children, fullPath)}
      </Route>
    );
  });
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <InactivityProvider>
        <Suspense fallback={<Loader />}>
          <VersionChecker autoReload={true} />
          <Routes>{renderRoutes(routes, "")}</Routes>
        </Suspense>
      </InactivityProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
