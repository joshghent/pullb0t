FROM node:11-alpine
LABEL maintainer="Josh Ghent <me@joshghent.com>"

RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN npm i && npm run build
EXPOSE 3000
CMD [ "npm", "start" ]
