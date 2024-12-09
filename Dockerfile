
FROM node:latest AS build

WORKDIR /money-be

COPY . /money-be

RUN npm install

COPY . .

EXPOSE 3000

CMD npm run start