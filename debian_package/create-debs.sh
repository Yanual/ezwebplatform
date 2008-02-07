#!/bin/bash

usage() {
	echo "Usage:"
	echo -e "\t$0 <ezweb source directory> [<version>]\n"
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

if [ ! -d $SRC_DIR ] ; then
	usage_and_error "$SRC_DIR is not a valid directory"
fi

###
# Calculate package version (if not given)
#
if [ -z $PKG_VERSION ]; then
	rev=$(svn info $SRC_DIR | head -n 5 | tail -n 1 | cut -d: -f2)

	rev2=$(echo $rev) # This bullshit is for trimming the string

	PKG_VERSION="0.1~svn$rev2"
fi

###
# Call each package script
bash $BASE_DIR/common/create-deb.sh $SRC_DIR $PKG_VERSION
bash $BASE_DIR/sqlite/create-deb.sh $PKG_VERSION
bash $BASE_DIR/postgres/create-deb.sh $PKG_VERSION
bash $BASE_DIR/meta/create-deb.sh $PKG_VERSION


