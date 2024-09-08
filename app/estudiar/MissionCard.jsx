import { Button, Card, CardBody, Progress, Spinner } from "@nextui-org/react";
import { FaFileAlt } from "react-icons/fa";
import { PiStarFourFill } from "react-icons/pi";
import { useState } from "react";
import { toast } from "react-toastify";

import { setUserLogged, store } from "@/state";
import { reclaimStar } from "@/app/actions/stars";

const MissionCard = ({ mission, uploaded, total }) => {
  const [loadingReclaim, setLoadingReclaim] = useState(false);

  const handleReclaimStar = async () => {
    if (!mission) return;
    setLoadingReclaim(true);
    try {
      const user = await reclaimStar(mission);

      if (user.error) {
        toast.error(user.error);
        throw user.error;
      }
      store.dispatch(setUserLogged(user));
      setLoadingReclaim(false);
    } catch (error) {
      setLoadingReclaim(false);
    }
  };

  const progress = (uploaded / total) * 100;

  return (
    <div className="flex">
      {!mission.completed ? (
        <Card className="w-[250px]">
          <CardBody>
            <div className="flex items-center h-full">
              <FaFileAlt className="text-blue-500" size={24} />
              <p className="text-sm font-bold px-2">{mission.mission_text}</p>
            </div>
            <div className="flex items-center mt-4 relative">
              <Progress
                aria-label="Mission progress"
                className="w-full"
                color="primary"
                size="lg"
                value={progress}
              />
              <span className="ml-2 text-sm absolute z-10">{`${uploaded}/${total}`}</span>
              <div className="flex justify-end w-16">
                <p className="flex items-center justify-center text-primary-500 animated-star w-full">
                  <PiStarFourFill />
                  <span className="ml-1 text-sm">1</span>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Button
          className="w-[250px] h-full bg-primary hover:bg-primary-500 cursor-pointer"
          onPress={handleReclaimStar}
        >
          <div className="flex w-full h-full items-center justify-center">
            {loadingReclaim ? (
              <Spinner />
            ) : (
              <>
                <p
                  className={`${mission.type === "FREE" ? "text-md" : "text-lg"} font-bold px-2 text-wrap`}
                >
                  {mission.type === "FREE"
                    ? mission.mission_text
                    : "Completado!"}
                </p>
                <p className="flex items-center justify-center text-white w-full">
                  <PiStarFourFill size={24} />
                  <span className="ml-1 text-lg">1</span>
                </p>
              </>
            )}
          </div>
        </Button>
      )}
    </div>
  );
};

export default MissionCard;
