# syntax=docker/dockerfile:1
# Build from the repository root: the site reads the public results in /results at build time.
#   docker build -f web/Dockerfile -t tifinaghbench-web .

FROM node:24-alpine AS build
# Tailwind skips gitignored paths only inside a git repository; without one, the server build
# scans the client build's output in dist/ and its stylesheet hash no longer matches the client's.
RUN apk add --no-cache git
WORKDIR /repo/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY .gitignore /repo/.gitignore
RUN git init -q /repo
COPY results /repo/results
COPY web ./
RUN npm run build

# The site is fully prerendered: serve dist/client as static files.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/web/dist/client /usr/share/nginx/html
EXPOSE 8080
