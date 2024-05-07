FROM node:20.12 as builder

WORKDIR /work
COPY package.json package-lock.json ./
RUN npm i --force

COPY . .

ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

FROM nginx:1.25

WORKDIR /usr/share/nginx/html
COPY --from=builder /work/build .

CMD ["nginx", "-g", "daemon off;"]
