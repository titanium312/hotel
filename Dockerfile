FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

WORKDIR /app

COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs.nix
COPY . /app

RUN nix-env -if .nixpacks/nixpkgs.nix && nix-collect-garbage -d

RUN --mount=type=cache,id=node_modules-cache,target=/root/.npm npm ci

RUN chmod -R +x node_modules/.bin

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
