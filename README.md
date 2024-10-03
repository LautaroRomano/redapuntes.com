<h1 align="center">redapuntes.com</h1>
<p align="center"><img src="https://www.redapuntes.com/redapuntes.png"/></p> 

## Tabla de contenidos:
---

- [Descripción y contexto](#descripción-y-contexto)
- [Guía de usuario](#guía-de-usuario)
- [Guía de instalación](#guía-de-instalación)
- [Cómo contribuir](#cómo-contribuir)
- [Autor/es](#autores)
- [Licencia](#licencia)

## Descripción y contexto
---
Esta es una red social que permite a los alumnos de ciertas universidades compartir apuntes, trabajos practicos, parciales, etc. de las materias.

## Guía de usuario
---
🛠
 	
## Guía de instalación
---
Luego de clinar el proyecto en tu PC, debes seguir los siguientes pasos:

- instalar las librerias necesarias de node.js, para esto ejecuta el siguiente comando en tu terminal.

    npm intall
    
- Crea un archivo .env.local en tu directorio principal y debes asignarle las siguientes variables de entorno para cada uno de los servicios que  utiliza la aplicacion:

    NEXTAUTH_SECRET=

    PGSQL_HOST=
    PGSQL_DATABASE=
    PGSQL_USER=
    PGSQL_PASSWORD=
    PGSQL_PORT=

    HOST=http://localhost:3000
    NEXTAUTH_URL=http://localhost:3000

    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=

    OPEN_AI_API_KEY=
    
    RESEND_API_KEY=

    FIREBASE_TYPE=
    FIREBASE_PROJECT_ID=
    FIREBASE_PRIVATE_KEY_ID=
    FIREBASE_PRIVATE_KEY=
    FIREBASE_CLIENT_EMAIL=
    FIREBASE_CLIENT_ID=
    FIREBASE_AUTH_URI=
    FIREBASE_TOKEN_URI=
    FIREBASE_AUTH_PROVIDER_CERT_URL=
    FIREBASE_CLIENT_CERT_URL=
    FIREBASE_STORAGE_BUCKET=

- Crea una base de datos postgreSQL y utiliza el archivo de migracion /redapuntes.sql
- Para correr el proyecto en modo desarrollo debes ejercutar lo siguiente en tu terminar:

    npm run dev

## Cómo contribuir
---
¡Agradecemos sus contribuciones! Siga estos pasos:

Crea un fork de este repositorio.

Crea una nueva rama (git checkout -b feature/YourFeature).

haz un commit de tus cambios (git commit -m 'Add some feature').

haz un push en la rama (git push origin feature/YourFeature).

Abre una pull request.


## Autor/es
---

    Lautaro Romano https://github.com/LautaroRomano


## Licencia 
---

🛠

