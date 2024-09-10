import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { SiGoogleforms } from "react-icons/si";
import { TiFlowSwitch } from "react-icons/ti";
import { CgCardClubs } from "react-icons/cg";

export default function ModalTools({ children, pdf, setSelectTool }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <button onClick={onOpen}>{children}</button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Como quieres estudiar el dia de hoy?
              </ModalHeader>
              <ModalBody>
                <Button
                  startContent={<SiGoogleforms />}
                  onPress={() =>
                    setSelectTool({ file: pdf, tool: "CUESTIONARIO" })
                  }
                >
                  Generar un Cuestionario
                </Button>
                <Button
                  startContent={<CgCardClubs />}
                  onPress={() =>
                    setSelectTool({ file: pdf, tool: "FLASHCARDS" })
                  }
                >
                  Generar flashcards
                </Button>
                <Button
                  startContent={<TiFlowSwitch />}
                  onPress={() => setSelectTool({ file: pdf, tool: "MINDMAP" })}
                >
                  Generar un Mapa mental (beta)
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
