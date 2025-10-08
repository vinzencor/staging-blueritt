import * as Sentry from "@sentry/react";

interface VersionData {
  version: string;
  buildTimestamp: number;
}

/**
 * Sets up global error handlers to detect module loading failures and reload the page
 * to recover from caching issues that often occur after new deployments
 */
export function setupDynamicImportErrorHandlers(): void {
  // Handle synchronous errors (like script loading failures)
  window.addEventListener("error", (event) => {
    const errorMessage = event.message || "";
    const errorSource = event.filename || "";
    
    // Check if error is related to fetching dynamically imported module
    if (errorMessage.includes("Failed to fetch dynamically imported module") || 
        (errorSource.includes(".js") && errorMessage.includes("Failed to fetch"))) {
      handleModuleLoadingError(errorMessage, event);
      event.preventDefault();
    }
  });

  // Handle unhandled Promise rejections (which dynamic imports can trigger)
  window.addEventListener("unhandledrejection", (event) => {
    const errorMessage = event.reason?.message || String(event.reason) || "Unknown promise rejection";
    
    // Common patterns for chunk loading failures
    if (errorMessage.includes("Failed to fetch dynamically imported module") || 
        errorMessage.includes("ChunkLoadError") ||
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("Loading CSS chunk")) {
      handleModuleLoadingError(errorMessage, event);
      event.preventDefault();
    }
  });
}

/**
 * Common handler for module loading errors
 * 
 * 1. First tries to check if there's a newer version available (by fetching version.json)
 * 2. If version check fails or times out, forces a page reload
 * 3. Reports the error to Sentry before reloading (in production)
 */
async function handleModuleLoadingError(errorMessage: string, originalEvent: Event): Promise<void> {
  console.error("Detected dynamic import failure, checking for updates before reloading...", originalEvent);
  
  // Report to Sentry (if not in development)
  if (import.meta.env.MODE !== "development") {
    Sentry.captureException(new Error(`Dynamic module import failure, forcing reload: ${errorMessage}`));
  }

  try {
    // Try to fetch the latest version with a timeout
    const versionCheckPromise = fetchLatestVersion();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Version check timeout")), 2000)
    );
    
    // Race between version check and timeout
    await Promise.race([versionCheckPromise, timeoutPromise]);
  } catch (error) {
    console.warn("Failed to check for version updates, proceeding with reload:", error);
  } finally {
    // Always reload after reporting and version check attempt
    setTimeout(() => window.location.reload(), 500);
  }
}

/**
 * Fetches the latest version from version.json
 * This is a simplified version of the logic in useAppVersion hook
 */
async function fetchLatestVersion(): Promise<VersionData> {
  // Add cache-busting query parameter to prevent caching
  const response = await fetch(`/version.json?nocache=${Date.now()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch version information');
  }
  
  const versionData = await response.json() as VersionData;
  console.log('Fetched version data during error recovery:', versionData);
  return versionData;
}
