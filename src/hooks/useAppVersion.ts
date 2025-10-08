import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface VersionData {
  version: string;
  buildTimestamp: number;
}

export const useAppVersion = () => {
  // Store the version loaded when the app first initializes
  const [initialVersion, setInitialVersion] = useState<VersionData | null>(null);
  // Track the latest version fetched from the server
  const [latestVersion, setLatestVersion] = useState<VersionData | null>(null);
  // Flag to indicate if an update is needed
  const [updateNeeded, setUpdateNeeded] = useState(false);
  // Track if we've loaded the version info
  const [loaded, setLoaded] = useState(false);
  
  // Check if we're in development environment
  const isDevelopment = import.meta.env.DEV;

  const location = useLocation();

  // Function to fetch the latest version from version.json
  const fetchLatestVersion = useCallback(async () => {
    // Skip version checking in development
    if (isDevelopment) {
      if (!loaded) setLoaded(true);
      return;
    }

    try {
      // Add cache-busting query parameter to prevent caching
      console.log('fetching version.json');
      const response = await fetch(`/version.json?nocache=${Date.now()}`);
      
      if (!response.ok) {
        console.error('Failed to fetch version information');
        return;
      }
      
      const versionData = await response.json() as VersionData;
        console.log('Fetched version data:', versionData);
      setLatestVersion(versionData);
      
      // If this is our first load, also set as initial version
      if (!initialVersion) {
        console.log('Setting initial version data:', versionData);
        setInitialVersion(versionData);
        setLoaded(true);
      } else {
        // Check if version has changed
        if (initialVersion.buildTimestamp !== versionData.buildTimestamp) {
            console.log('Version has changed, update needed');
            setUpdateNeeded(true);
        }
      }
    } catch (error) {
      console.error('Error fetching version information:', error);
    }
  }, [initialVersion, isDevelopment, loaded]);

  // Load the version data when the app initializes
  useEffect(() => {
    fetchLatestVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for updates when the route changes
  useEffect(() => {
    // Skip version checking in development environment
    if (isDevelopment) return;

    // Only check for updates if we've already loaded the initial version
    if (loaded) {
      fetchLatestVersion();
    }
  }, [location.pathname, loaded, fetchLatestVersion, isDevelopment]);

  // Function to reload the page to get the latest version
  const reloadForUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  return { 
    updateNeeded: isDevelopment ? false : updateNeeded, 
    reloadForUpdate, 
    loaded 
  };
};