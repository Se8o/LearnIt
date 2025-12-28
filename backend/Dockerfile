FROM node:20-alpine

WORKDIR /app

# Instalovat build dependencies pro better-sqlite3
RUN apk add --no-cache python3 make g++

# Kopírovat package soubory
COPY package*.json ./

# Instalovat závislosti (včetně dev, potřebujeme nodemon pro docker-compose dev běh)
RUN npm ci

# Kopírovat aplikaci
COPY . .

# Exponovat port
EXPOSE 3001

# Spustit aplikaci (prod fallback; v docker-compose přepíšeme na npm run dev)
CMD ["npm", "start"]
