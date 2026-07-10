FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN mkdir -p uploads

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
