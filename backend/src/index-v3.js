const { ApolloServer, gql } = require('apollo-server-express');
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";

import {fileRenamer} from "./utils"

// import typeDefs from "./typeDefs";
// import resolvers from "./resolvers";

const path = require('path');
const http = require('http');


const {
    GraphQLUpload,
    graphqlUploadExpress, // A Koa implementation is also exported.
  } = require('graphql-upload');

const { ApolloServerPluginLandingPageLocalDefault } = require('apollo-server-core');

const typeDefs = gql`
  scalar Upload
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  type Query {
    getFiles: [String!]
  }
  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    getFiles: async function () {
      // if (fs.existsSync('files')) {
      //   const files = fs.readdirSync('files');
      //   return files.map((n) => `http://localhost:5000/files/${n}`);
      // } else return [];
      return [];
    },
  },
  Mutation: {
    singleUpload: async function (root, { file }) {
      const { createReadStream, filename, encoding, mimetype } = await file;
      // const stream = createReadStream();

      const stream = createReadStream();
      const assetUniqName = fileRenamer(filename);
      let pathName = `/files/${assetUniqName}`;

      const output = fs.createWriteStream(pathName)
      stream.pipe(output);

      await new Promise(function (resolve, reject) {
        output.on('close', () => {
          resolve();
        });
  
        output.on('error', (err) => {
          logger.error(err.toString());

          reject(err);
        });
      });

      // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;

      return { filename, mimetype, encoding };
      /*
      fs.mkdirSync(path.join(__dirname, 'files'), { recursive: true });

      const output = fs.createWriteStream(
        path.join(
          __dirname,
          'files',
          `${randomBytes(6).toString('hex')}_${filename}`
        )
      );

      stream.pipe(output);

      await new Promise(function (resolve, reject) {
        output.on('close', () => {
          console.log('File uploaded');
          resolve();
        });

        output.on('error', (err) => {
          console.log(err);
          reject(err);
        });
      });

      return { filename, mimetype, encoding };
      */
    },
  },
};

async function startServer() {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({ 
                                  schema,
                                  // Using graphql-upload without CSRF prevention is very insecure.
                                  csrfPrevention: true,
                                  cache: 'bounded',
                                  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })], 
                                  // subscriptions: {
                                  //     onConnect: (connectionParams, webSocket, context) => {
                                  //       console.log('connect...');
                                  //     },
                                  //     onDisconnect: (webSocket, context) => {
                                  //       console.log('disconnect...');
                                  //     },
                                  // },  

                                  context: ({ req, connection }) => {
                                    console.log("context :",connection);
                                    return {};
                                  },
                                  subscriptions: {
                                    onConnect: async (connectionParams, webSocket) => {
                                      console.log('xxx');
                                      console.log(connectionParams);
                                    },
                                    onDisconnect: (webSocket, context) => {
                                        console.log('disconnect...');
                                    },
                                  },
                                });

  const app = express();
    
  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());

  app.use('/files', express.static(path.join(__dirname, 'files')));

  await server.start();

  // server.applyMiddleware({ app });
  server.applyMiddleware({
      app,
      // cors: {credentials: true, origin: true},

      // // By default, apollo-server hosts its GraphQL endpoint at the
      // // server root. However, *other* Apollo Server packages host it at
      // // /graphql. Optionally provide this to match apollo-server.
      // path: '/'
  });

  /*
  // There is no need to explicitly define the 'path' option in
  // the configuration object as '/graphql' is the default endpoint
  // If you planned on using a different endpoint location,
  // this is where you would define it.
  server.applyMiddleware({ app, cors: corsOptions });
  */

  // The `listen` method launches a web server.
  // server.listen().then(({ url }) => {
  //   console.log(`🚀  Server ready at ${url}`);
  // });

  
  await new Promise((r) => app.listen({ port: 5000 }, r));
  console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath} - ${server}`);
  // console.log(server)

  app.get('/health', (req, res) => {
    res.status(200).send('Okay!');
  });
}

startServer();

/*
async function startServer() {
    const server = new ApolloServer({
        //   typeDefs,
        //   resolvers,
        schema,
        // Using graphql-upload without CSRF prevention is very insecure.
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    });
    await server.start();
  
    const app = express();
  
    // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress());
  
    // server.applyMiddleware({ app });
    server.applyMiddleware({
        app,
   
        // By default, apollo-server hosts its GraphQL endpoint at the
        // server root. However, *other* Apollo Server packages host it at
        // /graphql. Optionally provide this to match apollo-server.
        path: '/'
     });
  
    await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
  
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startServer();
*/
