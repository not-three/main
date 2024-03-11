### Build Image
FROM node:20-alpine as build

RUN npm i -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

### Production Image
FROM node:20-alpine
LABEL maintainer="Joschua Becker EDV <support@scolasti.co>"

WORKDIR /app
COPY --from=build /app/.output ./
ENTRYPOINT ["node", "server/index.mjs"]
