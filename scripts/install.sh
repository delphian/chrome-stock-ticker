PWD=`pwd`
if [[ "$PWD" == *"/scripts" ]]; then
  echo "Script must be run from repository base."
  exit 1
fi
if [ -d "libs" ]; then
  echo "Install script has already been run. Remove libs directory to run again."
  exit 1
fi

mkdir libs
mkdir libs/jquery    && echo "Downloading jquery"    && curl --progress-bar -o libs/jquery/jquery.min.js     http://code.jquery.com/jquery-1.8.3.min.js
mkdir libs/angular && echo "Downloading angularjs" && curl --progress-bar -o libs/angular/angular.min.js http://code.angularjs.org/1.2.2/angular.min.js

