import { createServer } from "http";
import express from "express";
import bodyParser from "body-parser";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import jwt from 'jsonwebtoken';

import {User, Session} from './model'
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import pubsub from './pubsub'

require('./mongo');
require('../cron-jobs.js');

const path = require('path');

const {
    GraphQLUpload,
    graphqlUploadExpress, // A Koa implementation is also exported.
  } = require('graphql-upload');

// const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

let logger = require("./utils/logger");
let PORT = process.env.GRAPHQL_PORT || 4000;

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
    //    if (ctx.connectionParams.authToken) {
    //         //   const currentUser = await findUser(connectionParams.authentication);
    //         //   return { currentUser };

    //         try {
    //             let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);

    //             // code
    //             // -1 : foce logout
    //             //  0 : anonymums
    //             //  1 : OK

    //             // {status: true, code: 1, data}

    //             let currentUser = await User.findById(userId)
                
    //             // console.log("currentUser >> " , currentUser._id)
    //             return {...ctx, currentUser} 
    //         } catch(err) {
    //             // logger.error(err.toString());
    //             console.log(">> ", err.toString())
    //         }
    //     }
        // Otherwise let our resolvers know we don't have a current user

        // console.log("getDynamicContext :", ctx.connectionParams.authToken)

        return { ...ctx, currentUser: null };
    };

    const serverCleanup = useServer({ 
            schema,
            context: (ctx, msg, args) => {
                // Returning an object will add that information to our
                // GraphQL context, which all of our resolvers have access to.

                // console.log("serverCleanup :", ctx, msg, args)

                return getDynamicContext(ctx, msg, args);
            },
            onConnect: async (ctx) => {
                console.log("onConnect :", ctx.connectionParams)
            //     // Check authentication every time a client connects.
            //     // if (tokenIsNotValid(ctx.connectionParams)) {
            //     //   // You can return false to close the connection  or throw an explicit error
            //     //   throw new Error('Auth token missing!');
            //     // }
            //     // 
            //     // console.log("onConnect : ", ctx.connectionParams.authToken)
            //     // console.log("onConnect textHeaders : ", ctx.connectionParams.textHeaders)
            //     // logger.info(ctx.connectionParams);

            //     if (ctx.connectionParams.authToken) {
            //         try {
            //             let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
            //             let result = await User.updateOne({ _id: userId }, { $set: { isOnline: true }})

            //             if(result.ok){
            //                 pubsub.publish("CONVERSATION", {
            //                     conversation:{
            //                       mutation: 'CONNECTED',
            //                       data: userId
            //                     }
            //                 });
            //             }
                        
            //         } catch(err) {
            //             logger.error(err.toString());
            //         } 
            //     }
            },
            onDisconnect: async (ctx, code, reason) =>{
                // logger.info(ctx.connectionParams);
                console.log("onDisconnect")
            //     if (ctx.connectionParams.authToken) {
            //         try {
            //             let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
            //             let result =  await User.updateOne({ _id: userId }, { $set: { isOnline: false } })

            //             if(result.ok){
            //                 pubsub.publish("CONVERSATION", {
            //                     conversation:{
            //                     mutation: 'DISCONNECTED',
            //                     data: ""
            //                     }
            //                 });
            //             }
            //         } catch(err) {
            //             logger.error(err.toString());
            //         }
            //     }
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

        context: async ({ req }) => {
            // console.log("ApolloServer context :", req.headers.authorization)

            // https://daily.dev/blog/authentication-and-authorization-in-graphql
            // throw Error("throw Error(user.msg);");

            // const decode = jwt.verify(token, 'secret');
            try {
                if (req.headers && req.headers.authorization) {
                    var auth    = req.headers.authorization;
                    var parts   = auth.split(" ");
                    var bearer  = parts[0];
                    var sessionId   = parts[1];

                    if (bearer == "Bearer") {
                        // let decode = jwt.verify(token, process.env.JWT_SECRET);
                        let session = await Session.findById(sessionId)   
                        
                        var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));

                        // console.log("session expired :", session.expired, expiredDays, req)

                        // code
                        // -1 : force logout
                        //  0 : anonymums
                        //  1 : OK
                        if(expiredDays >= 0){
                            let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
    
                            // return {...req, currentUser: await User.findById(userId)} 

                            return {
                                status: true,
                                code: 1,
                                currentUser: await User.findById(userId),
                                req
                            }
                        }

                        // force logout
                        return {
                            status: false,
                            code: -1,
                            req
                        }
                    }
                }
            } catch(err) {
                logger.error( err.toString() );
            }
            return {
                status: true,
                code: 0,
                req
            }
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

    
    app.use(express.static("/app/uploads"));

    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: "text/*" }));
    app.use(bodyParser.urlencoded({ extended: false }));

    // Enabled Access-Control-Allow-Origin", "*" in the header so as to by-pass the CORS error.
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    });

    // Requests to `http://localhost:4000/health` now return "Okay!"
    app.get('/health', (req, res) => {
        res.status(200).send('Okay!');
    });

    // Now that our HTTP server is fully set up, actually listen.
    httpServer.listen(PORT, () => {
        console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`);

        // console.log("process.env :", process.env)
    });
}

startApolloServer(typeDefs, resolvers) 