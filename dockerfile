# Etapa de producción para el backend (Node.js)
FROM node:18 AS production

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json para instalar las dependencias del backend
COPY package.json package-lock.json ./

# Instalar todas las dependencias (incluyendo express)
RUN npm install

# Instalar dotenv (si no está en las dependencias)
RUN npm install dotenv

# Copiar los archivos del backend y del frontend ya construidos
COPY ./server ./server
COPY ./src ./src
COPY ./public ./public

# Copiar el archivo .env desde la carpeta src al contenedor
COPY ./src/.env ./src/.env

# Exponer el puerto en el que el servidor escucha
EXPOSE 5000

# Iniciar el backend (Node.js)
CMD ["node", "server/server.js"]
