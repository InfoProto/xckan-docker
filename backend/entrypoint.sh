#!/bin/sh

# Check if solr collection is exsiting

if [ ! -e "/ext/init.log" ]; then
  echo "Initialize..." > /ext/init.log
  echo "Making migrations." >> /ext/init.log
  python manage.py makemigrations
  echo "Migrating." >> /ext/init.log
  python manage.py migrate
  echo "Collecting static files." >> /ext/init.log
  python manage.py collectstatic --noinput
  echo "Creating superuser." >> /ext/init.log
  python manage.py createsuperuser --noinput
  echo "Creating collection." >> /ext/init.log
  sleep 5  # Wait for the solr server
  curl -X POST -H 'Content-type:application/json' \
    --data-binary @/app/ckan-xsearch/xckan-schema.json \
    ${XCKAN_SOLR}/schema
  echo `date` >> /ext/init.log
else
  echo "Collecting static files."
  python manage.py collectstatic
fi

python manage.py runserver 0.0.0.0:5000
