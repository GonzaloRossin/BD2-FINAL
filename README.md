# BD2-FINAL

## Instrucciones de instalacion

### Instalar dependencias
Correr `npm install` en el root del proyecto

### Levantar un mongodb (docker o local)

En el puerto default de mongodb (27017), levantar una base de datos con nombre BD2Final. Para ello ejecutar los siguientes comandos en una terminal.

`docker pull mongo`
`docker run --name Mymongo –p 27017:27017 -d mongo`

Luego usar `docker stop Mymongo` para apagar el contenedor y `docker start Mymongo` para iniciarlo nuevamente.

### Ultimo paso
Ultimo paso antes de iniciar chequear que el archivo .env tenga seteadas correctamente las variables de entorno. Deberia verse asi.

`DB_NAME = BD2Final
DB_URL = mongodb://localhost:27017/BD2Final
PORT = 7070
COLLECTION_USERS = users
COLLECTION_DOCUMENTS = documents`

### Iniciar el servidor
Asegurarse primero que el contenedor de docker para mongodb este corriendo y finalmente, ingresar a la carpeta src del proyecto con `cd src` y luego correr el servidor con `node .`.
