FROM node:14-alpine
EXPOSE 3000

# Set up base platform
RUN apk --no-cache add --update python3 make g++ curl

# Place files
ARG XCKAN_FRONTEND_SRC=https://github.com/NII-CPS-Center/sip2-ckan/archive/refs/tags/v0.9.20220328.tar.gz
RUN mkdir -p /home/node \ 
  && curl -sL ${XCKAN_FRONTEND_SRC} \
  | tar zx -C /home/node --strip-components 1

# Prepare node modules
WORKDIR /home/node/app/sip2-ckan/
RUN npm install

# Server configuration on build
ARG SERVER_HOST
ARG BACKEND_API
ARG API_LOG
RUN echo "SERVER_HOST: $SERVER_HOST"
RUN echo "BACKEND_API: $BACKEND_API"
RUN echo "API_LOG: $API_LOG"

# Build and start
RUN ["npm", "run", "build"]
CMD npm start
