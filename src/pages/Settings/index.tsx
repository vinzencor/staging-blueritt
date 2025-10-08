import SpkJobsCards from "@/@spk/uielements/spk-jobscards";

const Settings = () => {
  return (
    <div className="mt-5 ">
      <div className="bg-white box p-6 rounded-md ">
        <div className="text-lg font-semibold pb-6">Settings</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4">
          <div>
            <SpkJobsCards
              ratio="Adjust your Profile"
              svg={
                <i className="bi bi-person-circle text-primary text-7xl border-r-2 pr-5"></i>
              }
              text="+0.40%"
              color="bg-primary"
              path="profile"
            />
          </div>
          <div>
            <div>
              <div>
                <SpkJobsCards
                  ratio="Manage your Subscription"
                  svg={
                    <i className="bx bx-credit-card text-primary text-7xl border-r-2 pr-4"></i>
                  }
                  text="+0.40%"
                  color="bg-primary"
                  path="subscription" // This will navigate to `/settings/subscription`
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
