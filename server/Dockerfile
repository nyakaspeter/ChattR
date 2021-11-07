# Set context to the repo root directory

FROM node:16-alpine
ENV PORT 5000
WORKDIR /app
COPY ./server/package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install --production
COPY ./server .
EXPOSE ${PORT}
CMD ["yarn", "start"]