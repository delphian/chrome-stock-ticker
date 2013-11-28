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

echo "Downloading jquery"
mkdir libs/jquery
curl -L --progress-bar -o libs/jquery/jquery.min.js http://code.jquery.com/jquery-1.8.3.min.js

echo "Downloading angularjs"
mkdir libs/angular
curl -L --progress-bar -o libs/angular/angular.min.js  http://code.angularjs.org/1.2.2/angular.min.js

echo "Downloading bootstrap"
mkdir libs/bootstrap
curl -L --progress-bar -o libs/bootstrap/bootstrap.zip https://github.com/twbs/bootstrap/releases/download/v3.0.2/bootstrap-3.0.2-dist.zip 
unzip libs/bootstrap/bootstrap.zip -d libs/bootstrap

