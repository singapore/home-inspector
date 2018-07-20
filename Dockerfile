FROM node:4.9.1@sha256:41d0ad2557ea2a9e57e1a458c1d659e92f601586e07dcffef74c9cef542f6f6e

# Create app directory
RUN mkdir -p /usr/src/home-inspector
WORKDIR /usr/src/home-inspector

# Bundle app source
COPY package.json /usr/src/home-inspector

# Install app dependencies
RUN npm -q install && npm cache clean

# Bundle app source
COPY lib /usr/src/home-inspector/lib

ENV PATH /usr/src/home-inspector/node_modules/.bin:$PATH

ENTRYPOINT [ "node", "lib" ]
