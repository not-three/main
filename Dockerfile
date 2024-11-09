### Build Image
FROM node:20-alpine as build

RUN npm i -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL

RUN pnpm build
RUN cp -rL .output /app/SERVER_OUTPUT

RUN pnpm generate
RUN cp -rL .output/public /app/CLIENT_OUTPUT

### Production Image
FROM node:20-alpine
LABEL maintainer="Joschua Becker EDV <support@scolasti.co>"

WORKDIR /app
COPY --from=build /app/SERVER_OUTPUT /app
COPY --from=build /app/CLIENT_OUTPUT /app/client
ENTRYPOINT ["node", "server/index.mjs"]
