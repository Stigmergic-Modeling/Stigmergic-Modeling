ssh root@115.28.38.84 "$(which bash) -s" << EOF
   /opt/apache-tomcat-8.0.32/bin/catalina.sh stop;
   /opt/apache-tomcat-8.0.32/bin/catalina.sh start;
EOF