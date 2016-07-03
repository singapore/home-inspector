FROM node:5.12.0

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
