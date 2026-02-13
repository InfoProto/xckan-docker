# syntax = docker/dockerfile:1.2
FROM node:25-alpine
EXPOSE 3000

# Set up base platform
RUN apk --no-cache add --update python3 make g++ curl

# Prepare node modules
RUN mkdir -p /home/node
COPY ./app /home/node/app
WORKDIR /home/node/app/sip2-ckan/
RUN --mount=type=cache,target=/root/.npm npm install

# Server configuration on build
RUN echo "SERVER_PORT: $SERVER_PORT"
RUN echo "SERVER_HOST: $SERVER_HOST"
RUN echo "NUXT_BACKEND_API_BASE_URL: ${NUXT_BACKEND_API_BASE_URL}"
RUN echo "NUXT_PUBLIC_BACKEND_API_BASE_URL: ${NUXT_PUBLIC_BACKEND_API_BASE_URL}"
RUN echo "NUXT_PUBLIC_FRONTEND_WEB_BASE_URL: ${NUXT_PUBLIC_FRONTEND_WEB_BASE_URL}"

# Build and start
RUN ["npm", "run", "build"]
CMD node .output/server/index.mjs
