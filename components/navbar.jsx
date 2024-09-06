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
import {
  FaCheckCircle,
  FaExternalLinkAlt,
  FaGoogle,
  FaUser,
} from "react-icons/fa";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Badge,
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
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useTheme } from "next-themes";
import { PiStarFourFill } from "react-icons/pi";

import { ThemeSwitch } from "./theme-switch";

import { siteConfig } from "@/config/site";
import { getMyUser } from "@/app/actions/users";
import { store, setUserLogged } from "@/state/index";
import { useSelector } from "react-redux";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const { isOpen, onOpenChange } = useDisclosure();
  const [myTheme, setMyTheme] = useState(null);
  const user = useSelector((state) => state.userLogged);

  const { theme } = useTheme();

  useEffect(() => {
    if (theme) setMyTheme(theme);
  }, [theme]);

  const getUser = async () => {
    const user = await getMyUser();

    if (user && !user.error) {
      store.dispatch(setUserLogged(user));
    }
  };

  useEffect(() => {
    if (status === "authenticated") getUser();
    else if (status === "unauthenticated") store.dispatch(setUserLogged(null));
  }, [status]);

  return (
    <>
      <NextUINavbar maxWidth="xl" position="sticky" className="">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink className="flexjustify-start items-center gap-1" href="/">
              <div className="font-bold hidden md:flex">
                <Image
                  isBlurred
                  className="cover max-h-6 rounded-none"
                  src={
                    myTheme
                      ? `/logo-lg-${myTheme}.webp`
                      : "/logo-lg-default.webp"
                  }
                />
              </div>
              <div className="font-bold flex md:hidden">
                <Image
                  isBlurred
                  className="cover max-h-5 rounded-none"
                  src={
                    myTheme
                      ? `/logo-sm-${myTheme}.webp`
                      : "/logo-sm-default.webp"
                  }
                />
              </div>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="" justify="end">
          <NavbarItem className="flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="flex gap-2">
            <Link
              as={"a"}
              href="/estudiar"
              className="text-2xl font-normal text-default-600 rounded-full bg-transparent"
              variant="flat"
            >
              <Badge
                content={user?.stars ? user.stars.length : 0}
                color="primary"
                placement="bottom-right"
              >
                <PiStarFourFill className="text-primary-500 animated-star" />
              </Badge>
            </Link>
          </NavbarItem>
          <NavbarItem className="hidden md:flex gap-2">
            <InfoPopover />
          </NavbarItem>
          <NavbarItem className="hidden md:flex gap-2">
            {status === "authenticated" ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-sm font-normal text-default-600"
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
                      href={user ? `/profile/${user.username}` : "/profile"}
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
                className="text-sm font-normal text-default-600"
                variant="flat"
                onClick={onOpenChange}
              >
                Iniciar sesion
              </Button>
            )}
          </NavbarItem>

          <NavbarItem className="flex md:hidden gap-2">
            {status === "authenticated" ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-sm font-normal text-default-600 "
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
                      href={user ? `/profile/${user.username}` : "/profile"}
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
                className="text-sm font-normal text-default-600"
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
    if (username.length === 0 || password.length === 0) return;
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
                startContent={"@"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/*  <NextLink className="text-blue-400" href={"#"}>
                Olvidaste tu contrasena?
              </NextLink> */}
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
                <Button
                  auto
                  disabled={username.length === 0 || password.length === 0}
                  onPress={handleSubmit}
                >
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

function InfoPopover() {
  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <Button
          isIconOnly
          className="text-lg font-normal text-default-600"
          variant="flat"
        >
          <IoMdInformationCircleOutline />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small m-2">
            <Link
              color={"foreground"}
              href="/privacy"
              size="sm"
              target="_blank"
            >
              <p className="me-2">Políticas de privacidad</p>
              <FaExternalLinkAlt />
            </Link>
          </div>
          <div className="text-small m-2">
            <Link color={"foreground"} href="/terms" size="sm" target="_blank">
              <p className="me-2">Términos y condiciones</p>
              <FaExternalLinkAlt />
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
