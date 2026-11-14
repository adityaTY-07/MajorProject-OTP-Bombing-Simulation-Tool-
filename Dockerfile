FROM node:20-alpine

WORKDIR /app

# Copy root and backend package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install backend production dependencies
RUN npm --prefix backend install --omit=dev

# Copy application source code
COPY backend ./backend
COPY frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "--prefix", "backend", "start"]
