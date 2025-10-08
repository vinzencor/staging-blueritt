import Youtube from "@/assets/r_images/Dashboard/youtube.png";

const VideoCard = () => {
  return (
    <div
      className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gray-200"
      style={{
        backgroundImage: `url(${Youtube})`,
        backgroundSize: "cover",
      }}
    ></div>
  );
};

export default VideoCard;
