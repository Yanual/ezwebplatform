#!/bin/bash
DEFAULT_SVN_LOCATION="https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk"
REPO_DIR="/var/www/debian"
BRANCH="unstable"
BASE_VER="0.4"

fetch() {
  TMPDIR=`mktemp -d -p .`

  svn co $DEFAULT_SVN_LOCATION $TMPDIR
  if [ "$?" != "0" ]; then
    echo "  Error: SVN checkout failed."
    exit -2
  fi

  REVISION=`LC_ALL=C svn info $TMPDIR | grep "Revision: " | awk '{print $2}'`
  FULLVER=$BASE_VER"~svn$REVISION"
  COPYDIR="ezweb-platform-$FULLVER"
  if [ -e $COPYDIR ]; then
    echo "  Error: $COPYDIR already exists."
    rm -rf $TMPDIR
    exit -2
  fi

  svn export $TMPDIR $COPYDIR
  rm -rf $TMPDIR
}

parse_deb_fullver() {
  DEB_FULLVER=`head -1 "$1/debian/changelog" | cut -f2 -d\( | cut -f1 -d\)`
}

debianize() {
  if [ -z "$1" ]; then
    exit -2
  fi

  local FULVER COPYDIR

  FULLVER="$1"
  COPYDIR="ezweb-platform-$FULLVER"

  if [ -d $COPYDIR/debian ]; then
    LASTDIR=`pwd`

    cd "$COPYDIR"
    fakeroot make -f debian/rules clean
    cd "$LASTDIR"

    rm -rf $COPYDIR/debian
  fi

  tar -c $COPYDIR | gzip > ezweb-platform_$FULLVER.orig.tar.gz

  # Check if the version of the changelog match with the version we are packaging
  parse_deb_fullver .
  TMP_FULLVER=`echo $DEB_FULLVER | cut -f1 -d\-`

  if [ "$NEWVERSION" == 1 ]; then
    if [ "$FULLVER" != "$TMP_FULLVER" ]; then

      dch -v "$FULLVER-1"

      parse_deb_fullver .
      echo "$DEB_FULLVER" "@" "$FULLVER-1"
      if [ "$DEB_FULLVER" != "$FULLVER-1" ]; then
        exit -2
      fi
    else
      OLDDEB_FULLVER=$DEB_FULLVER

      dch -i

      parse_deb_fullver .
      if [ "$DEB_FULLVER" == "$OLD_DEB_FULLVER" ]; then
        exit -2
      fi
    fi
  else
    if [ "$FULLVER" != "$TMP_FULLVER" ]; then
      echo "  Error: changelog reports we are packaging version $TMP_FULLVER but we are packaging version $FULLVER."
      echo "  If you like to change the changelog to package this new version use the -n option."
      exit -2
    fi
  fi
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
  DEB_FULLVER=$1
  RET=`sudo reprepro -Vb $REPO_DIR listfilter $BRANCH "Package (== ezweb-platform), Version (== $DEB_FULLVER)"`
  if [ "x$RET" != "x" ]; then
    uninstallpkg
  fi
  sudo reprepro -Vb $REPO_DIR include $BRANCH ezweb-platform_$DEB_FULLVER_*.changes
}

NEWVERSION=0
case $1 in
  -n)
    NEWVERSION=1
    ;;
esac

REVISION=1584
FULLVER="$BASE_VER~svn$REVISION"
COPYDIR="ezweb-platform-$FULLVER"

fetch
debianize $FULLVER
build $COPYDIR
installpkg $DEB_FULLVER
