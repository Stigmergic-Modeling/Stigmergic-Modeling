#!/bin/bash

# change config.xml to deployment version
mv ./src/main/resources/config.xml ./src/main/resources/config_develop.xml
mv ./src/main/resources/config_deploy.xml ./src/main/resources/config.xml

# remove old target files
rm -rf ./target

# redeploy .war
mvn tomcat7:redeploy

# change config.xml back to development version
mv ./src/main/resources/config.xml ./src/main/resources/config_deploy.xml
mv ./src/main/resources/config_develop.xml ./src/main/resources/config.xml

# remove old target files again
rm -rf ./target

# restart tomcat to prevent memory from leaking
ssh root@115.28.38.84 "$(which bash) -s" << EOF
   /opt/apache-tomcat-8.0.32/bin/catalina.sh stop;
   /opt/apache-tomcat-8.0.32/bin/catalina.sh start;
EOF

