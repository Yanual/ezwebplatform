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
COMMON_DIR="$BASE_DIR/../common"

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
cp -r $COMMON_DIR/django_restapi $BASE_DIR/debian/usr/share/ezweb-platform/

###
# Modify settings.py to use Sqlite3
#
cp $SRC_DIR/settings.py $BASE_DIR/tmp1
cat $BASE_DIR/tmp1 | sed s/DATABASE_ENGINE.*/"DATABASE_ENGINE = \"sqlite3\""/g > $BASE_DIR/tmp2
cat $BASE_DIR/tmp2 | sed s/DATABASE_NAME.*/"DATABASE_NAME = \"\/var\/lib\/ezweb-platform\/db\""/g > $BASE_DIR/tmp3

cp $BASE_DIR/tmp3 $BASE_DIR/debian/usr/share/ezweb-platform/settings.py
rm tmp1 tmp2 tmp3

###
# Copy control file
#
cp $BASE_DIR/debian-control debian/DEBIAN/control

###
# Copy Apache 2 virtual host config file
#
cp $COMMON_DIR/apache-vhost $BASE_DIR/debian/etc/apache2/sites-available/ezweb-platform

###
# Copy post install script
#
cp $BASE_DIR/debian-postinst $BASE_DIR/debian/DEBIAN/postinst

###
# Create the Debian package
#
dpkg-deb --build $BASE_DIR/debian $BASE_DIR/ezweb-platform-sqlite3_${PKG_VERSION}_all.deb

rm -rf debian
