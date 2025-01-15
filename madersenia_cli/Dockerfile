# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copia los archivos del proyecto al contenedor
COPY . .

# Instala las dependencias
RUN pnpm install

# Construye el proyecto
RUN pnpm run build
# Etapa de producción
FROM nginx:alpine
RUN mkdir -p /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/ssl

# Copia el contenido construido al directorio de Nginx
COPY --from=build /app/dist/spa /usr/share/nginx/html 
COPY --from=build /app/certs/server.crt /etc/nginx/ssl/nginx-selfsigned.crt
COPY --from=build /app/certs/server.key /etc/nginx/ssl/nginx-selfsigned.key
# Elimina la configuración predeterminada de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nginx.conf al directorio de configuración de Nginx
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Generar certificados SSL autofirmados
# RUN apk add --no-cache openssl && \
#     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout /etc/nginx/ssl/nginx-selfsigned.key \
#     -out /etc/nginx/ssl/nginx-selfsigned.crt \
#     -subj "/C=US/ST=State/L=City/O=Organization/OU=Org Unit/CN=localhost"


# Exponer el puerto 443 para HTTPS
EXPOSE 443

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
