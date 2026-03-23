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

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /tmp/nginx.conf.template

# Railway provides PORT env var; Docker Compose defaults to 3000
ENV PORT=3000

# Only substitute $PORT (not $uri etc.) then start nginx
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /tmp/nginx.conf.template > /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
