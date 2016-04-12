#!/bin/bash

if [ $1 = "dep" ]
then
    mv ./Gruntfile_deploy.js ./Gruntfile.js
    grunt
    mv ./Gruntfile.js ./Gruntfile_deploy.js
elif [ $1 = "dev" ]
then
    mv ./Gruntfile_develop.js ./Gruntfile.js
    grunt
    mv ./Gruntfile.js ./Gruntfile_develop.js
else
    echo "argument $1 not supported"
fi