FROM python:3.7-alpine

# Set up base platform
WORKDIR "/app"
ENV LC_CTYPE=C.UTF-8
RUN apk update

# Install python environment
ADD ./requirements.txt /tmp
RUN pip install --upgrade pip setuptools
RUN pip install -r /tmp/requirements.txt

# Set up Django application
ENV APP_HOST=0.0.0.0
ENV APP_PORT=5000
ENV XCKAN_SOLR=http://solr:8983/solr/ckan-xsearch
ENV XCKAN_ALLOWED_HOSTS=*
ENV XCKAN_DB_ENGINE=django.db.backends.sqlite3
ENV XCKAN_LOCKDIR=/tmp

# Output files to binding directories
ENV XCKAN_DB_NAME=/data/xckan.sq3
ENV XCKAN_LOGFILE=/cache/xckan.log
ENV XCKAN_CACHEDIR=/cache
ENV XCKAN_QUERYLOGDIR=/cache/query_log/

# Default start command
CMD python manage.py runserver $APP_HOST:$APP_PORT
