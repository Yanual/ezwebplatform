#!/bin/bash
DEFAULT_SVN_LOCATION="https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk"
REPO_DIR="/var/www/debian"
BRANCH="experimental"
BASE_VER="0.4"
DUPLOAD_SERVER="europa-experimental"

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

      echo "Creating $ORIG_FILE ..."

      tar -c $COPYDIR | gzip > "$ORIG_FILE"
      mv $ORIG_FILE $BASE_DIR

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

      echo "Creating $ORIG_FILE ..."

      tar -c $COPYDIR | gzip > "$ORIG_FILE"
      mv $ORIG_FILE $BASE_DIR

      cd "$BASE_DIR"

      rm -rf $TMP_DIR
    fi
  fi
}

parse_deb_fullver() {
  DEB_FULLVER=`head -1 "$1/debian/changelog" | cut -f2 -d\( | cut -f1 -d\)`
  DEB_BRANCH=`head -1 "$1/debian/changelog" | cut -f2 -d\) | cut -f1 -d\;`
  DEB_BRANCH=`echo $DEB_BRANCH | sed 's/^[[:space:]]*\(.*\)[[:space:]]*$/\1/'`
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


  echo "Extracting code from origin file..."

  ORIG_FILE="$BASE_DIR/ezweb-platform_$FULLVER.orig.tar.gz"
  tar xfz $ORIG_FILE

  # Check if the version of the changelog match with the version we are packaging
  parse_deb_fullver .
  TMP_FULLVER=$DEB_VERSION
  TMP_BRANCH=$DEB_BRANCH

  if [ "$NEWVERSION" == 1 ]; then
    if [ "$FULLVER" != "$TMP_FULLVER" ]; then

      DCHCOMMAND="dch -v ${FULLVER}-1 -D ${BRANCH}"
      if [ "$FORCE" == 1 ]; then
         DCHCOMMAND="${DCHCOMMAND} --force-distribution"
      fi

      if [ -n "$MESSAGE" ]; then
         DCHCOMMAND="${DCHCOMMAND} ${MESSAGE}"
      fi
      $DCHCOMMAND

      parse_deb_fullver .
      if [ "$DEB_FULLVER" != "$FULLVER-1" ]; then
        exit -2
      fi
    else
      OLDDEB_FULLVER=$DEB_FULLVER

      DCHCOMMAND="dch -D ${BRANCH}"
      if [ "$FORCE" == 1 ]; then
         DCHCOMMAND="${DCHCOMMAND} --force-distribution"
      fi

      if [ -n "$MESSAGE" ]; then
         DCHCOMMAND="${DCHCOMMAND} ${MESSAGE}"
      fi
      echo $DCHCOMMAND

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

    if [ "$BRANCH" != "$TMP_BRANCH" ]; then
      echo "  Error: changelog reports we are creating packages for \"$TMP_BRANCH\" but we are packaging for \"$BRANCH.\""
      echo "  If you like to change the changelog to package this new version use the -n option and use the -t flag."
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

ispkgbuilded() {
  DEB_FULLVER=$1
  ls -1 ezweb-platform_${DEB_FULLVER}_*.changes 2&> /dev/null
  [ "$?" == "0" ]
  echo $?
}

uninstallpkg() {
  if [ -z "$DUPLOAD_SERVER" ]; then
    sudo reprepro -Vb $REPO_DIR removesrc $BRANCH "ezweb-platform" $1
  else
    echo "Debian packages can not be uninstalled using dput"
  fi
}

installpkg() {
  if [ -z "$DUPLOAD_SERVER" ]; then
    DEB_FULLVER=$1
    RET=`sudo reprepro -Vb $REPO_DIR listfilter $BRANCH "Source (== ezweb-platform), Version (== $DEB_FULLVER)"`
    if [ "x$RET" != "x" ]; then
      uninstallpkg $DEB_FULLVER
    fi
    sudo reprepro -Vb $REPO_DIR include $BRANCH ezweb-platform_${DEB_FULLVER}_*.changes
  else
    DEB_FULLVER=$1
    dput $DUPLOAD_SERVER ezweb-platform_${DEB_FULLVER}_*.changes
  fi
}

usage()
{
cat << EOF
usage: $0 options

OPTIONS:
   -h            Show this message
   -b            Build packages
   -f            Force
   -i            Install packages
   -t branch     Override default branch
   -l repo-path  Install on the the local repo found at repo-path

EOF
}

#
# Main script
#

NEWVERSION=0
PARSEDEBCONF=1
FORCE=0
MESSAGE=""
while getopts "hncbfm:t:l:i" ARG; do
  case $ARG in
  h)
    usage
    exit 1
    ;;
  n)
    NEWVERSION=1
    ;;
  f)
    FORCE=1
    ;;
  i)
    INSTALL=1
    ;;
  b)
    BUILD=1
    ;;
  m)
    MESSAGE=$OPTARG
    ;;
  t)
    BRANCH=$OPTARG
    ;;
  l)
    REPO_DIR=$OPTARG
    unset DUPLOAD_SERVER

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
  BRANCH=$DEB_BRANCH
  COPYDIR="ezweb-platform-$DEB_VERSION"
  fetch $DEB_SVNREV
else
  echo "ERROR: Unsupported operation."
  exit -2
fi

if [ "$BUILD" == 1 -o \( "$INSTALL" = 1 -a `ispkgbuilded $DEB_FULLVER` == 0 \) ]; then
  prepare $DEB_VERSION
  build $COPYDIR
fi

if [ "$INSTALL" == 1 ]; then
  installpkg $DEB_FULLVER
fi
