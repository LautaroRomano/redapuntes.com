'use client';
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Link, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaGoogle } from "react-icons/fa";
import NextLink from "next/link";
import { title } from "@/components/primitives";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSucces] = useState(false)
  const [error, setError] = useState(false)

  const router = useRouter()

  const { data: session, status } = useSession()

  useEffect(() => {
    if(status==='authenticated') router.push('/')
  }, [status])

  const handleSubmit = async () => {
    try {
      await signIn('credentials', { username, password })
      setSucces(true)
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error)
      setError(true)
    }
  };

  if (status === 'loading')
    return (
      <div className="flex justify-center items-center w-full gap-4 flex-col">
        <Spinner />
        <h1 className={''}>Cargando...</h1>
      </div>
    )

  if (status === 'authenticated')
    return (
      <div className="flex justify-center items-center w-full gap-4 flex-col">
        <Spinner />
        <h1 className={''}>Usted ya inicio sesion, Redirigiendo...</h1>
      </div>
    )

  return (
    <div className="w-full">
      <h1 className={title()}>Ingresar a tu cuenta</h1>
      <Card className="mb-4 w-full my-5">

        <CardHeader className="justify-center">
          <div className="flex gap-5 w-full">
            <div className="flex flex-col gap-1 items-center justify-center w-full my-2">
              <h5 className="text-small tracking-tight text-default-400">Ingresa con Google</h5>
              <Button
                className={""}
                color="primary"
                radius="none"
                size="md"
                variant={"solid"}
                onPress={() => { }}
                startContent={<FaGoogle />}
              >
                Google
              </Button>
              <div className="flex w-full items-center gap-2">
                <div className="bg-gray-600 h-[1px] w-full"></div>
                <h5>O</h5>
                <div className="bg-gray-600 h-[1px] w-full"></div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-3 py-0 text-small text-default-400 items-center gap-2">
          <Input
            placeholder="Usuario o email"
            value={username}
            startContent={'@'}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {
            error &&
            <h5 className="text-red-600">Ocurrio un error: {error}</h5>
          }

          {success ?
            <Button
              as={Link}
              href="/"
              color="success"
              startContent={<FaCheckCircle />}
              className="w-full max-w-xs mb-5 mt-2"
            >
              Listo
            </Button>
            :
            <Button
              onPress={handleSubmit}
              color="primary"
              size="md"
              className="w-full max-w-xs mb-5 mt-2"
            >
              Iniciar sesion
            </Button>
          }

          <NextLink className="text-blue-400" href={'#'}>Olvidaste tu contrasena?</NextLink>
          <NextLink className="flex justify-start items-center gap-1" href="/register">No tienes cuenta? <p className="text-blue-400">Registrate aqui!</p></NextLink>


        </CardBody>

      </Card >
    </div>
  );
}
