FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

WORKDIR /app

COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs.nix

RUN nix-env -if .nixpacks/nixpkgs.nix && nix-collect-garbage -d

# Asegurar que NODE_ENV es development para instalar devDependencies
ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY . .

RUN chmod -R +x ./node_modules/.bin

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
