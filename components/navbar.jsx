"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import NextLink from "next/link";
import { FaCheckCircle, FaGoogle, FaUser } from "react-icons/fa";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const { status } = useSession();
  const { isOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <NextUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flexjustify-start items-center gap-1"
              href="/"
            >
              <div className="font-bold hidden md:flex">
                <Image src="/logo-lg.png" className="cover max-h-6 rounded-none" isBlurred />
              </div>
              <div className="font-bold flex md:hidden">
                <Image src="/RA.png" className="cover max-h-5 rounded-none" isBlurred />
              </div>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="" justify="end">
          {/*  <NavbarItem className="hidden sm:flex gap-2">
            <ThemeSwitch />
          </NavbarItem> */}
          <NavbarItem className="hidden md:flex">
            {status === "authenticated" ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-sm font-normal text-default-600 bg-default-100"
                    startContent={<FaUser />}
                    variant="flat"
                  >
                    Cuenta
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem className={""} color={"default"}>
                    <Link
                      isExternal
                      className="w-full h-full text-sm font-normal text-default-600 "
                      href={"/profile"}
                    >
                      Ver perfil
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                    className={"text-danger"}
                    color={"danger"}
                    onClick={signOut}
                  >
                    Cerrar sesion
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                className="text-sm font-normal text-default-600 bg-default-100"
                variant="flat"
                onClick={onOpenChange}
              >
                Iniciar sesion
              </Button>
            )}
          </NavbarItem>

          <NavbarItem className="flex md:hidden">
            {!status === "authenticated" ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-sm font-normal text-default-600 bg-default-100"
                    startContent={<FaUser />}
                    variant="flat"
                  >
                    Cuenta
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions">
                  <DropdownItem className={""} color={"default"}>
                    <Link
                      isExternal
                      className="w-full h-full text-sm font-normal text-default-600 "
                      href={"/profile"}
                    >
                      Ver perfil
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                    className={"text-danger"}
                    color={"danger"}
                    onClick={signOut}
                  >
                    Cerrar sesion
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                className="text-sm font-normal text-default-600 bg-default-100"
                variant="flat"
                onClick={onOpenChange}
              >
                Iniciar sesion
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 2
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href="#"
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </NextUINavbar>
      <Login isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

const Login = ({ isOpen, onOpenChange }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSucces] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    try {
      signIn("credentials", { username, password });
      setSucces(true);

      setTimeout(() => {
        setUsername("");
        setPassword([]);
        setSucces(false);
        onOpenChange();
      }, 1000);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <Modal isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <h4>Iniciar sesion</h4>
            </ModalHeader>
            <ModalBody>
              <Button
                className={""}
                color="primary"
                radius="none"
                size="md"
                startContent={<FaGoogle />}
                variant={"solid"}
                onPress={() => signIn("google")}
              >
                Google
              </Button>
              <Input
                placeholder="Usuario o email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <NextLink className="text-blue-400" href={"#"}>
                Olvidaste tu contrasena?
              </NextLink>
              <NextLink
                className="flex justify-start items-center gap-1"
                href="/register"
              >
                No tienes cuenta?{" "}
                <Button className="text-blue-400" onClick={onOpenChange}>
                  Registrate aqui!
                </Button>
              </NextLink>
            </ModalBody>

            <ModalFooter>
              <Button auto flat color="error" onPress={onOpenChange}>
                Cancelar
              </Button>
              {success ? (
                <Button color="success" startContent={<FaCheckCircle />}>
                  Listo
                </Button>
              ) : (
                <Button auto onPress={handleSubmit}>
                  Ingresar
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
