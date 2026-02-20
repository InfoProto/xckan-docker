#!/usr/bin/bash

# Initialize solr schema on every container start.
echo "Initializing solr schema..." > /ext/init.log
sleep 3
retry_count=0
max_retries=20
while true; do
  response=$(curl -sS -X POST -H 'Content-type:application/json' \
    --data-binary @/app/ckan-xsearch/xckan-schema.json \
    ${XCKAN_SOLR}/schema 2>&1)
  curl_status=$?

  if [ "$curl_status" -ne 0 ]; then
    retry_count=$((retry_count + 1))
    if [ "$retry_count" -ge "$max_retries" ]; then
      echo "Solr schema update curl failed after ${max_retries} retries. Exiting." >> /ext/init.log
      exit 1
    fi
    echo "Solr schema update request failed (${response}); retrying in 1 second..." >> /ext/init.log
    sleep 1
    continue
  fi

  if ! echo "$response" | grep -q '"responseHeader"[[:space:]]*:'; then
    retry_count=$((retry_count + 1))
    if [ "$retry_count" -ge "$max_retries" ]; then
      echo "Solr schema update did not return responseHeader after ${max_retries} retries. Exiting." >> /ext/init.log
      exit 1
    fi
    echo "Solr is not ready yet; retrying schema update in 1 second..." >> /ext/init.log
    sleep 1
    continue
  fi

  break
done

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
