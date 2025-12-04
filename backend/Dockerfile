FROM node:20-alpine

WORKDIR /app

# Instalovat build dependencies pro better-sqlite3
RUN apk add --no-cache python3 make g++

# Kopírovat package soubory
COPY package*.json ./

# Instalovat závislosti
RUN npm ci --only=production

# Kopírovat aplikaci
COPY . .

# Exponovat port
EXPOSE 3001

# Spustit aplikaci
CMD ["npm", "start"]
