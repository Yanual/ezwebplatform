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
# Call each package script
bash $BASE_DIR/common/create-deb.sh $SRC_DIR $PKG_VERSION
bash $BASE_DIR/sqlite/create-deb.sh $PKG_VERSION
bash $BASE_DIR/postgres/create-deb.sh $PKG_VERSION
bash $BASE_DIR/meta/create-deb.sh $PKG_VERSION


