#!/bin/bash

./manage.py dumpdata --format=xml --indent=4 connectable > connectable/fixtures/initial_data.xml
./manage.py dumpdata --format=xml --indent=4 gadget > gadget/fixtures/initial_data.xml
./manage.py dumpdata --format=xml --indent=4 igadget > igadget/fixtures/initial_data.xml


