# Install Polymer CLI, https://www.polymer-project.org/3.0/docs/tools/polymer-cli
FROM node

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   git \
	&& rm -rf /var/lib/apt/lists/*
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN npm install -g polymer-cli --unsafe-perm
COPY . .
COPY --chown=node:node . .
RUN npm install && npm build:dev
USER node
EXPOSE 8081
CMD ["polymer", "serve", "-H", "0.0.0.0", "-p", "8080"]