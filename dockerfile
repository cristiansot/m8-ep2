# Etapa de construcción para el frontend (React)
FROM node:18 AS build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json ./

# Instalar las dependencias del frontend
RUN npm install

# Copiar todo el código fuente de la app al contenedor
COPY . .

# Construir la app de React
RUN npm run build

# Etapa de producción para el backend (Node.js)
FROM node:18 AS production

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el backend y las dependencias
COPY package.json package-lock.json ./
RUN npm install --production

# Copiar el código del backend
COPY server ./server
COPY src ./src

# Exponer el puerto donde el backend escucha
EXPOSE 5000

# Iniciar la app del backend
CMD ["node", "server/server.js"]
