#/bin/sh

cp -p aws/awscli_setup.sh backend/awscli_setup.sh
cat << 'EOF' >> backend/Dockerfile


# Setup AWS CLI
COPY awscli_setup.sh /tmp
RUN chmod +x /tmp/awscli_setup.sh && /tmp/awscli_setup.sh
ARG XCKAN_SITEMAP_URL
ARG XCKAN_SITEMAP_DIR
ENV XCKAN_SITEMAP_URL=${XCKAN_SITEMAP_URL}
ENV XCKAN_SITEMAP_DIR=${XCKAN_SITEMAP_DIR}
EOF