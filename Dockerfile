FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run cert:generate

EXPOSE 8443
CMD ["node", "server.js"]
