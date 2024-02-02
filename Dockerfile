FROM node:20-alpine as builder

COPY ./ /var/lawplayer-homework
WORKDIR /var/lawplayer-homework

RUN npm install \
  && npm run build

FROM node:20-alpine

LABEL MAINTAINER="HARCHHI c2tnsuzi@gmail.com"

COPY --from=builder /var/lawplayer-homework/dist /var/lawplayer-homework/dist/
COPY --from=builder /var/lawplayer-homework/package.json /var/lawplayer-homework/
COPY --from=builder /var/lawplayer-homework/package-lock.json /var/lawplayer-homework/

WORKDIR /var/lawplayer-homework


RUN apk update \
  && apk add tzdata \
  && cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime \
  && apk del tzdata

RUN npm i --production \
  && npm cache clean -f

EXPOSE 3000

CMD ["npm", "run", "start:prod"]%