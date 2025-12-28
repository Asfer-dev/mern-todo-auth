FROM node:20-alpine

WORKDIR /e2e
COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "test:e2e"]
