import React, { useEffect } from 'react';
import { useAppVersion } from '../../hooks/useAppVersion';
import { toast } from 'react-toastify';

interface VersionCheckerProps {
  autoReload?: boolean;
}

// dyummyCommit for version checker testing
const VersionChecker: React.FC<VersionCheckerProps> = ({ autoReload = false }) => {
  const { updateNeeded, reloadForUpdate } = useAppVersion();

  useEffect(() => {
    if (updateNeeded) {
      if (autoReload) {
        // Auto reload if configured to do so
        reloadForUpdate();
      } else {
        // Show notification to user that an update is available
        toast.info(
          <div className="flex flex-col">
            <div className="font-semibold">A new version is available</div>
            <div className="mt-1">Please refresh the page to get the latest updates.</div>
            <button
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md self-end"
              onClick={reloadForUpdate}
            >
              Update now
            </button>
          </div>,
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: true,
            position: "top-right",
          }
        );
      }
    }
  }, [updateNeeded, reloadForUpdate, autoReload]);

  return null; // This is a utility component with no UI of its own
};

export default VersionChecker;