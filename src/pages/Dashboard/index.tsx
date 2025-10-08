import MyListings from "./components/MyListings";
import  OverviewCard  from "./components/OverviewCard";
import VideoCard from "./components/VideoCard";
import { CardSlider } from "./components/CardSlider";
import Greetings from "./components/Greetings";

const DashboardPage = () => {
  return (
    <>
      <div className="mb-2">
        <Greetings />
      </div>
      <div >
        <div className="w-full">
          <OverviewCard />
        </div>
        <div className="w-full">
          {/* <VideoCard /> */}
        </div>
        <div className="w-full">
          <MyListings />
        </div>
      </div>
      <div className=" w-full">
        <CardSlider />
      </div>
    </>
  );
};

export default DashboardPage;
