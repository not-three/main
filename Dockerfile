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
RUN cp -r .output /app/SERVER_OUTPUT

RUN pnpm generate
RUN cp -r .output/public /app/CLIENT_OUTPUT

RUN mkdir /app/SERVER_OUTPUT/public/node_modules && \
    mkdir /app/CLIENT_OUTPUT/node_modules && \
    cp -r node_modules/monaco-editor-workers /app/SERVER_OUTPUT/public/node_modules/monaco-editor-workers && \
    cp -r node_modules/monaco-editor /app/CLIENT_OUTPUT/node_modules/monaco-editor

### Production Image
FROM node:20-alpine
LABEL maintainer="Joschua Becker EDV <support@scolasti.co>"

WORKDIR /app
COPY --from=build /app/SERVER_OUTPUT /app
COPY --from=build /app/CLIENT_OUTPUT /app/client
ENTRYPOINT ["node", "server/index.mjs"]
