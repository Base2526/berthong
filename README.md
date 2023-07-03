# berthong
docker-compose -f docker-compose.ui.yml build
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.prod.yml build

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
3. mongosh เข้าไปเพื่อสร้าง user admin 
   3.1  use admin
   3.2  db.createUser({
            user: "",
            pwd: "",
            roles: [ { role: 'root', db: 'admin' } ]
        });

         <!-- db.createUser({
            user: "",
            pwd: "",
            roles: [ { role: 'readWrite', db: 'berthong' } ]
        }); -->

4. exit แล้วเรา mongosh -u xxxx -p yyyy เพือ login auth
       <!-- db.createUser({
            user: "",
            pwd: "",
            roles: [ { role: 'readWrite', db: 'bl' } ]
        }); -->

        basic command
        - use xxx 
        - db.getUsers()

Backup
https://davejansen.com/how-to-dump-restore-a-mongodb-database-from-a-docker-container/

docker exec -i a67d48abfccf /usr/bin/mongodump --username xxxx --password xxxx --authenticationDatabase admin --db bl --port 29101 --out /dump
docker exec -i mongo /usr/bin/mongodump --username xxxx --password xxxx --db bl --port xxxx --out /dump

CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

MONGO_VERSION=xxxx
MONGO_INITDB_ROOT_USERNAME=xxxx
MONGO_INITDB_ROOT_PASSWORD=xxxx
MONGO_INITDB_DATABASE=xxxx
MONGO_INITDB_USERNAME=xxxx
MONGO_INITDB_PASSWORD=xxxx
MONGO_PORT=xxxx

# Google Login
REACT_APP_GOOGLE_CLIENT_ID=xxxx

# Facebook app id
REACT_APP_FACEBOOK_APPID=xxxx

# HOST_GRAPHAL
# REACT_APP_HOST_GRAPHAL=xxxx

#   - ELASTIC_URL=xxxx
#   - ELASTIC_USERNAME=xxxx
#   - ELASTIC_PASSWORD=xxxx
#   - ELASTIC_INDEX=xxxx

# frontend
REACT_APP_NODE_ENV=development
REACT_APP_HOST_GRAPHAL=xxxx
FRONTEND_PORT=xxxx

# graphql
RA_HOST=http://xxxx/
GRAPHQL_PORT=4001
JWT_SECRET=xxxx

# github
GITHUB_URL_OAUTH_ACCESS_TOKEN=https://github.com/login/oauth/access_token
GITHUB_URL_OAUTH_USER=https://api.github.com/user
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx 

# google analytics 4
REACT_APP_GOOGLE_ANALYTICS4=xxxx



Login with LINE
https://por-porkaew15.medium.com/implement-line-login-with-angular-project-e2e598d3c618