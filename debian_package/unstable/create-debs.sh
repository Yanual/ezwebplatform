#!/bin/bash
DEFAULT_SVN_LOCATION="https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk"
REPO_DIR="/var/www/debian"
BRANCH="unstable"
BASE_VER="0.4"
DUPLOAD_SERVER="europa"

BASE_DIR=`pwd`

fetch() {
  if [ -n "$1" ]; then
    REVISION=$1
    FULLVER=$BASE_VER"~svn$REVISION"
    ORIG_FILE="$BASE_DIR/ezweb-platform_$FULLVER.orig.tar.gz"

    if [ -f $ORIG_FILE ]; then
      echo "  Using existing file \"$ORIG_FILE\""
      return
    elif [ -e $ORIG_FILE ]; then
      echo "  Error: $ORIG_FILE already exists, but it is not usable. Delete or move it an rerun this script."
      exit -2
    else
      TMP_DIR=`mktemp -d`
      COPYDIR="ezweb-platform-$FULLVER"

      cd "$TMP_DIR"

      svn export -r "$REVISION" $DEFAULT_SVN_LOCATION $COPYDIR
      if [ "$?" != "0" ]; then
        echo "  Error: SVN checkout failed."
        exit -2
      fi
      tar -c $COPYDIR | gzip > "$ORIG_FILE"

      cd "$BASE_DIR"

      rm -rf $TMP_DIR
    fi
  else
    REVISION=`LC_ALL=C svn info $DEFAULT_SVN_LOCATION | grep "Revision: " | awk '{print $2}'`
    FULLVER=$BASE_VER"~svn$REVISION"
    ORIG_FILE="ezweb-platform_$FULLVER.orig.tar.gz"

    if [ -f $ORIG_FILE ]; then
      echo "  Using existing file \"$ORIG_FILE\""
      return
    elif [ -e $ORIG_FILE ]; then
      echo "  Error: $ORIG_FILE already exists, but it is not usable. Delete or move it an rerun this script."
      exit -2
    else
      TMP_DIR=`mktemp -d`
      COPYDIR="ezweb-platform-$FULLVER"

      cd "$TMP_DIR"

      svn export $DEFAULT_SVN_LOCATION $COPYDIR
      if [ "$?" != "0" ]; then
        echo "  Error: SVN checkout failed."
        exit -2
      fi
      tar -c $COPYDIR | gzip > "$ORIG_FILE"

      cd "$BASE_DIR"

      rm -rf $TMP_DIR
    fi
  fi
}

parse_deb_fullver() {
  DEB_FULLVER=`head -1 "$1/debian/changelog" | cut -f2 -d\( | cut -f1 -d\)`
  DEB_VERSION=`echo $DEB_FULLVER | cut -f1 -d\-`
  DEB_MAINVER=`echo $DEB_VERSION | cut -f1 -d~`
  DEB_SVNREV=`echo $DEB_VERSION | cut -f2 -dn`
}

prepare() {
  if [ -z "$1" ]; then
    exit -2
  fi

  local FULLVER COPYDIR

  FULLVER="$1"
  COPYDIR="ezweb-platform-$FULLVER"
  rm -rf $COPYDIR

  ORIG_FILE="$BASE_DIR/ezweb-platform_$FULLVER.orig.tar.gz"
  tar xfz $ORIG_FILE

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
  cd $BASE_DIR
}

if [ -z "$DUPLOAD_SERVER" ]; then
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
else
  uninstallpkg() {
    echo "Debian packages can not be uninstalled using dupload"
  }

  installpkg() {
    DEB_FULLVER=$1
    dupload -t $DUPLOAD_SERVER ezweb-platform_${DEB_FULLVER}_*.changes
  }
fi


#
# Main script
#

NEWVERSION=0
PARSEDEBCONF=1
for ARG in "$@"; do
  case $ARG in
  -n)
    NEWVERSION=1
    ;;
  -i)
    INSTALL=1
    ;;
  -b)
    BUILD=1
    ;;
  esac
done

if [ -z "$BUILD" -a -z "$INSTALL" ]; then
  BUILD=1
fi

if [ "$NEWVERSION" == 1 ]; then
  fetch
  DEB_VERSION=$FULLVER
  DEB_FULLVER="$FULLVER-1"
elif [ "$PARSEDEBCONF" == 1 ]; then
  parse_deb_fullver .
  COPYDIR="ezweb-platform-$DEB_VERSION"
  fetch $DEB_SVNREV
else
  echo "ERROR: Unsupported operation."
  exit -2
fi

if [ "$BUILD" = 1 ]; then
  prepare $DEB_VERSION
  build $COPYDIR
fi

if [ "$INSTALL" = 1 ]; then
  installpkg $DEB_FULLVER
fi
