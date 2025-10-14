# Etapa de construcción
FROM node:20 AS builder
WORKDIR /app

# Copiar los archivos del proyecto
COPY . .

# Instalar dependencias y construir la app
RUN npm install
RUN npm run build

# Etapa final (más liviana)
FROM node:20-alpine
WORKDIR /app

# Copiar la carpeta "dist" generada en el build
COPY --from=builder /app/dist ./dist

# Copiar package.json y lock para preview
COPY package*.json ./
RUN npm install --omit=dev

# Exponer puerto interno
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "preview"]
