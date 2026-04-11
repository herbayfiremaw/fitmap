FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p uploads/venues uploads/avatars

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]
