# X(Cross)CKAN System

2022-03-31 sagara@info-proto.com

- Configuration

    The system stores the collected metadata in a file tree.
    It also maintains an index for metadata retrieval in Solr.
    These data are stored outside the container so that
    they will not be lost when the Docker container is closed.

    The storage location is specified in the `volumes` section
    of `docker-compose.yml`. Please change it as necessary.

    If not changed, data will be stored in the following locations.
    - Solr data : `./volumes/solr`
    - Collected metadata : `./volumes/backend_cache`
    - Registered sites : `./volumes/backend_db`

    If you are finished using this system and no longer want to use
    the collected metadata and indexes, you can delete './volumes'.

        % rm -rf ./volumes

- Before starting the service

    Before starting the service with Docker, create directories
    for data storage. Also, give permission to the services
    running on the container to write files to these directories.

        % mkdir -p volumes/backend_db/ volumes/backend_cache/ volumes/solr/
        % chmod -R a+w volumes/

- Start service

    Start the service with the following command.
    Please add `-d` as it will be running in the background.

        % docker-compose up -d

- Initialization (run only for the first time)

    When the Solr service is started, the core `ckan-xsearch`
    for this system is automatically created, but you must
    define the schema with the following command.

        % curl -X POST -H 'Content-type:application/json' \
          --data-binary @../xckan-schema.json \
          http://localhost:28983/solr/ckan-xsearch/schema

    Next, initialize the database to be used for the backend service
    and create an administrator account.

        % docker-compose exec backend python /app/manage.py migrate
        % docker-compose exec backend python /app/manage.py collectstatic --noinput
        % docker-compose exec -it backend python /app/manage.py createsuperuser

    The last `createsuperuser` sets the username, email address, and password for the administrator account, so please remember them.
    If you forget them, you can run this command again to add an other
    administrator account.

- Web interface

    Open `http://<server>:25000/` in your browser.
    `<server>` is the name or IP address of the server running
    the Docker service. 
    If you have a browser open on the machine running the Docker service,
    you can access it at `http://localhost:25000/`.
    
    Click "ログイン" link at the top-right corner, and 
    input username/password which was created at `createsuperuser`.

    Once logged in, click on "CKANサイト一覧" link in the top menu.
    A list of registered sites will be displayed here.

    Press the "Import" button in the upper left corner and upload
    the `xckan_sitelist.json` file, located in the same directory
    as this README, to register sites in bulk.

    If you prefer to register individual sites, go to
    the "Django Admin Site" by clicking on the "管理サイト" link
    in the upper right corner.
    You can register and edit sites and users here.

    The imported sites are not updatable, to be sure.
    Select any site from the list and press the "検査" button.
    If the site is accessible, it will be set as updatable.

    If you want to change the update start date and time,
    or the update interval, you can go to the Django administration site
    by pressing the "管理" button.

- Update site metadata (whenever desired)

    Once you have registered your sites and set them as updatable,
    you can collect metadata and update the index at any time.
    Execute the following command

        % docker-compose exec -it backend python /app/manage.py runscript update

    To periodically update the metadata, this command should be executed
    at regular intervals, e.g., by cron.

- Check log file

    Errors that occur during the execution of this system and
    logs of updates are saved in a file in the following path.

        ckan-xsearch/django-backend/xckan/logs/xckan.log

    If you wish to change the output level or format of the log,
    edit the configuration file in the following path

        ckan-xsearch/django-backend/xckan/logging.json

- Access Solr Admintool

    Although not normally necessary, you may access the
    Solr Administration Tool if you wish to directly view
    the raw data or search results registered in Solr.

    Open `http://<server>:28983/solr/` and select `ckan-xsearch`
    under "Core Selecter" in the left menu.

- XCKAN API

    You can access the WebAPI at the following URLs.

    - List metadata : Returns a list of registered metadata IDs

        http://<server>:25000/api/package_list

    - Show metadata : Returns detailed metadata with a given ID

        http://localhost:25000/api/package_show?id=<id>

    - Search metadata : Returns a list of metadata that matches the criteria

        http://localhost:25000/api/package_search?q=%E6%96%B0%E5%9E%8B%E3%82%B3%E3%83%AD%E3%83%8A&start=0&rows=50&sort=score+desc

- Stop service

    The following command will stop services running in the background.

        % docker-compose down

- Restart service

    To restart a service once it has been stopped, simply execute
    the following command. No other steps are required.

        % docker-compose up -d

- Initialize service

    If you wish to delete collected metadata and registered sites
    for debugging or other purposes, and initialize the system status,
    follow the steps below.

        % docker-compose down
        % docker image rm docker_backend solr
        % rm -rf volumes/

    If you have a newer version of this system, use git to　obtain
    the new version.

        % git pull

    This returns the system to its latest and initial state. 
    Then, perform the procedure again from "Before starting the service"
    section.
