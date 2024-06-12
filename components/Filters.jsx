import { IoFilter } from "react-icons/io5";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";

import SelectContenidos from "./main/SelectContenidos";
import SelectUniversity from "./main/SelectUniversity";

export default function Filters({ setFilters, filters }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [contents, setContents] = useState(null);
  const [university, setUniversity] = useState(null);
  const [career, setCareer] = useState(null);

  const handleOk = () => {
    setFilters({ contents, university, career });
  };

  return (
    <>
      <Button isIconOnly onPress={onOpen}>
        <IoFilter />
      </Button>
      <Modal
        isDismissable={false}
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filtros de busqueda
              </ModalHeader>
              <ModalBody>
                <SelectContenidos
                  contents={filters.contents}
                  setMyContent={setContents}
                />
                <SelectUniversity
                  setMyCarrer={setCareer}
                  setMyUniversity={setUniversity}
                  universitySelected={filters.university}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => {
                    onClose();
                    handleOk();
                  }}
                >
                  Buscar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
