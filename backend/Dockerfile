FROM python:3.7-alpine
EXPOSE 5000

# Set up base platform
WORKDIR /app
ENV LC_CTYPE=C.UTF-8
RUN apk update
RUN apk add curl

# Download and extract source
ARG XCKAN_BACKEND_SRC=https://github.com/NII-CPS-Center/ckan-xsearch/archive/refs/tags/v0.9.20220328.tar.gz
RUN mkdir ckan-xsearch \
  && curl -sL ${XCKAN_BACKEND_SRC} \
  | tar zx -C ckan-xsearch --strip-components 1
WORKDIR /app/ckan-xsearch

# Install python environment
RUN pip install --upgrade pip setuptools
RUN pip install -r requirements.txt

# Set up Django application
ENV XCKAN_DB_ENGINE=django.db.backends.sqlite3
ENV XCKAN_DB_NAME=/ext/xckan.sq3
ENV XCKAN_ALLOWED_HOSTS=localhost
ENV XCKAN_CACHEDIR=/ext/cache
ENV XCKAN_LOGFILE=/ext/xckan.log
ENV XCKAN_QUERYLOGDIR=/ext/query_log
ENV XCKAN_SOLR=http://solr:8983/solr/ckan-xsearch

ENV DJANGO_SUPERUSER_PASSWORD=xckan
ENV DJANGO_SUPERUSER_USERNAME=xckan
ENV DJANGO_SUPERUSER_EMAIL=xckan@example.com

# Run script
WORKDIR /app/ckan-xsearch/django-backend
COPY entrypoint.sh /tmp
ENTRYPOINT ["/bin/sh", "/tmp/entrypoint.sh"]

