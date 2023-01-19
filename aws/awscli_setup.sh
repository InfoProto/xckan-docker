#/bin/sh

apk add aws-cli

mkdir /root/.aws
cat << 'EOF' > /root/.aws/config
[default]
region = ap-northeast-1
output = json
EOF