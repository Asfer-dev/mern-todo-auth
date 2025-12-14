# Stage 1: Build the app with all dependencies
FROM node:22-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the app with only production dependencies
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 5000
CMD ["node", "dist/index.js"]
