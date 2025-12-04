FROM node:20-alpine

WORKDIR /app

# Kopírovat package soubory
COPY package*.json ./

# Instalovat závislosti
RUN npm ci

# Kopírovat aplikaci
COPY . .

# Exponovat port
EXPOSE 3000

# Spustit dev server
CMD ["npm", "run", "dev"]
