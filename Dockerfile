FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY dist/ /usr/src/app/dist/
COPY scheduler.js /usr/src/app/
COPY api.js /usr/src/app/
COPY main.js /usr/src/app/
COPY data/ /usr/src/app/data/

RUN ls -la /usr/src/app/

EXPOSE 3002

CMD [ "npm", "run", "main" ]
