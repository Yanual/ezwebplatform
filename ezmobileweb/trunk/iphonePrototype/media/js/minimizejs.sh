#!/bin/bash

rm tmp.js 2> /dev/null
rm ezweb.js 2> /dev/null
cd ..
for f in `find js/ -name *.js`
do
	cat $f >> tmp.js
	echo "" >> tmp.js
	echo $f;
done
java -jar js/compressor.jar tmp.js > js/ezweb.js
rm tmp.js 2> /dev/null
