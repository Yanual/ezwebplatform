#!/bin/bash
DEFAULT_SVN_LOCATION="https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk"
REPO_DIR="/var/www/debian"
BRANCH="unstable"

fetch() {
  TMPDIR=`mktemp -d -p .`

  svn co $DEFAULT_SVN_LOCATION $TMPDIR
  if [ "$?" != "0" ]; then
    echo "  Error: SVN checkout failed."
    exit -2
  fi

  REVISION=`LC_ALL=C svn info $TMPDIR | grep "Revision: " | awk '{print $2}'`
  COPYDIR="ezweb-platform-$REVISION"
  if [ -e $COPYDIR ]; then
    echo "  Error: $COPYDIR already exists."
    rm -rf $TMPDIR
    exit -2
  fi

  svn export $TMPDIR $COPYDIR
  rm -rf $TMPDIR
  svn export debian $COPYDIR/debian
}

build() {
  echo "Building package from $1"
  if [ ! -d "$1" ]; then
    echo "  Error: $1 does not exist"
    exit -2
  fi

  cd $1
  dpkg-buildpackage
  cd ..
}

uninstallpkg() {
  LIST="ezweb-platform \
    ezweb-platform-apache2-common \
    ezweb-platform-apache2-fastcgi \
    ezweb-platform-apache2-mod-python \
    ezweb-platform-common \
    ezweb-platform-fastcgi-common \
    ezweb-platform-lighttpd-common \
    ezweb-platform-lighttpd-fastcgi \
    ezweb-platform-mysql \
    ezweb-platform-postgres \
    ezweb-platform-sqlite3"

  sudo reprepro -Vb $REPO_DIR remove $BRANCH $LIST
}

installpkg() {
  REVISION=$1
  FULLVER="0.2~svn$REVISION"
  RET=`sudo reprepro -Vb $REPO_DIR listfilter $BRANCH "Package (== ezweb-platform), Version (== $FULLVER)"`
  if [ "x$RET" != "x" ]; then
    uninstallpkg $REVISION
  fi
  sudo reprepro -Vb $REPO_DIR include $BRANCH ezweb-platform_$FULLVER_*.changes
}

REVISION=1431
COPYDIR="ezweb-platform-$REVISION"

#fetch
build $COPYDIR
installpkg $REVISION