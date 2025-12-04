# Docker Setup

## Instalace Dockeru

### macOS
1. Stáhněte Docker Desktop: https://www.docker.com/products/docker-desktop
2. Nainstalujte a spusťte Docker Desktop
3. Ověřte instalaci: `docker --version`

### Alternativa: Homebrew
```bash
brew install --cask docker
```

## Rychlý start

```bash
# Spustit celou aplikaci
docker-compose up -d

# Sledovat logy
docker-compose logs -f

# Zastavit aplikaci
docker-compose down
```

## Přístup k aplikaci

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Dokumentace: http://localhost:3001/api-docs

## Užitečné příkazy

```bash
# Rebuild kontejnerů (po změně dependencies)
docker-compose up -d --build

# Restart konkrétního servisu
docker-compose restart backend
docker-compose restart frontend

# Zobrazit běžící kontejnery
docker-compose ps

# Zobrazit logy konkrétního servisu
docker-compose logs -f backend
docker-compose logs -f frontend

# Připojit se do kontejneru
docker-compose exec backend sh
docker-compose exec frontend sh

# Smazat vše včetně volumes
docker-compose down -v
```

## Vývoj

Všechny změny v kódu se automaticky projeví díky volume mountům:
- Backend: automatický restart při změnách
- Frontend: hot reload díky Next.js

## Troubleshooting

### Port už je používán
```bash
# Zjistit, co běží na portu
lsof -i:3000
lsof -i:3001

# Zabít proces
kill -9 <PID>
```

### Rebuild po změně package.json
```bash
docker-compose down
docker-compose up -d --build
```

### Smazat a začít znovu
```bash
docker-compose down -v
docker-compose up -d --build
```
