FROM node:14-alpine

EXPOSE 4001:4001/tcp

WORKDIR /server
ADD . /server

RUN npm install

CMD ["npm", "run", "start"]