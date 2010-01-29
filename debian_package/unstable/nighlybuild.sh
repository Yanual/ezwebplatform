#!/bin/bash
DATE=`date -u`
./create-debs.sh -nft nightlybuilt -m "Nightly built ${DATE}" -l /var/www/debian -bi