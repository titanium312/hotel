FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

WORKDIR /app

# Copiar nixpacks correctamente
COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs.nix

RUN nix-env -if .nixpacks/nixpkgs.nix && nix-collect-garbage -d

# Copiar solo package.json y package-lock.json primero para caché
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Dar permiso de ejecución a binarios en node_modules
RUN chmod -R +x ./node_modules/.bin

# Construir el proyecto
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
