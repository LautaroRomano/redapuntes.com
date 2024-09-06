import { Button, Card, CardBody, Progress } from "@nextui-org/react";
import { FaFileAlt } from "react-icons/fa";
import { PiStarFourFill } from "react-icons/pi";

const MissionCard = ({ missionText, uploaded, total }) => {
  const progress = (uploaded / total) * 100;

  return (
    <div className="flex">
      {
        (uploaded < total) ?
          <Card className="w-[250px]">
            <CardBody>
              <div className="flex items-center">
                <FaFileAlt size={24} className="text-blue-500" />
                <p className="text-sm font-bold px-2">{missionText}</p>
              </div>
              <div className="flex items-center mt-4 relative">
                <Progress
                  value={progress}
                  color="primary"
                  className="w-full"
                  aria-label="Mission progress"
                  size="lg"
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
          :
          <Button className="w-[250px] h-full bg-primary hover:bg-primary-500 cursor-pointer">
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg font-bold px-2">Completado!</p>
              <p className="flex items-center justify-center text-white w-full">
                <PiStarFourFill size={24} />
                <span className="ml-1 text-lg">1</span>
              </p>
            </div>
          </Button>
      }
    </div>
  );
};

export default MissionCard;
