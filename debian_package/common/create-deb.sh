#!/bin/bash

usage() {
	echo "Usage:"
	echo -e "\t$0 <ezweb source directory> <version>\n"
}

usage_and_error() {
	echo -e "Error: $1\n"
	usage
  exit -1
}

###
# Check arguments
#
BASE_DIR="$(dirname $0)"

SRC_DIR="$1"
PKG_VERSION="$2"

if [ -z $SRC_DIR ] ; then
	usage_and_error "missing source directory argument"
fi

if [ -z $PKG_VERSION ] ; then
	usage_and_error "missing version argument"
fi

if [ ! -d $SRC_DIR ] ; then
	usage_and_error "$SRC_DIR is not a valid directory"
fi

###
# Clean .pyc files
#
rm -f $(find $SRC_DIR -name "*.pyc")

###
# Clean previous data
#
rm -rf $BASE_DIR/debian

###
# Create directory layout
#
mkdir -p $BASE_DIR/debian/usr/share/ezweb-platform
mkdir -p $BASE_DIR/debian/etc/ezweb-platform
mkdir -p $BASE_DIR/debian/etc/apache2/sites-available
mkdir -p $BASE_DIR/debian/etc/apache2/sites-enabled
mkdir -p $BASE_DIR/debian/DEBIAN

###
# Copy EzWeb contents
#
cp -r $SRC_DIR/* $BASE_DIR/debian/usr/share/ezweb-platform/
cp -r $BASE_DIR/django_restapi $BASE_DIR/debian/usr/share/ezweb-platform/

###
# Modify settings.py to insert parseable tags
#
cp $SRC_DIR/settings.py $BASE_DIR/tmp1
cat $BASE_DIR/tmp1 | sed s/DATABASE_ENGINE.*/"DATABASE_ENGINE = \"PKG_DBENGINE\""/g > $BASE_DIR/tmp2
cat $BASE_DIR/tmp2 | sed s/DATABASE_NAME.*/"DATABASE_NAME = \"PKG_DBNAME\""/g > $BASE_DIR/tmp3
cat $BASE_DIR/tmp3 | sed s/DATABASE_USER.*/"DATABASE_USER = \"PKG_DBUSER\""/g > $BASE_DIR/tmp4
cat $BASE_DIR/tmp4 | sed s/DATABASE_PASSWORD.*/"DATABASE_PASSWORD = \"PKG_DBPASSWD\""/g > $BASE_DIR/tmp5
cat $BASE_DIR/tmp5 | sed s/DATABASE_HOST.*/"DATABASE_HOST = \"PKG_DBHOST\""/g > $BASE_DIR/tmp6
cat $BASE_DIR/tmp6 | sed s/DATABASE_PORT.*/"DATABASE_PORT = \"PKG_DBPORT\""/g > $BASE_DIR/tmp7

cp $BASE_DIR/tmp7 $BASE_DIR/debian/usr/share/ezweb-platform/settings.py
rm $BASE_DIR/tmp*



###
# Copy maintainer files
#
cat $BASE_DIR/debian-control | sed s/"<vnumber>"/$PKG_VERSION/g > $BASE_DIR/debian/DEBIAN/control
cp $BASE_DIR/debian-templates $BASE_DIR/debian/DEBIAN/templates
cp $BASE_DIR/debian-postinst $BASE_DIR/debian/DEBIAN/postinst
cp $BASE_DIR/debian-prerm $BASE_DIR/debian/DEBIAN/prerm

###
# Copy Apache 2 virtual host config file
#
cp $BASE_DIR/apache-vhost $BASE_DIR/debian/etc/apache2/sites-available/ezweb-platform


###
# Create the Debian package
#
dpkg-deb --build $BASE_DIR/debian ezweb-platform-common_${PKG_VERSION}_all.deb

rm -rf $BASE_DIR/debian
