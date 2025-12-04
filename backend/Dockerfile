FROM node:18-alpine

WORKDIR /app

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
