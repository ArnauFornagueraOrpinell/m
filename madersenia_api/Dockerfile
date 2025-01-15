# Etapa de construcción
FROM node:18-bullseye AS build

WORKDIR /app

# Instalar herramientas necesarias
RUN apt-get update && apt-get install -y \
   make \
   gcc \
   g++ \
   python3 \
   python3-pip \
   libssl-dev \
   libbz2-dev \
   libcrypt-dev \
   libxml2-dev \
   wget \
   unzip \
   && rm -rf /var/lib/apt/lists/*

# Instalar npm más reciente y limpiar caché
RUN npm install -g npm@10.8.2 && npm cache clean --force

# Configurar variables de entorno para ibm_db
ENV IBM_DB_HOME=/app/clidriver
ENV LD_LIBRARY_PATH=${IBM_DB_HOME}/lib:$LD_LIBRARY_PATH

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias con resolución de conflictos
RUN npm install --unsafe-perm --legacy-peer-deps

# Instalar ibm_db con versión específica de clidriver
RUN npm install --unsafe-perm ibm_db -clidriver="v11.1.4"

# Copiar el resto de los archivos
COPY . .

# Etapa de producción
FROM node:18-bullseye-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y \
   make \
   gcc \
   g++ \
   python3 \
   python3-pip \
   libssl-dev \
   libbz2-dev \
   libcrypt-dev \
   libxml2-dev \
   wget \
   unzip \
   && rm -rf /var/lib/apt/lists/*

# Copiar archivos necesarios desde la etapa de build
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/clidriver /app/clidriver
COPY --from=build /app ./
COPY --from=build /app/data.txt ./
COPY --from=build /app/certs/server.crt /app/server.crt
COPY --from=build /app/certs/server.key /app/server.key

# Configurar variables de entorno para ibm_db en producción
ENV IBM_DB_HOME=/app/clidriver
ENV LD_LIBRARY_PATH=${IBM_DB_HOME}/lib:$LD_LIBRARY_PATH
ENV NODE_ENV=production

# Exponer el puerto que tu aplicación utiliza
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["node", "index.js"]