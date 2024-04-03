#!/usr/bin/bash

# Check if solr collection is exsiting.
if [ ! -f "/ext/schema_initialized" ]; then
  echo "Initializing solr schema..." > /ext/init.log
  sleep 5  # Wait for the solr server
  curl -X POST -H 'Content-type:application/json' \
    --data-binary @/app/ckan-xsearch/xckan-schema.json \
    ${XCKAN_SOLR}/schema
  echo `date` >> /ext/schema_initialized
fi

# Update Django models and static files.
echo "Initializing database..." > /ext/init.log
echo "Making migrations." >> /ext/init.log
python manage.py makemigrations
echo "Migrating." >> /ext/init.log
python manage.py migrate
echo "Collecting static files." >> /ext/init.log
python manage.py collectstatic --noinput
echo "Creating superuser." >> /ext/init.log
python manage.py createsuperuser --noinput
echo "Creating collection." >> /ext/init.log

# Launch server.
python manage.py runserver 0.0.0.0:5000
