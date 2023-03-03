# Build Stage
FROM node:alpine AS BUILD_IMAGE

RUN apk update && apk add yarn curl bash && rm -rf /var/cache/apk/*
RUN curl -sfL https://gobinaries.com/tj/node-prune | sh

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN npm prune --production
RUN /usr/local/bin/node-prune

# Main Stage
FROM node:alpine

RUN apk update && apk add yarn curl bash && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 3001 3003
CMD ["node" , "dist/main.js"]
