FROM node:20-alpine AS build
WORKDIR /app

# Accept build-time env vars for production URLs
ARG VITE_API_URL=http://localhost:5000
ARG VITE_GOOGLE_MAPS_API_KEY=

# Set them as env vars so Vite bakes them into the bundle
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
