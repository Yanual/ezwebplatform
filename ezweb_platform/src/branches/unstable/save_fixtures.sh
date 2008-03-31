#!/bin/bash

python ./manage.py dumpdata --format=xml --indent=4 connectable auth admin contenttypes sessions sites  > connectable/fixtures/initial_data.xml
python ./manage.py dumpdata --format=xml --indent=4 gadget > gadget/fixtures/initial_data.xml
python ./manage.py dumpdata --format=xml --indent=4 igadget > igadget/fixtures/initial_data.xml
python ./manage.py dumpdata --format=xml --indent=4 resource > resource/fixtures/initial_data.xml
python ./manage.py dumpdata --format=xml --indent=4 tag > tag/fixtures/initial_data.xml
python ./manage.py dumpdata --format=xml --indent=4 workspace > workspace/fixtures/initial_data.xml




