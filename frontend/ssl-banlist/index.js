import { createServer } from "http";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import jwt from 'jsonwebtoken';
import * as fs from "fs";

import {User} from './model'
import connection from './mongo' 
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import pubsub from './pubsub'

const path = require('path');

const {
    GraphQLUpload,
    graphqlUploadExpress, // A Koa implementation is also exported.
  } = require('graphql-upload');

// const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

let logger = require("./utils/logger");
let PORT = process.env.PORT || 4000;

async function startApolloServer(typeDefs, resolvers) {

    // Create schema, which will be used separately by ApolloServer and
    // the WebSocket server.
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Create an Express app and HTTP server; we will attach the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);

    // Set up WebSocket server.
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql",
    });

    const getDynamicContext = async (ctx, msg, args) => {
        // ctx is the graphql-ws Context where connectionParams live
       if (ctx.connectionParams.authToken) {
            //   const currentUser = await findUser(connectionParams.authentication);
            //   return { currentUser };

            try {
                let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);

                // code
                // -1 : foce logout
                //  0 : anonymums
                //  1 : OK

                // {status: true, code: 1, data}

                let currentUser = await User.findById(userId)
                
                // console.log("currentUser >> " , currentUser._id)
                return {...ctx, currentUser} 
            } catch(err) {
                // logger.error(err.toString());
                console.log(">> ", err.toString())
            }
        }
        // Otherwise let our resolvers know we don't have a current user

        // console.log("getDynamicContext :", ctx.connectionParams.authToken)

        return { ...ctx, currentUser: null };
    };

    const serverCleanup = useServer({ 
            schema,
            context: (ctx, msg, args) => {
                // Returning an object will add that information to our
                // GraphQL context, which all of our resolvers have access to.

                return getDynamicContext(ctx, msg, args);
            },
            onConnect: async (ctx) => {
                // Check authentication every time a client connects.
                // if (tokenIsNotValid(ctx.connectionParams)) {
                //   // You can return false to close the connection  or throw an explicit error
                //   throw new Error('Auth token missing!');
                // }
                // 
                logger.info(ctx.connectionParams);

                if (ctx.connectionParams.authToken) {
                    try {
                        let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
                        let result = await User.updateOne({ _id: userId }, { $set: { isOnline: true }})

                        if(result.ok){
                            pubsub.publish("CONVERSATION", {
                                conversation:{
                                  mutation: 'CONNECTED',
                                  data: userId
                                }
                            });
                        }
                        
                    } catch(err) {
                        logger.error(err.toString());
                    } 
                }
            },
            onDisconnect: async (ctx, code, reason) =>{
                logger.info(ctx.connectionParams);
                if (ctx.connectionParams.authToken) {
                    try {
                        let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
                        let result =  await User.updateOne({ _id: userId }, { $set: { isOnline: false } })

                        if(result.ok){
                            pubsub.publish("CONVERSATION", {
                                conversation:{
                                mutation: 'DISCONNECTED',
                                data: ""
                                }
                            });
                        }
                    } catch(err) {
                        logger.error(err.toString());
                    }
                }
            }
        }, 
        wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        uploads: false, // add this
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),
        
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                return {
                    async drainServer() {
                    await serverCleanup.dispose();
                    },
                };
                },
            },

            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],

        // subscriptions: {
        //     // path: "/subscriptions",
        //     onConnect: () => {
        //       console.log("Client connected for subscriptions");
        //     },
        //     onDisconnect: () => {
        //       console.log("Client disconnected from subscriptions");
        //     },
        // },

        context: async ({ req }) => {
            // console.log("ApolloServer context ", req.headers)

            // https://daily.dev/blog/authentication-and-authorization-in-graphql
            // throw Error("throw Error(user.msg);");

            // const decode = jwt.verify(token, 'secret');

            if (req.headers && req.headers.authorization) {
                var auth    = req.headers.authorization;
                var parts   = auth.split(" ");
                var bearer  = parts[0];
                var token   = parts[1];

                if (bearer == "Bearer") {
                    // let decode = jwt.verify(token, process.env.JWT_SECRET);

                    try {
                        let userId  = jwt.verify(token, process.env.JWT_SECRET);

                        // code
                        // -1 : foce logout
                        //  0 : anonymums
                        //  1 : OK

                        // {status: true, code: 1, data}

                        let currentUser = await User.findById(userId)
                        
                        // console.log("context >> " , data._id)
                        return {...req, currentUser} 
                    } catch(err) {
                        logger.error( err.toString() );
                    }
                }
            }
            return {...req, currentUser: null}
        }
    });
  
    await server.start();
    
    // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

    server.applyMiddleware({ 
        app , 
        cors: {
            origin: true,
            credentials: true,
        },
        bodyParserConfig: {
            limit:"50mb"
        } 
    });

    
    app.use(express.static(path.join(__dirname, "/app/uploads")));

    // Now that our HTTP server is fully set up, actually listen.
    httpServer.listen(PORT, () => {
        console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`);
    });
}

startApolloServer(typeDefs, resolvers) 