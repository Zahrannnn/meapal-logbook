# pull official base image (latest stable image [lts])
FROM node:latest AS builder 

# set working directory
WORKDIR /app

# install app dependencies
# copies the lockfile too, so the container installs exactly what CI verified
COPY package.json package-lock.json ./

# npm ci is deterministic: it fails on package.json/lockfile drift instead of
# silently re-resolving (a bare `npm install` once broke on a new react
# release conflicting with an unused scaffold dependency)
RUN npm ci

# Copies everything over to Docker environment
COPY . ./
RUN npm run build

#Stage 2
#######################################
#pull the official nginx:1.20.0 base image (latest stable image [lts])
FROM nginx:1.20.1  
#copies React to the container directory
# Set working directory to nginx resources directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static resources
RUN rm -rf ./*
# Copies static resources from builder stage
COPY --from=builder /app/dist .
COPY ./public .
# Containers run nginx with global directives and daemon off
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# COPY ../.env .env
COPY ./env.sh .

RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    chmod 755 /usr/share/nginx/html/env.sh

EXPOSE 80

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh > env.js && nginx -g \"daemon off;\""]

