#!/bin/bash
DEFAULT_SVN_LOCATION="https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk"
REPO_DIR="/var/www/debian"
BRANCH="unstable"
BASE_VER="0.4"

fetch() {
  if [ -n "$1" ]; then
    REVISION=$1
    FULLVER=$BASE_VER"~svn$REVISION"
    COPYDIR="ezweb-platform-$FULLVER"

    if [ -d $COPYDIR ]; then
#      LOCAL_REVISION=`LC_ALL=C svn info $COPYDIR | grep "Revision: " | awk '{print $2}'`
#      if [ "$LOCAL_REVISION" != "$REVISION" ]; then
#        echo "  Error: $COPYDIR is not usable. Move or delete it and re-run this script."
#        exit -2
#      fi
      echo "  Warning: using existing directory \"$COPYDIR\""
      return
    elif [ -e $COPYDIR ]; then
      echo "  Error: $COPYDIR already exists."
      exit -2
    else
      svn export -r "$REVISION" $DEFAULT_SVN_LOCATION $COPYDIR
      if [ "$?" != "0" ]; then
        echo "  Error: SVN checkout failed."
        exit -2
      fi
    fi
  else
    REVISION=`LC_ALL=C svn info $DEFAULT_SVN_LOCATION | grep "Revision: " | awk '{print $2}'`
    FULLVER=$BASE_VER"~svn$REVISION"
    COPYDIR="ezweb-platform-$FULLVER"
    if [ -d $COPYDIR ]; then
#      LOCAL_REVISION=`LC_ALL=C svn info $COPYDIR | grep "Revision: " | awk '{print $2}'`
#      if [ "$LOCAL_REVISION" != "$REVISION" ]; then
#        echo "  Error: $COPYDIR is not usable. Move or delete it and re-run this script."
#        exit -2
#      fi
      echo "  Warning: using existing directory \"$COPYDIR\""
      return
    elif [ -e $COPYDIR ]; then
      echo "  Error: $COPYDIR already exists."
      exit -2
    else
      svn export $DEFAULT_SVN_LOCATION $COPYDIR
      if [ "$?" != "0" ]; then
        echo "  Error: SVN checkout failed."
        exit -2
      fi
    fi
  fi
}

parse_deb_fullver() {
  DEB_FULLVER=`head -1 "$1/debian/changelog" | cut -f2 -d\( | cut -f1 -d\)`
  DEB_VERSION=`echo $DEB_FULLVER | cut -f1 -d\-`
  DEB_MAINVER=`echo $DEB_VERSION | cut -f1 -d~`
  DEB_SVNREV=`echo $DEB_VERSION | cut -f2 -dn`
}

debianize() {
  if [ -z "$1" ]; then
    exit -2
  fi

  local FULLVER COPYDIR

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
  TMP_FULLVER=$DEB_VERSION

  if [ "$NEWVERSION" == 1 ]; then
    if [ "$FULLVER" != "$TMP_FULLVER" ]; then

      dch -v "$FULLVER-1"

      parse_deb_fullver .
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
  RET=$?
  if [ "$RET" != "0" -a "$RET" != 1 ]; then
    cd ..
    echo "  Error: Debian packages build failed."
    exit -2
  fi
  cd ..
}

uninstallpkg() {
  sudo reprepro -Vb $REPO_DIR removesrc $BRANCH "ezweb-platform" $1
}

installpkg() {
  DEB_FULLVER=$1
  RET=`sudo reprepro -Vb $REPO_DIR listfilter $BRANCH "Source (== ezweb-platform), Version (== $DEB_FULLVER)"`
  if [ "x$RET" != "x" ]; then
    uninstallpkg $DEB_FULLVER
  fi
  sudo reprepro -Vb $REPO_DIR include $BRANCH ezweb-platform_${DEB_FULLVER}_*.changes
}


#
# Main script
#

NEWVERSION=0
PARSEDEBCONF=1
case $1 in
  -n)
    NEWVERSION=1
    ;;
esac

if [ "$NEWVERSION" == 1 ]; then
  fetch
  DEB_VERSION=$FULLVER
  DEB_FULLVER="$FULLVER-1"
elif [ "$PARSEDEBCONF" == 1 ]; then
  parse_deb_fullver .
  COPYDIR="ezweb-platform-$DEB_VERSION"

  if [ -e $COPYDIR ]; then
    if [ ! -d $COPYDIR ]; then
      echo "ERROR: \"$COPYDIR\" exists, but it is not a directory."
      exit -2
    fi
  else
    fetch $DEB_SVNREV
  fi
else
  echo "ERROR: Unsupported operation."
  exit -2
fi

debianize $DEB_VERSION
build $COPYDIR
#uninstallpkg $DEB_FULLVER
installpkg $DEB_FULLVER
