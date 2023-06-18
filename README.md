# berthong
docker-compose -f docker-compose.ui.yml build
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.prod.yml build

mongoimport --uri mongodb://root:b9be11166d72e9e3ae7fd407165e4bd2@mongo:29101/berthong --collection role --file role

mongoimport --db dbName --collection collectionName --file fileName.json

mongoimport --uri 127.0.0.1:27099 --db berthong --collection role --file role
mongoimport --host "127.0.0.1" --port "27099" --db berthong --collection bank --file bank

mongoimport --host "hostname" --port "port" --db "databasename" --collection "collectionName" --file "filePath"

mongoimport --host "127.0.0.1" --port "29101" --db berthong --collection role --file role

การ manage user role
1. เราต้อง edit mongod.conf
    security:
        authorization: "enabled"
    
    จะมี file ตัวอย่าง
    mouth 
    - ./mongod.conf:/etc/mongod.conf

2. docker exec -it xxxx bash
3. mongosh {mongosh --port xxxx }เข้าไปเพื่อสร้าง user admin 
   3.1  use admin
   3.2  db.createUser({
            user: "root",
            pwd: "b9be11166d72e9e3ae7fd407165e4bd2",
            roles: [ { role: 'root', db: 'admin' } ]
        });

         <!-- db.createUser({
            user: "berthong",
            pwd: "6c09093474284f6bfc3749a5bd24cbb6",
            roles: [ { role: 'readWrite', db: 'berthong' } ]
        }); 
        
        db.createUser({
            user: "root",
            pwd: "b9be11166d72e9e3ae7fd407165e4bd2",
            roles: [ { role: 'readWrite', db: 'berthong' } ]
        });
        -->

4. exit แล้วเรา mongosh -u xxxx -p yyyy เพือ login auth
       <!-- db.createUser({
            user: "banlistinfo",
            pwd: "6c09093474284f6bfc3749a5bd24cbb6",
            roles: [ { role: 'readWrite', db: 'bl' } ]
        }); -->

        basic command
        - use xxx 
        - db.getUsers()

Backup
https://davejansen.com/how-to-dump-restore-a-mongodb-database-from-a-docker-container/

docker exec -i a67d48abfccf /usr/bin/mongodump --username banlistinfo --password 6c09093474284f6bfc3749a5bd24cbb6 --authenticationDatabase admin --db bl --port 29101 --out /dump
docker exec -i mongo /usr/bin/mongodump --username banlistinfo --password 6c09093474284f6bfc3749a5bd24cbb6 --db bl --port 29101 --out /dump


CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

MONGO_VERSION=6.0.1
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=b9be11166d72e9e3ae7fd407165e4bd2
MONGO_INITDB_DATABASE=berthong
MONGO_INITDB_USERNAME=berthong
MONGO_INITDB_PASSWORD=6c09093474284f6bfc3749a5bd24cbb6
MONGO_PORT=27017

# Google Login
REACT_APP_GOOGLE_CLIENT_ID=1094203865843-jqaj9am4tevtocg75tdirmtkh95k27cb.apps.googleusercontent.com

# Facebook app id
REACT_APP_FACEBOOK_APPID=448400870781752

# HOST_GRAPHAL
# REACT_APP_HOST_GRAPHAL=banlist.info

#   - ELASTIC_URL=http://elasticsearch:9200
#   - ELASTIC_USERNAME=elastic
#   - ELASTIC_PASSWORD=changeme
#   - ELASTIC_INDEX=banlist_dev

# frontend
REACT_APP_NODE_ENV=development
REACT_APP_HOST_GRAPHAL=localhost:4001
FRONTEND_PORT=3000

# graphql
RA_HOST=http://localhost:4001/
GRAPHQL_PORT=4001
JWT_SECRET=banlistinfo

# github
GITHUB_URL_OAUTH_ACCESS_TOKEN=https://github.com/login/oauth/access_token
GITHUB_URL_OAUTH_USER=https://api.github.com/user
GITHUB_CLIENT_ID=04e44718d32d5ddbec4c
GITHUB_CLIENT_SECRET=dd1252dea6ec4d05083dc2c2cd53def7be4a9033 

# google analytics 4
REACT_APP_GOOGLE_ANALYTICS4=G-M8LZ0N9TRY

Login with LINE
https://por-porkaew15.medium.com/implement-line-login-with-angular-project-e2e598d3c618