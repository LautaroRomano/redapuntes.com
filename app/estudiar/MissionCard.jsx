import { Button, Card, CardBody, Divider, Progress } from "@nextui-org/react";
import { FaFileAlt, FaStar } from "react-icons/fa";
import { PiStarFourFill } from "react-icons/pi";

const MissionCard = ({ missionText, uploaded, total }) => {
  const progress = (uploaded / total) * 100;

  return (
    <div className="flex p-2 flex-wrap gap-4 w-full justify-center">
      <Card className="max-w-[250px]">
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
    </div>
  );
};

export default MissionCard;
