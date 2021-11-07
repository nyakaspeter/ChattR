# Set context to the repo root directory

FROM node:16-alpine as build
WORKDIR /app
COPY ./client/package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install --production
COPY ./client .
RUN yarn build

FROM nginx:stable-alpine as prod
ENV PORT 80
ENV MAX_BODY_SIZE 52428800
ENV SERVER_URL http://server:5000
COPY --from=build /app/build /usr/share/nginx/html
COPY ./client/nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]