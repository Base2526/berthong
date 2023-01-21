#!/bin/bash

mongoimport --db bl --collection user --file user
mongoimport --db bl --collection bank --file bank
mongoimport --db bl --collection role --file role
mongoimport --db bl --collection basicContent --file basicContent.json --jsonArray