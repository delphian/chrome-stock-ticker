PWD=`pwd`
if [[ "$PWD" == *"/scripts" ]]; then
  echo "Script must be run from repository base."
  exit 1
fi
if [ -d "libs/external" ]; then
  echo "Install script has already been run. Remove libs/external directory to run again."
  exit 1
fi

mkdir libs/external

echo "Downloading jquery"
mkdir libs/external/jquery
curl -L --progress-bar -o libs/external/jquery/jquery.min.js http://code.jquery.com/jquery-1.8.3.min.js

echo "Downloading angularjs"
mkdir libs/external/angular
curl -L --progress-bar -o libs/external/angular/angular.min.js  http://code.angularjs.org/1.2.2/angular.min.js

echo "Downloading angular-ui-utils"
cd libs/external
bower install angular-ui-utils\#v0.1.1
cd ../..

echo "Downloading bootstrap"
mkdir libs/external/bootstrap
curl -L --progress-bar -o libs/external/bootstrap/bootstrap.zip https://github.com/twbs/bootstrap/archive/v3.0.3.zip 
unzip libs/external/bootstrap/bootstrap.zip -d libs/external/bootstrap > /dev/null

echo "Namespacing bootstrap css"
lessc libs/cst-bootstrap.less > libs/cst-bootstrap.css
