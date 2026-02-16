FROM node:krypton-alpine3.22 as build

WORKDIR /app

COPY app/package.json app/package-lock.json ./

RUN npm ci

COPY app/ .

RUN npm run build


FROM nginx:alpine3.23-perl as production

RUN adduser -D -H -u 1001 -s /sbin/nologin webuser

COPY --from=build /app/dist /usr/share/nginx/html

RUN chown -R webuser:webuser /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chown -R webuser:webuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R webuser:webuser /var/run/nginx.pid && \
    chmod -R 777 /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

USER webuser
EXPOSE 80