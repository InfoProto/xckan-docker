FROM python:3.7-alpine
EXPOSE 5000

# Set up base platform
WORKDIR /app
ENV LC_CTYPE=C.UTF-8
RUN apk update
RUN apk add curl zip

# Download and extract source
ARG XCKAN_ZIP_URL=https://www2.info-proto.com/xckan/ckan-xsearch-develop.zip
RUN curl -X GET ${XCKAN_ZIP_URL} -o /tmp/ckan-xsearch.zip
RUN unzip /tmp/ckan-xsearch.zip -d /app
WORKDIR /app/ckan-xsearch-develop

# Install python environment
RUN pip install --upgrade pip setuptools
RUN pip install -r requirements.txt

# Set up Django application
ENV XCKAN_DB_ENGINE=django.db.backends.sqlite3
ENV XCKAN_DB_NAME=/ext/xckan.sq3
ENV XCKAN_ALLOWED_HOSTS=*
ENV XCKAN_CACHEDIR=/ext/cache
ENV XCKAN_SOLR=http://solr:8983/solr/ckan-xsearch

ENV DJANGO_SUPERUSER_PASSWORD=xckan
ENV DJANGO_SUPERUSER_USERNAME=xckan
ENV DJANGO_SUPERUSER_EMAIL=xckan@example.com

# Run script
WORKDIR /app/ckan-xsearch-develop/django-backend
COPY entrypoint.sh /tmp
ENTRYPOINT ["/bin/sh", "/tmp/entrypoint.sh"]

