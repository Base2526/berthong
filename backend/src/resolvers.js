import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";
import mongoose from 'mongoose';
import fetch from "node-fetch";
import { GraphQLUpload } from 'graphql-upload';
import moment from "moment";
import jwt from 'jsonwebtoken';

import pubsub from './pubsub'
import AppError from "./utils/AppError"
import logger from "./utils/logger";
import * as cache from "./cache"
import * as Constants from "./constants"
import * as Model from "./model"
import * as Utils from "./utils"
import connection from './mongo'

export default {
  Query: {
    async me(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { _id } = args

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR  &&
          role !== Constants.AUTHENTICATED &&
          role !== Constants.SELLER
          ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let user = await Utils.getUserFull({username: current_user.username})

      await Model.User.updateOne({ _id: user?._id }, { lastAccess : Date.now() });
      return {
        status: true,
        data: user,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    
    async checkWalletByUserId(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { _id } = args

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      console.log(`####################### checkWalletByUserId Start ${ _id } ##############################`)

      // let aggregate = [
      //                   { 
      //                       $match: { userId: mongoose.Types.ObjectId(_id), 
      //                                 status: {$in: [Constants.WAIT, Constants.APPROVED]},
      //                                 // status: Constants.APPROVED,
      //                                 type: {$in: [Constants.SUPPLIER, Constants.DEPOSIT, Constants.WITHDRAW]}  } 
      //                   },
      //                   {
      //                       $lookup: {
      //                           localField: "refId",
      //                           from: "supplier",
      //                           foreignField: "_id",
      //                           pipeline: [{ $match: { buys: { $elemMatch : { userId: mongoose.Types.ObjectId(_id) }} }}],
      //                           as: "supplier"
      //                       }                 
      //                   },
      //                   {
      //                       $lookup: {
      //                           localField: "refId",
      //                           from: "deposit",
      //                           foreignField: "_id",
      //                           as: "deposit"
      //                       }
      //                   },
      //                   {
      //                       $lookup: {
      //                           localField: "refId",
      //                           from: "withdraw",
      //                           foreignField: "_id",
      //                           as: "withdraw"
      //                       }
      //                   },
      //                   {
      //                       $unwind: {
      //                           path: "$supplier",
      //                           preserveNullAndEmptyArrays: true
      //                       }
      //                   },
      //                   {
      //                       $unwind: {
      //                           path: "$deposit",
      //                           preserveNullAndEmptyArrays: true
      //                       }
      //                   },
      //                   {
      //                       $unwind: {
      //                           path: "$withdraw",
      //                           preserveNullAndEmptyArrays: true
      //                       }
      //                   }
      //                 ];

      // let transitions = await Model.Transition.aggregate(aggregate);

      // let money_use       = 0;
      // let money_lock      = 0;
      // let money_deposit   = 0;
      // let money_withdraw  = 0;
      // let in_carts        = [];
      // _.map(transitions, (transition) =>{
      //   switch(transition.type){
      //     case Constants.SUPPLIER:{
      //       let { supplier } = transition
      //       if(transition.status === Constants.WAIT){
      //         let { price, buys } = supplier

      //         let filter = _.filter(buys, (buy)=> _.isEqual(buy.transitionId, transition._id) )

      //         let itemIds = _.map(filter, (f)=>f.itemId)

      //         console.log("SUPPLIER #WAIT :", transition._id, supplier._id, supplier.title, price, itemIds)

      //         money_lock += filter.length * price
      //       }else if(transition.status === Constants.APPROVED){
      //         let { price, buys } = supplier

      //         let filter = _.filter(buys, (buy)=> _.isEqual(buy.transitionId, transition._id) )

      //         let itemIds = _.map(filter, (f)=>f.itemId)

      //         console.log("SUPPLIER #APPROVED :", transition._id, supplier._id, supplier.title, price, itemIds)

      //         money_use += filter.length * price
      //       }

      //       in_carts = [...in_carts, transition]
      //       break
      //     } 
      //     case Constants.DEPOSIT:{
      //       let { status, deposit } = transition
      //       if(status === Constants.APPROVED){
      //         let { balance } = deposit
      //         money_deposit += balance;
      //       }
      //       break
      //     } 
      //     case Constants.WITHDRAW:{
      //       let { status, withdraw } = transition
      //       if(status === Constants.APPROVED){
      //         let { balance } = withdraw
      //         money_withdraw += balance;
      //       }
      //       break
      //     }
      //   }
      // })  


      let { transitions, money_balance, money_use, money_lock, money_deposit, money_withdraw, in_carts } = await Utils.getBalance(_id)
      
      console.log(`####################### checkWalletByUserId End ${ _id } ##############################`)
      return {  status:true, 
                userId: _id,  

                transitions, 
                money_balance,
                money_use, 
                money_lock,
                money_deposit, 
                money_withdraw,
                in_carts,

                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async ping(parent, args, context, info){
      let { req } = context

      await Utils.checkAuth(req);

      const session = await mongoose.startSession();
      session.startTransaction()

      try {
        // await Model.Test.create({ message: "ACCC" });
        // await session.commitTransaction();
        // console.log("ping #1")

        console.log("process.env ", process.env )

      }catch(error){
        await session.abortTransaction();
        console.log(`ping #2 ${err}`)
      }finally {
        session.endSession();

        console.log("ping #3")
      }      

      // let user  = await Utils.getUser({_id: mongoose.Types.ObjectId("62a2f633cf7946010d3c74fa")})
      // console.log("user doc :", user)
      // let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      //  return (await Model.Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name

      // let user = await Model.User.findById(mongoose.Types.ObjectId("62a2f65dcf7946010d3c7515"))
      // console.log("ping user :", user, _.isNull(user))
      // let suppliers = await Model.Supplier.findOne({_id: mongoose.Types.ObjectId("63f5c99fee4cff016c214fa3")})
      // console.log("ping suppliers :", suppliers)
      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }
      // cache.ca_save("A", v)
      // console.log("AAAAA :", cache.ca_get("A"))
      // if(status && code == 1){
      //   console.log("ping ok : ", current_user?._id)
      // }else{
      //   console.log("ping other")
      // }

      let ca_keys = cache.ca_keys();

      console.log("ping ca_keys :", ca_keys)
      return { status:true }
    },

    async checkCacheById(parent, args, context, info){
      let { req } = context
      let { _id } = args

      await Utils.checkAuth(req);

      let ca_get = cache.ca_get(_id)
      console.log("ca_get :", ca_get)
      // let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // console.log("checkUser :", current_user, req?.headers?.authorization)
      return { status:true }
    },

    async contents(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      console.log("checkUser :", current_user, req?.headers?.authorization)

      let data = await Model.BasicContent.find({})
      return {
        status: true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async contentById(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { _id } = args
      let { current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) == Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.BasicContent.findOne({_id})
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async checkUser(parent, args, context, info){
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      console.log("checkUser :", current_user, req?.headers?.authorization)
      return { status:true }
    },

    async users(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let { OFF_SET, LIMIT } = args?.input
      
      let users = await Model.User.aggregate([
                                                {
                                                  $match: {
                                                    roles: {$nin:[Constants.AMDINISTRATOR.toString()]}
                                                  }
                                                },
                                                { $skip: OFF_SET }, 
                                                { $limit: LIMIT }, 
                                                {
                                                  $lookup: {
                                                    localField: "_id",
                                                    from: "session",
                                                    foreignField: "userId",
                                                    as: "session"
                                                  }
                                                },
                                                {
                                                  $unwind: {
                                                    path: "$session",
                                                    preserveNullAndEmptyArrays: true
                                                  }
                                                },
                                              ])
     
      let transitions = await Promise.all(_.map(users, async(user)=>{
                          let transition =  await Model.Transition.aggregate([
                                        { 
                                          $match: { 
                                                    userId: mongoose.Types.ObjectId(user?._id), 
                                                    status: { $in: [ 13, 14 ] }, //  0 Constants.WAIT, Constants.APPROVED 
                                                    type:{ $in: [ 10, 11, 12]}       //  Constants.SUPPLIER = 10, Constants.DEPOSIT = 11, Constants.WITHDRAW = 12 
                                                  } 
                                        },
                                        {
                                          $lookup: {
                                              localField: "refId",
                                              from: "supplier",
                                              foreignField: "_id",
                                              pipeline: [{ $match: { buys: { $elemMatch : { userId: mongoose.Types.ObjectId(user?._id) }} }}],
                                              as: "supplier"
                                          }                 
                                        },
                                        {
                                          $lookup: {
                                            localField: "refId",
                                            from: "deposit",
                                            foreignField: "_id",
                                            as: "deposit"
                                          }
                                        },
                                        {
                                          $lookup: {
                                            localField: "refId",
                                            from: "withdraw",
                                            foreignField: "_id",
                                            as: "withdraw"
                                          }
                                        },
                                        {
                                          $unwind: {
                                            "path": "$supplier",
                                            "preserveNullAndEmptyArrays": true
                                          }
                                        },
                                        {
                                          $unwind: {
                                            "path": "$deposit",
                                            "preserveNullAndEmptyArrays": true
                                          }
                                        },
                                        {
                                          $unwind: {
                                            "path": "$withdraw",
                                            "preserveNullAndEmptyArrays": true
                                            }
                                        }
                                      ])
                          return {...user, transition}
                        }))
      return { 
              status: true,
              data: transitions,
              total: ( await Utils.getUserFull({roles: {$nin:[Constants.AMDINISTRATOR.toString()]}}) )?.length,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
            }
    },

    async userById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);
      let user = await Utils.getUserFull({_id})
      if(_.isNull(user)) throw new AppError(Constants.USER_NOT_FOUND, 'Model.User not found.')

      console.log("userById :", user)
      return {  status: true,
                data: user,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async roleByIds(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.Role.find({_id: {$in: args?.input }})
      return {
        status: true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async suppliers(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      await Utils.checkAuth(req);

      console.log("suppliers :", args?.input)

      let { TITLE, NUMBER, PAGE, LIMIT } = args?.input
      let SKIP = (PAGE - 1) * LIMIT

      let aggregate = []

      let match     = {publish: true, expire: false}
      if(!_.isEmpty(TITLE)){
        match = {...match,  title: { $regex: TITLE, $options: "i" } }
      }

      if(!_.isEmpty(match)){
        aggregate = [ { $match: match } ]
      }

      aggregate = [ ...aggregate,
                    { $skip: SKIP }, 
                    { $limit: LIMIT }, 
                    {
                      $lookup: {
                          localField: "ownerId",
                          from: "user",
                          foreignField: "_id",
                          pipeline: [
                            { $project:{ username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 }}
                          ],
                          as: "owner"
                      }
                    },
                    {
                      $lookup: {
                          localField: "manageLottery",
                          from: "manageLottery",
                          foreignField: "_id",
                          // pipeline: [
                          //   { $project:{ date: 1 }}
                          // ],
                          as: "manageLottery"
                      }
                    },
                    {
                      $unwind: {
                        path: "$owner",
                        preserveNullAndEmptyArrays: false
                      }
                    },
                    {
                      $unwind: {
                        path: "$manageLottery",
                        preserveNullAndEmptyArrays: false
                      }
                    }
                  ]

      if(!_.isEmpty(NUMBER)){
        let q = _.map(NUMBER.split(","), (v, i)=>{
          return {
                    "buys":{
                      $not:{ $elemMatch : {itemId: parseInt(v)} } 
                    }
                  }
        })

        aggregate = [...aggregate, { $match: { "$and" : q  } }]

        let suppliers = await Model.Supplier.aggregate(aggregate)

        aggregate = _.filter(aggregate, (v) => !v?.$skip && !v?.$limit )
        let total     = await Model.Supplier.aggregate(aggregate)

        suppliers = _.map(suppliers, (v)=>{ return {...v, PAGE} })

        return {  
          status: true,
          data: suppliers,
          total: total.length,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
        }
      }

      let suppliers = await Model.Supplier.aggregate(aggregate)

      aggregate = _.filter(aggregate, (v) => !v?.$skip && !v?.$limit )

      let total     = await Model.Supplier.aggregate(aggregate)
      suppliers = _.map(suppliers, (v)=>{ return {...v, PAGE} })
      return {  
        status: true,
        data: suppliers,
        total: total.length,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
      }
    },

    async supplierById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);
      return {  status: true,
                data: await Utils.getSupplier({_id}),
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async banks(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      await Utils.checkAuth(req);
      let banks = await Model.Bank.find({})
      if(_.isNull(banks)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')
      return {  status: true,
                data: banks,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bankById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);
      let bank = await Model.Bank.findById(_id)
      if(_.isNull(bank)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status:true,
                data: bank,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bankByIds(parent, args, context, info){
      let start = Date.now()
      let { _ids } = args
      let { req } = context

      await Utils.checkAuth(req);
      let banks = await Model.Bank.find({ _id : { $in : _ids } });
      if(_.isNull(banks)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status:true,
                data: banks,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bookBuyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let userId = current_user?._id;
      let transitions = await Model.Transition.aggregate([
                              { 
                                  $match: { userId: mongoose.Types.ObjectId(userId), type: Constants.SUPPLIER  } 
                              },
                              {
                                $lookup: {
                                    localField: "refId",
                                    from: "supplier",
                                    foreignField: "_id",
                                    pipeline: [{ $match: { buys: { $elemMatch : { userId: mongoose.Types.ObjectId(userId) }} }}],
                                    as: "supplier"
                                }                 
                              },
                              {
                                $unwind: {
                                    "path": "$supplier",
                                    "preserveNullAndEmptyArrays": false
                                }
                              }
                            ])

      return {  status: true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async historyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      let data = await Model.Transition.aggregate([
                                                      { 
                                                        $match: { 
                                                                  userId: mongoose.Types.ObjectId(current_user?._id), 
                                                                  status: { $in: [ 13, 14 ] }, //  0 Constants.WAIT, Constants.APPROVED 
                                                                  type:{ $in: [ 11, 12]}       //  Constants.DEPOSIT = 11, Constants.WITHDRAW = 12 
                                                                } 
                                                      },
                                                      {
                                                        $lookup: {
                                                          localField: "refId",
                                                          from: "deposit",
                                                          foreignField: "_id",
                                                          as: "deposit"
                                                        }
                                                      },
                                                      {
                                                        $lookup: {
                                                          localField: "refId",
                                                          from: "withdraw",
                                                          foreignField: "_id",
                                                          as: "withdraw"
                                                        }
                                                      },
                                                      {
                                                        $unwind: {
                                                          "path": "$deposit",
                                                          "preserveNullAndEmptyArrays": true
                                                        }
                                                      },
                                                      {
                                                        $unwind: {
                                                          "path": "$withdraw",
                                                          "preserveNullAndEmptyArrays": true
                                                          }
                                                      }
                                                    ])

      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async friendProfile(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);
      let user = await Utils.getUserFull({_id})
      if(_.isNull(user)) throw new AppError(Constants.USER_NOT_FOUND, 'Model.User not found.')

      let suppliers = await Model.Supplier.find({ownerId: _id});
      if(_.isNull(suppliers)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: {...user, suppliers},
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async buyById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      console.log("buyById :", _id)

      let { current_user } =  await Utils.checkAuth(req)
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR &&
          role !== Constants.SELLER 
        ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let transitions = await Model.Transition.aggregate([
                  {
                    $match: { _id: mongoose.Types.ObjectId(_id) }
                  },
                  {
                    $lookup: {
                      localField: "refId",
                      from: "supplier",
                      foreignField: "_id",
                      as: "supplier"
                    }
                  },
                  {
                    $lookup: {
                      localField: "userId",
                      from: "user",
                      foreignField: "_id",
                      as: "user"
                    }
                  },
                  {
                    $unwind: {
                        path: "$supplier",
                        preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $unwind: {
                      path: "$user",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  // { $limit: 1 }
              ])

      return {  status: true,
                data: _.isEmpty(transitions) ? null : transitions[0],
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async buys(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req)
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR &&
          role !== Constants.SELLER
        ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      switch(role){
        case Constants.AMDINISTRATOR:{
          console.log("buys : Constants.AMDINISTRATOR")
          // let transitions = await Model.Transition.find({ type: Constants.SUPPLIER, status: Constants.APPROVED });
          // transitions = await Promise.all(_.map(transitions, async(transition)=>{
          //                     switch(transition.type){
          //                       case Constants.SUPPLIER:{
          //                         let supplier = await Utils.getSupplier({_id: transition?.refId}) 
          //                         let buys     = _.filter(supplier.buys, (buy)=>buy.userId == current_user?._id.toString())
          //                         // price, buys
          //                         let balance = buys.length * supplier.priceUnit
          //                         return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
          //                       }
          //                     }
          //                 }))

          let transitions = await Model.Transition.aggregate([
                      {
                        $match: {
                          type: Constants.SUPPLIER, status: Constants.APPROVED
                        }
                      },
                      {
                        $lookup: {
                          localField: "refId",
                          from: "supplier",
                          foreignField: "_id",
                          as: "supplier"
                        }
                      },
                      {
                        $lookup: {
                          localField: "userId",
                          from: "user",
                          foreignField: "_id",
                          as: "user"
                        }
                      },
                      {
                        $unwind: {
                            path: "$supplier",
                            preserveNullAndEmptyArrays: false
                        }
                      },
                      {
                        $unwind: {
                          path: "$user",
                          preserveNullAndEmptyArrays: true
                        }
                      }
                  ])

          return {  status:true,
                    data: transitions,
                    executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
        }

        case Constants.SELLER:
        case Constants.AUTHENTICATED:{
          let transitions = await Model.Transition.find({userId: current_user?._id, type: Constants.SUPPLIER, status: Constants.APPROVED });
          transitions = await Promise.all(_.map(transitions, async(transition)=>{
                              switch(transition.type){
                                case Constants.SUPPLIER:{
    
                                  let supplier = await Utils.getSupplier({_id: transition?.refId}) 
                                  let buys     = _.filter(supplier.buys, (buy)=>buy.userId == current_user?._id.toString())
                                  // price, buys
    
                                  let balance = buys.length * supplier.priceUnit
    
                                  return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                                }
                              }
                          }))
          return {  status:true,
                    data: transitions,
                    executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
        }
      }

      return {  status:false, executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async notifications(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      let aggregate = [
                        { 
                          $match: { user_to_notify: mongoose.Types.ObjectId(current_user?._id), delete: 0 } 
                        },
                        {
                          $lookup: {
                            localField: "user_id_approve",
                            from: "user",
                            foreignField: "_id",
                            as: "user"
                          }
                        },
                        {
                          $unwind: {
                              path: "$user",
                              preserveNullAndEmptyArrays: false
                          }
                        },
                      ]

      let data = await Model.Notification.aggregate(aggregate);
      return {  status: true,
                data,
                total: data.length,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async commentById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);

      let comm = await Model.Comment.findOne({_id});
      return {  status: true,
                data: _.isNull(comm) ? [] : comm,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bookmarks(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);

      if( Utils.checkRole(current_user) !== Constants.AUTHENTICATED && 
          Utils.checkRole(current_user) !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')
    
      let suppliers = await Model.Supplier.aggregate([
                      {  $match: { follows: {$elemMatch: {userId: current_user?._id} }  } },
                      {
                        $lookup: {
                            localField: "ownerId",
                            from: "user",
                            foreignField: "_id",
                            as: "owner"
                        }                 
                      },
                      {
                        $unwind: {
                            "path": "$owner",
                            "preserveNullAndEmptyArrays": false
                        }
                      }
                    ])

      return {  status: true,
                data: suppliers,
                total: suppliers.length,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async subscribes(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      let users = await Utils.getUsers({subscriber: { $elemMatch : {userId: current_user?._id }}})
      
      return {  status: true,
                data: users,
                total: users.length,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async dblog(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let dblogs = await Model.Dblog.find({})
      return {  status: true,
                data:dblogs,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async dateLotterys(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      
      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let dateLotterys = await Model.DateLottery.find({})
      
      return {  status: true,
                data: dateLotterys,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async dateLotteryById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let dateLottery = await Model.DateLottery.findById(_id)
      if(_.isNull(dateLottery)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: dateLottery,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async producers(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let producers = await Model.Supplier.find({ ownerId: current_user?._id })
      return {  status: true,
                data: producers,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async manageLotterys(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) == Constants.AMDINISTRATOR || Utils.checkRole(current_user) == Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')
      let data = await Model.ManageLottery.find({})
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async manageLotteryById(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { _id } = args
      let { current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) == Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.ManageLottery.findOne({_id})
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async deposits(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.Transition.aggregate([
                  { $match: { type: Constants.DEPOSIT } },
                  {
                    $lookup: {
                      localField: "refId",
                      from: "deposit",
                      foreignField: "_id",
                      as: "deposit"
                    }
                  },
                  {
                    $unwind: {
                      path: "$deposit",
                      preserveNullAndEmptyArrays: false
                    }
                  }
                ])
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async withdraws(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.Transition.aggregate([
                          { $match: { type: Constants.WITHDRAW } },
                          {
                            $lookup: {
                              localField: "refId",
                              from: "withdraw",
                              foreignField: "_id",
                              as: "withdraw"
                            }
                          },
                          {
                            $unwind: {
                              path: "$withdraw",
                              preserveNullAndEmptyArrays: false
                            }
                          }
                        ])

      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminHome(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      // console.log("adminHome :", context)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let transitions = await Model.Transition.aggregate([
        { 
            $match: { 
              status: Constants.WAIT, 
              type: {$in: [Constants.DEPOSIT, Constants.WITHDRAW]},
            } 
        },
        {
          $lookup: {
            localField: "refId",
            from: "deposit",
            foreignField: "_id",
            as: "deposit"
          }
        },
        {
          $lookup: {
            localField: "refId",
            from: "withdraw",
            foreignField: "_id",
            as: "withdraw"
          }
        },
        {
          $unwind: {
            path: "$deposit",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$withdraw",
            preserveNullAndEmptyArrays: true
          }
        }
      ])

      let suppliers = Array.from({ length: await Utils.getTotalSupplier() }, (_, i) => i);
      let users     = await Model.User.find({ roles: {$nin:[Constants.AMDINISTRATOR.toString()]} }, 
                                            { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, lastAccess: 1 }); 

      let withdraws = _.filter(transitions, (transition)=>transition?.withdraw)
      let deposits  = _.filter(transitions, (transition)=>transition?.deposit)

      let data =  [ 
                    { title: "รายการ ฝากเงิน รออนุมัติ", data: deposits },
                    { title: "รายการ ถอดเงิน รออนุมัติ", data: withdraws },
                    { title: "รายการ สินค้าทั้งหมด", data: suppliers },
                    { title: "รายชื่อบุคคลทั้งหมด", data: users } 
                  ]
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminBanks(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      await Utils.checkAuth(req);

      let data =  [ { id: "01", label: '364-277878-2 ธนาคารไทยพาณิชย์', number: '3642778782', name_bank: 'ธนาคารไทยพาณิชย์', name_account: 'นาย พีรพัฒน์ วิชัยสาน' } ]
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminDeposits(parent, args, context, info){
      let start = Date.now()
        
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.Transition.aggregate([
                              { $match: { status: Constants.WAIT, type: Constants.DEPOSIT } },
                              {
                                  $lookup: {
                                      localField: "refId",
                                      from: "deposit",
                                      foreignField: "_id",
                                      as: "deposit"
                                  }
                              },
                              {
                                $unwind: {
                                  "path": "$deposit",
                                  "preserveNullAndEmptyArrays": false
                                }
                              }
                            ])

      return {  status:true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async adminWithdraws(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data = await Model.Transition.aggregate([
                  { $match: { status: Constants.WAIT, type: Constants.WITHDRAW } },
                  {
                    $lookup: {
                      localField: "refId",
                      from: "withdraw",
                      foreignField: "_id",
                      as: "withdraw"
                    }
                  },
                  {
                    $unwind: {
                      path: "$withdraw",
                      preserveNullAndEmptyArrays: false
                    }
                  }
                ])

      return {  status:true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async manageSuppliers(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =   await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR && 
          role !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      // let { TITLE, NUMBER, PAGE, LIMIT } = args?.input
      // let SKIP = (PAGE - 1) * LIMIT

      let aggregate = []
      let match     = {}
      // if(!_.isEmpty(TITLE)){
      //   match = { title: { $regex: TITLE, $options: "i" } }
      // }

      if( role === Constants.SELLER ){
        match = {...match, ownerId: mongoose.Types.ObjectId(current_user?._id)}
      }

      if(!_.isEmpty(match)){
        aggregate = [ { $match: match } ]
      }

      aggregate = [ ...aggregate,
                    // { $skip: SKIP }, 
                    // { $limit: LIMIT }, 
                    {
                      $lookup: {
                          localField: "ownerId",
                          from: "user",
                          foreignField: "_id",
                          pipeline: [
                            { $project:{ username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 }}
                          ],
                          as: "owner"
                      }
                    },
                    {
                      $lookup: {
                          localField: "manageLottery",
                          from: "manageLottery",
                          foreignField: "_id",
                          // pipeline: [
                          //   { $project:{ date: 1 }}
                          // ],
                          as: "manageLottery"
                      }
                    },
                    {
                      $unwind: {
                        path: "$owner",
                        preserveNullAndEmptyArrays: true
                      }
                    },
                    {
                      $unwind: {
                        path: "$manageLottery",
                        preserveNullAndEmptyArrays: true
                      }
                    }
                  ]

      // if(!_.isEmpty(NUMBER)){
      //   let q = _.map(NUMBER.split(","), (v, i)=>{ return { "buys":{ $not:{ $elemMatch : {itemId: parseInt(v)} } } } })

      //   aggregate = [...aggregate, { $match: { "$and" : q  } }]

      //   let suppliers = await Model.Supplier.aggregate(aggregate)

      //   aggregate = _.filter(aggregate, (v) => !v?.$skip && !v?.$limit )
      //   let total     = await Model.Supplier.aggregate(aggregate)

      //   suppliers = _.map(suppliers, (v)=>{ return {...v, PAGE} })

      //   return {  
      //     status: true,
      //     data: suppliers,
      //     total: total.length,
      //     executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
      //   }
      // }

      let suppliers = await Model.Supplier.aggregate(aggregate)

      aggregate = _.filter(aggregate, (v) => !v?.$skip && !v?.$limit )

      let total     = await Model.Supplier.aggregate(aggregate)
      // suppliers = _.map(suppliers, (v)=>{ return {...v, PAGE} })
      return {  
        status: true,
        data: suppliers,
        total: total.length,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
      }
    },

    async conversations(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR &&
          role !== Constants.AUTHENTICATED && 
          role !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let data=  await Model.Conversation.find({ "members.userId": { $all: [ current_user?._id ] } });
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async message(parent, args, context, info) {
      let start = Date.now()
      let { req } = context
      let { conversationId, startId } = args

      console.log("query, message :", args, startId)

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR &&
          role !== Constants.AUTHENTICATED && 
          role !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      // let {PAGE, LIMIT} = pagination
      // if( _.isUndefined(PAGE) || _.isUndefined(LIMIT) ) throw new AppError(Constants.ERROR, 'parameter missing')


      // Define the starting _id for the page
      // const startId = 'your-starting-id';

      // Create a query to fetch documents starting after the specified _id

      let query =  { conversationId: mongoose.Types.ObjectId(conversationId) } 
      if(!_.isUndefined(startId)){
        query ={ _id: { $gt: mongoose.Types.ObjectId(startId) }, conversationId: mongoose.Types.ObjectId(conversationId) };;
      }
      
      let data = await Model.Message.find(query).skip(0).limit(100);
      let total = (await Model.Message.find({conversationId: mongoose.Types.ObjectId(conversationId)}, {_id: 1}))?.length
      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

  },
  Upload: GraphQLUpload,
  Mutation: {
    async update_me(parent, args, context, info){
      let { req } = context

      // let users = await Utils.getUsers({})

      let { current_user } =  await Utils.checkAuth(req);
      // console.log("current_user :", current_user)
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let users = await Model.User.find({})
      
      // console.log("user .length", users?.length)

      // let private_users= ["admin", "Winifred", "Malika", "Brian", "Fernando", "Jazmin", "Maia" , "Armani", "Bernadine", "Cortez", "Dessie", "Unique", "Alphonso", "Katlynn", "Nestor", "Hipolito", "Mackenzie", "Holly"]
      // let count = 0
      // _.map(users, async(user)=>{
      //   await Model.User.updateOne({ _id: user?._id }, { username : user?.username?.toLowerCase() });
      //   // let f = _.find(private_users, name=>name?.toLowerCase() === user?.username?.toLowerCase())
      //   // if(f){
      //   //   console.log("update_me :", f, user?.username, user?.email )
      //   //   count++;
      //   // }else{
      //   //   await Model.User.deleteOne({ username: user?.username, email: user?.email });
      //   // }
      // })
      // console.log("update_me count :", count )
    

      return {  
                status: true, 
                // users,
                random: Math.round(1 + Math.random() * (100000 - 1)) }
    },
    async check_db(parent, args, context, info){
      let { req } = context

      // let { current_user } =  await Utils.checkAuth(req);
      // console.log("current_user :", current_user)
      // if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      console.log("check_db :", connection)
      let { readyState } = connection
      let mongo_db_state = "Empty"
      if (readyState === 0) {
        mongo_db_state = "Disconnected"
      } else if (readyState === 1) {
        mongo_db_state = "Connected"
      } else if (readyState === 2) {
        mongo_db_state = "Connecting"
      } else if (readyState === 3) {
        mongo_db_state = "Disconnecting"
      }
      // mongoose.connection.poolSize

      // console.log("context :", context)

      // await Utils.loggerError(req,  JSON.stringify(process.env), 
      //               {
      //                 username: JSON.stringify(current_user), // Replace with actual user info
      //                 ipAddress: "127.0.0.1",
      //                 userAgent: Utils.userAgent(req)
      //               }
      //             );
      // await Utils.loggerError(req, process.env)

      // pubsub.publish("CONVERSATION", {
      //   conversation: {
      //     mutation: "CREATED",
      //     data: {"A": "AA", "B": "BB"},
      //   },
      // });

      let text = "7P569uV6nR2zr3y26mtTn"
      let encrypt = cryptojs.AES.encrypt(text, process.env.JWT_SECRET).toString()
      // encrypt = "U2FsdGVkX18wIs5DOBhZOddShspHwri5Z8KFIXtyHzU="
      let decrypt = cryptojs.AES.decrypt(encrypt, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8);
      console.log("encrypt ++ :", text, encrypt, decrypt)
  
      return {  status:true, 
                mongo_db_state,
                // env: process.env
              }
    },
    async login(parent, args, context, info) {
      let start = Date.now()
      let {input} = args

      let username = input.username.toLowerCase()

      let user = Utils.emailValidate().test(username) 
      if(Utils.emailValidate().test(username)){
        user = await Utils.getUser({email: username}, false)
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          
          console.log("e :", user?.password, input?.password, cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8))
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
        user = await Utils.getUserFull({email: username})
      }else{
        user = await Utils.getUser({username}, false)
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          console.log("e :", user?.password, input?.password, cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8))
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
        user = await Utils.getUserFull({username})
      }

      await Model.User.updateOne({ _id: user?._id }, { lastAccess : Date.now() });
      return {
        status: true,
        data: user,
        sessionId: await Utils.getSession(user?._id, input),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async loginWithSocial(parent, args, context, info) {
      let {input} = args
      console.log("loginWithSocial :", input)

      let start = Date.now()
      switch(input.authType.toLowerCase()){
        case "google":{

          /*
            --------  response  --------
            accessToken
            googleId
            profileObj {
              email : "xx.xx@gmail.com"
              familyName : "xx"
              givenName : "xx"
              googleId : "112378752153101585347"
              imageUrl : "https://lh3.googleusercontent.com/a-/AFdZucrsz6tfMhKB87pCWcdwoMikQwlPG8_aa4h6zYz1ng=s96-c"
              name : "xx xx"
            }
            tokenId
            tokenObj {
              access_token : "ya29.a0AVA9y1uPAzoEGM3joZMmfeWhu_i10ANwgeFmvtcLi8AS1o-TytHHCyrqi4-BSCA6g6hbGX4SVIdLzSuGSsMyFT3tL4_RO99je5YfVqpoji0YIDrnuzVvdKK6_uPaMUmW467bYBR75iCBwaGGUQ2ba8P5IC4MaCgYKATASARISFQE65dr8q10VA-k-brPrO1Y-jVwB0Q0163"
              expires_at : 1662901232664
              expires_in : 3599
              first_issued_at : 1662897633664
              id_token : "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNhYWJmNjkwODE5MTYxNmE5MDhhMTM4OTIyMGE5NzViM2MwZmJjYTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTA5NDIwMzg2NTg0My1qcWFqOWFtNHRldnRvY2c3NXRkaXJtdGtoOTVrMjdjYi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwOTQyMDM4NjU4NDMtanFhajlhbTR0ZXZ0b2NnNzV0ZGlybXRraDk1azI3Y2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIzNzg3NTIxNTMxMDE1ODUzNDciLCJlbWFpbCI6ImFuZHJvaWQuc29ta2lkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoibjhzSmpBbmVTdWptYlJOdWdvSzItQSIsIm5hbWUiOiJTb21raWQgU2ltYWphcm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FGZFp1Y3JzejZ0Zk1oS0I4N3BDV2Nkd29NaWtRd2xQRzhfYWE0aDZ6WXoxbmc9czk2LWMiLCJnaXZlbl9uYW1lIjoiU29ta2lkIiwiZmFtaWx5X25hbWUiOiJTaW1hamFybiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjYyODk3NjMzLCJleHAiOjE2NjI5MDEyMzMsImp0aSI6ImQ1NDk0YjY1MDliNmYxOTdjYjZhNGQwYTM3MjZiMWRiM2FiZTIxNTUifQ.CAawd4eccCFomK0NBCeMLUEoUM3I8zUJF6zzQoLC-tgZN6EanSOPRECoVU1zFnX002Su0Nwn1ET96c_xq0SS8Wrir0yFXkBDoi7lIEBNvpbcWxa3Jx79V_K1YgVLvmmRyHD_kx15E6zCpbN6g0ItnwpsheSYFK83y062XeAP1RA3_mas0Sa0ubnjRWF3yvpe6CXYhm5s2dIxJMfLbAZ0HECeRkjKclHHwORKO6ZgmYZU92Pk5_760zMedv-sepNCdPAUAaWx6HE8kb6UW-1jYaSo-zH3KuHIYh9j85xJ8lJNII2EI3tC2VcqHLRShiCDGT9kx--utwScg58dsV9QHQ"
              idpId : "google"
              login_hint : "AJDLj6IwgLvhCVpEzCp3uaFdvrRlobPVw2fzQGnDcVDRIWfEVnCZ5tBvMV9RxH-EeHG6FMgjgi6XG_nZk3EgDid15uEuqyQHKQ"
              scope : "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid"
              token_type : "Bearer"
            }
 
        
            ----------  newAuthRes ----------
            {
              "token_type": "Bearer",
              "access_token": "ya29.a0AeTM1icjWxWZTlNE7aW4I-NxP3VY4f6QG6b4e1aXeGmcqLzKV0yeDvWXy5XannL_LOu0gqwF-HLeeOxoF5BlU3gRyLk0-w_ttsZIigVmwNFn-FGn_0sXDK4LoUk-Y5YefGRsHilAmAAHz7jMgMb6B80xNw5xD2MaCgYKAa0SARASFQHWtWOmmIZpKcbUdv0btmC2gGUpRw0166",
              "scope": "email profile https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email",
              "login_hint": "AJDLj6IwgLvhCVpEzCp3uaFdvrRlobPVw2fzQGnDcVDRIWfEVnCZ5tBvMV9RxH-EeHG6FMgjgi6XG_nZk3EgDid15uEuqyQHKQ",
              "expires_in": 3599,
              "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcxM2ZkNjhjOTY2ZTI5MzgwOTgxZWRjMDE2NGEyZjZjMDZjNTcwMmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTA5NDIwMzg2NTg0My1qcWFqOWFtNHRldnRvY2c3NXRkaXJtdGtoOTVrMjdjYi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwOTQyMDM4NjU4NDMtanFhajlhbTR0ZXZ0b2NnNzV0ZGlybXRraDk1azI3Y2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIzNzg3NTIxNTMxMDE1ODUzNDciLCJlbWFpbCI6ImFuZHJvaWQuc29ta2lkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiUGFVamZwSVM3d0hFOWV5SlBFcDNWUSIsIm5hbWUiOiJTb21raWQgU2ltYWphcm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUxtNXd1MzQ0WGlRUkdSOC1yZ2hBX0tyQ1A4djlnbFlRSWE3WFBVSTlSOTk1Zz1zOTYtYyIsImdpdmVuX25hbWUiOiJTb21raWQiLCJmYW1pbHlfbmFtZSI6IlNpbWFqYXJuIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2Njg0NzkwMDQsImV4cCI6MTY2ODQ4MjYwNCwianRpIjoiYzIzYTg2MTIxMTBkNGI1YWIwNmU5MWFhZmEwMGZiYjMxMWY0ZGM2YyJ9.tAOZq5O1pBUHOz5IwtfK5pmk6PP1I5MYmDm0erAjq5PHRC7JUNddlzTiqpN5zprWVBfjdlbMytwbMWwtrSOd_mCdXaK7ffiMYHi91A4tA0_7JvRErAn8-6ZvzjCMl807BcuyuqFvZEHuYkJTGaSV4kmI4d-NDirtWHA2RJQEscLyktkG3t3GxSwF9axoiMzBNPSi_bZ6xKfTLEcgG7t85Wq1DwLGPHmOuIfgdS-q-mMnklPX5x8sCSTNvitsIjK5v_56c0bWrfWzKbiCfkv2UyVWPKRg01CdnRsgnZeUeLaV3mB5-6HKsTsUE3rmA01iJZVw9F-NzuVFwqx9G5z0lQ",
              "session_state": {
                  "extraQueryParams": {
                      "authuser": "0"
                  }
              },
              "first_issued_at": 1668479006076,
              "expires_at": 1668482605076,
              "idpId": "google"
            }
          */

          let { data } = input

          let user = await Utils.getUser({socialId: data.profileObj.googleId, socialType: 'google'});
          if(_.isEmpty(user)){

            /*
              email : "xx.xx@gmail.com"
            familyName : "xx"
            givenName : "xx"
            googleId : "112378752153101585347"
            imageUrl : "https://lh3.googleusercontent.com/a-/AFdZucrsz6tfMhKB87pCWcdwoMikQwlPG8_aa4h6zYz1ng=s96-c"
            name : "xx xx"
            */

            let newInput = {
              username: data.profileObj.email,
              password: cryptojs.AES.encrypt( data.profileObj.googleId, process.env.JWT_SECRET).toString(),
              email: data.profileObj.email,
              displayName: data.profileObj.givenName +" " + data.profileObj.familyName ,
              roles: [ Constants.AUTHENTICATED ], // authenticated
              isActive: 1,
              banks: [],
              image :[{
                url: data.profileObj.imageUrl,
                filename: data.profileObj.googleId +".jpeg",
                mimetype: 'image/jpeg',
                encoding: '7bit',
              }],
              lastAccess : Date.now(),
              isOnline: true,
              socialType: 'google',
              socialId: data.profileObj.googleId,
              socialObject: JSON.stringify(data)
            }

            console.log("Presave GOOGLE :", newInput)
            
            user = await Model.User.create(newInput);
          }

          user = await Utils.getUserFull({_id: user?._id})
          console.log("getUserFull #GOOGLE :", user)
          return {
            status: true,
            data: user,
            sessionId: await Utils.getSession(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "github":{
          let { data } = input

          let user = await Utils.getUserFull({socialId: data.code, socialType: 'github'});

          let github_user = null;
          if(_.isEmpty(user)){
            const formData = new FormData();
            formData.append("client_id", process.env.GITHUB_CLIENT_ID);
            formData.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
            formData.append("code", data.code);

            // Request to exchange code for an access token
            github_user = await fetch(process.env.GITHUB_URL_OAUTH_ACCESS_TOKEN, { method: "POST", body: formData })
                                      .then((response) => response.text())
                                      .then(async(paramsString) => {
                                        let params = new URLSearchParams(paramsString);

                                        console.log("params :", params)

                                        await Utils.loggerError(req, params);
                                        
                                        let access_token = params.get("access_token");
                                  
                                        // Request to return data of a user that has been authenticated
                                        return fetch(process.env.GITHUB_URL_OAUTH_USER, {
                                          headers: {
                                            Authorization: `token ${access_token}`,
                                          },
                                        });
                                      })
                                      .then((response) => response.json())

            
            /*
            avatar_url : "https://avatars.githubusercontent.com/u/900211?v=4"
            bio :  null
            blog : ""
            company : null
            created_at :  "2011-07-07T10:02:34Z"
            email : "mr.xx@gmail.com"
            events_url:  "https://api.github.com/users/Base2526/events{/privacy}"
            followers : 2
            followers_url : "https://api.github.com/users/Base2526/followers"
            following : 11
            following_url : "https://api.github.com/users/Base2526/following{/other_user}"
            gists_url: "https://api.github.com/users/Base2526/gists{/gist_id}"
            gravatar_id : ""
            hireable : null
            html_url : "https://github.com/Base2526"
            id : 900211
            location : null
            login : "Base2526"
            name : "xx_haha"
            node_id : "MDQ6VXNlcjkwMDIxMQ=="
            organizations_url : "https://api.github.com/users/Base2526/orgs"
            public_gists: 0
            public_repos: 118
            received_events_url: "https://api.github.com/users/Base2526/received_events"
            repos_url : "https://api.github.com/users/Base2526/repos"
            site_admin : false
            starred_url : "https://api.github.com/users/Base2526/starred{/owner}{/repo}"
            subscriptions_url : "https://api.github.com/users/Base2526/subscriptions"
            twitter_username : null
            type : "Model.User"
            updated_at : "2022-11-14T09:16:18Z"
            url : "https://api.github.com/users/Base2526"
            */

            /*
            save data user
            
            input = {...input, displayName: input.username}
            return await Model.User.create(input);
            */

            /*
            username: { type: String },
            password: { type: String },
            email: { type: String },
            displayName: { type: String },
            roles: [{ type: String }],
            isActive: { type: String },
            image :[{
              url: { type: String },
              filename: { type: String },
              mimetype: { type: String },
              encoding: { type: String },
            }],
            lastAccess : { type : Date, default: Date.now },
            isOnline: {type: Boolean, default: false},
            socialType:{
              type: String,
              enum : ['website','facebook', 'google', 'github'],
              default: 'website'
            }, 
            socialId: { type: String },
            socialObject: { type: String },
            */

            let newInput = {
              username: github_user.email,
              password: cryptojs.AES.encrypt(data.code, process.env.JWT_SECRET).toString(),
              email: github_user.email,
              displayName: github_user.name,
              roles: [ Constants.AUTHENTICATED ], // authenticated
              isActive: 1,
              image :[{
                url: github_user.avatar_url,
                filename: data.code +".jpeg",
                mimetype: 'image/jpeg',
                encoding: '7bit',
              }],
              lastAccess : Date.now(),
              isOnline: true,
              socialType: 'github',
              socialId: data.code,
              socialObject: JSON.stringify(github_user)
            }
            user = await Model.User.create(newInput);
          }

          console.log("GITHUB :", user)

          return {
            status:true,
            data: user,
            sessionId: await Utils.getSession(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "facebook":{

          /*
          {
            "name": "xx Sim",
            "email": "xx.xx@gmail.com",
            "picture": {
                "data": {
                    "height": 50,
                    "is_silhouette": false,
                    "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=5031748820263498&height=50&width=50&ext=1671182329&hash=AeQLQloZ6CBWqqOkPFg",
                    "width": 50
                }
            },
            "id": "5031748820263498",
            "accessToken": "EAARcCUiGLAQBAB4mB4GalPuSBMId15c4hEr3CSEYNxQERzKSnExjuQFuxsOif3MbmZCwm5nwwQNh1tFZBiJjCZB5CiKFHShYM3DHGOZB2QkMYFBWbcs6sRClw5BI7YsOLdtJNYHVpBqjvjdbQwWKtiNzZB1HttaVEDvYqUkWkPiKMR2n7IwC2dZCKJ582fkyN5ZCFdN8nBvcsZBTSRYivvFf",
            "userID": "5031748820263498",
            "expiresIn": 6072,
            "signedRequest": "AKX_cpK80gAe_KXsAIFB3SM8348W2xe9j_PbqPfSNcQ.eyJ1c2VyX2lkIjoiNTAzMTc0ODgyMDI2MzQ5OCIsImNvZGUiOiJBUUM5MTNhVXJHRGRfMVBRWmtpV0VOY0lRckVMRkdVUVo5eldvQkdNUUVxbUhRekd0N1lWSi1aZWRrRHpSY2w2em1udjVQX1ZnZno0UHBYTGJSS0FWZU1GWkpTTzhsVDM3SmNpYkZwWFA3Q3VMelNsVmJ3YXpCT1pjNXI3bFJmMlNGV1JUWUJJbHhDZGN0Q0N6WExzU2dLeTlkRFQ0UGtBV2ZSa1Bpc2dUS21yanRpMi1ELWZ0cjF5dEJ1Y1N3cDZQNVVHa2REaXRYTVgwZU9DYWlmeFVzeS1HbTJ4NWxoR25wczgzWmFrSDZ6TGltcENxdXplVjBPMVFlcEppMmstb2ozc09ueW9KSnE0Vzc4emJ1X1ZvLWhvd3FrZEtsTkxucWVLX09TMDhKUmwxQjhTXzdxcFZHZ243a283TWM1MHg2OGlmQzhPaFgxWURpNjFadDBCVWNaQiIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjY4NTkwMzI4fQ",
            "graphDomain": "facebook",
            "data_access_expiration_time": 1676366328
          }
          */

          let { data } = input

          let user = await Utils.getUserFull({socialId: data.id, socialType: 'facebook'});

          if(_.isEmpty(user)){
            let newInput = {
              username: data.email,
              password: cryptojs.AES.encrypt(data.id, process.env.JWT_SECRET).toString(),
              email: data.email,
              displayName: data.name,
              roles: [ Constants.AUTHENTICATED ], // authenticated
              isActive: 1,
              image :[{
                url: _.isEmpty(data.picture.data) ? "" : data.picture.data.url,
                filename: data.id +".jpeg",
                mimetype: 'image/jpeg',
                encoding: '7bit',
              }],
              lastAccess : Date.now(),
              isOnline: true,
              socialType: 'facebook',
              socialId: data.id,
              socialObject: JSON.stringify(data)
            }
            user = await Model.User.create(newInput);

            console.log("FACEBOOK : new")
          }else{
            let newInput = {
              username: data.email,
              email: data.email,
              displayName: data.name,
              image :[{
                url: _.isEmpty(data.picture.data) ? "" : data.picture.data.url,
                filename: data.id +".jpeg",
                mimetype: 'image/jpeg',
                encoding: '7bit',
              }],
              lastAccess : Date.now(),
              socialType: 'facebook',
              socialObject: JSON.stringify(data)
            }

            await Model.User.findOneAndUpdate({ _id : user._id.toString()}, newInput, { new: true })

            console.log("FACEBOOK : update")
          }

          console.log("FACEBOOK :", user)
          return {
            status:true,
            data: user,
            sessionId: await Utils.getSession(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },
    // https://github.com/PrincewillIroka/login-with-github/blob/master/server/index.js
    async loginWithGithub(parent, args, context, info){
      try{
        let start = Date.now()

        let { code } = args

        console.log("loginWithGithub :", args)

        const data = new FormData();
        data.append("client_id", process.env.GITHUB_CLIENT_ID);
        data.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
        data.append("code", code);
        // data.append("redirect_uri", "https://banlist.info");

        // Request to exchange code for an access token
        let github_user = await fetch(`https://github.com/login/oauth/access_token`, { method: "POST", body: data })
                                    .then((response) => response.text())
                                    .then(async(paramsString) => {
                                      let params = new URLSearchParams(paramsString);

                                      console.log("params :", params)

                                      await Utils.loggerError(req, params);
                                      
                                      let access_token = params.get("access_token");
                                
                                      // Request to return data of a user that has been authenticated
                                      return fetch(`https://api.github.com/user`, {
                                        headers: {
                                          Authorization: `token ${access_token}`,
                                        },
                                      });
                                    })
                                    .then((response) => response.json())

        console.log("github_user :", github_user)
        console.log(`Time to execute = ${ (Date.now() - start) / 1000 } seconds`)

      } catch(err) {
        await Utils.loggerError(req, err.toString());
        return;
      }
    },
    async register(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args

      let user = await Utils.getUser({ email: input.email } ) 
      if(!_.isNull(user)) throw new AppError(Constants.ERROR, "EXITING EMAIL")

      let newInput =  {...input,  username: input.username?.toLowerCase(),
                                  password: cryptojs.AES.encrypt( input.password, process.env.JWT_SECRET).toString(),
                                  displayName: _.isEmpty(input.displayName) ? input.username : input.displayName ,
                                  roles: [Constants.AUTHENTICATED], 
                                  lastAccess: Date.now(), 
                                  isOnline: true}
              
      await Model.User.create(newInput);
      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async me(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context
      
      let { current_user } =  await Utils.checkAuth(req);

      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR &&
          Utils.checkRole(current_user) !==Constants.SELLER &&
          Utils.checkRole(current_user) !==Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      switch(Utils.checkRole(current_user)){
        case Constants.AMDINISTRATOR:{
          console.log("me :", input)

          let fileObject = input?.avatar

          if(fileObject?.file){
            const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
            const stream = createReadStream();
            const assetUniqName = Utils.fileRenamer(filename);
            let pathName = `/app/uploads/${assetUniqName}`;
            
            const output = fs.createWriteStream(pathName)
            stream.pipe(output);
    
            await new Promise(function (resolve, reject) {
              output.on('close', () => {
                resolve();
              });
        
              output.on('error', async(err) => {
                await Utils.loggerError(req, err.toString());
    
                reject(err);
              });
            }); 
            await Model.User.updateOne({ _id: mongoose.Types.ObjectId(input?._id) }, { avatar: { url: `images/${assetUniqName}`, filename, encoding, mimetype } } );
          }

          if(input?.lockAccount === 'true'){
            await Model.User.updateOne({ _id: mongoose.Types.ObjectId(input?._id) }, { displayName: input?.displayName, lockAccount: { lock: true, date: Date.now() } } );
          }else{
            await Model.User.updateOne({ _id: mongoose.Types.ObjectId(input?._id) }, { displayName: input?.displayName, lockAccount: { lock: false, date: Date.now() } } );
          }

          
          return {
            status: false,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case Constants.SELLER:
        case Constants.AUTHENTICATED:{
          let { type, mode, data } = input
          switch(type){
            case "bank":{
              switch(mode){
                case "new":{
                  let { banks } = await Utils.getUser({_id: current_user?._id}) 
                  await Model.User.updateOne({ _id: current_user?._id }, { banks: [...banks, ...data] } );
                  break;
                }
        
                case "delete":{
                  let { banks } = await Utils.getUser({_id: current_user?._id}) 
                  let newBanks = _.filter(banks, (bank)=>!_.isEqual(bank?._id.toString(), data))
                  await Model.User.updateOne({ _id: current_user?._id }, { banks: newBanks } );
                  
                  break;
                }
              }
              break;
            }
    
            case "displayName":{
              await Model.User.updateOne({ _id: current_user?._id }, { displayName: data } );
              break;
            }
    
            case "avatar":{
              let fileObject = data?.file
      
              const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
              const stream = createReadStream();
              const assetUniqName = Utils.fileRenamer(filename);
              let pathName = `/app/uploads/${assetUniqName}`;
              
              const output = fs.createWriteStream(pathName)
              stream.pipe(output);
      
              await new Promise(function (resolve, reject) {
                output.on('close', () => {
                  resolve();
                });
          
                output.on('error', async(err) => {
                  await Utils.loggerError(req, err.toString());
      
                  reject(err);
                });
              });
      
              // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`
              await Model.User.updateOne({ _id: current_user?._id }, { avatar: { url: `images/${assetUniqName}`, filename, encoding, mimetype } } );
            
              break;
            }
          }
    
          cache.ca_delete(current_user?._id.toString())
    
          let user = await Utils.getUserFull({_id: current_user?._id}) 
          pubsub.publish("ME", { me: { mutation: "UPDATE", data: user } });
    
          return {
            status: true,
            data: user,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }
      }
    },

    async book(parent, args, context, info) {
      let start = Date.now()
      let { input } = args        
      let { req } = context
      let { id, itemId } = input
      
      let { current_user } =  await Utils.checkAuth(req);

      let supplier = await Model.Supplier.findById(id);
      if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')
      if(supplier?.expire) throw new AppError(Constants.EXPIRE_DATE, 'Expire date.')

      cache.ca_delete(current_user?._id.toString())
      
      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        /*
        ใช้ในกรณี user ต้องการซื้อ ร้านเดิน แต่ต้องการ ซื้อหลายครั้ง
        เช่น ร้าน A ขายหวย ชุด A1 แล้ว user z ซื้อหวย ชุด A1 ไปแล้วต้องการซื้อ หวยเพิ่มเราจะมองว่าเป็นคนละ Transition เพือให้ง่ายต้องการ manage
        */
        let tran = await Model.Transition.findOne({ refId: supplier?._id, userId: current_user?._id, status: Constants.WAIT });
        if(_.isNull( tran )){
          tran =  await Model.Transition.create( { refId: supplier?._id, userId: current_user?._id } )
        }

        let check =  _.find(supplier?.buys, (buy)=> buy.itemId == itemId && buy.userId.toString() === current_user?._id.toString() )
        if(check === undefined){
          let { money_balance } = await Utils.getBalance(current_user?._id)

          if(supplier?.priceUnit > money_balance){
            console.log("Constants.NOT_ENOUGH_BALANCE >>")
            throw new AppError(Constants.NOT_ENOUGH_BALANCE, 'NOT ENOUGH BALANCE')
          }

          await Utils.updateSupplier({ _id: id }, {...supplier._doc, buys: [...supplier?.buys, {userId: current_user?._id, itemId, transitionId: tran?._id, selected: 0 }] })   
        }else{
          let buys = _.filter(supplier?.buys, (buy)=> buy.itemId !==itemId && buy.userId !==current_user?._id )
          await Utils.updateSupplier({ _id: id }, {...supplier._doc, buys })   
        }
     
        let newSupplier = await Utils.getSupplier({ _id: id })

        // Case current open multi browser
        pubsub.publish("SUPPLIER_BY_ID", {
          supplierById: { mutation: "BOOK", data: newSupplier },
        });

        // Case other people open home page
        pubsub.publish("SUPPLIERS", {
          suppliers: { mutation: "BOOK", data: newSupplier },
        });

        let user = await Utils.getUserFull({_id: current_user?._id}) 

        // pubsub.publish("ME", {
        //   me: { mutation: "BOOK", data: { userId: current_user?._id, data: user } },
        // });

        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          user,
          data: newSupplier,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        await session.abortTransaction();
        console.log(`book #error : ${error}`)
        
        throw new AppError(error?.extensions?.code, error?.message)
      } finally {
        session.endSession();
        console.log("book #finally")
      }
    },

    async buy(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !== Constants.AUTHENTICATED &&
          Utils.checkRole(current_user) !== Constants.SELLER  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let tran = await Model.Transition.findOne({ refId: _id, userId: current_user?._id, status:  Constants.WAIT});

        await Utils.updateSupplier({ _id }, { "$set": { "buys.$[].selected": 1 } }, { arrayFilters: [{ $and: [{'buys.$[].transitionId': tran._id}, { 'buys.$[].userId': current_user?._id }] }], timestamps: true })
        await Model.Transition.updateOne( { _id: tran._id }, { status: Constants.APPROVED } )
  
        console.log("buy #process ", tran, _id)

        // Commit the transaction
        await session.commitTransaction();

        let supplier = await Utils.getSupplier({ _id })
  
        // Case current open multi browser
        pubsub.publish("SUPPLIER_BY_ID", {
          supplierById: { mutation: "BOOK", data: supplier },
        });
  
        // Case other people open home page
        pubsub.publish("SUPPLIERS", {
          suppliers: { mutation: "BOOK", data: supplier },
        });
  
        let user = await Utils.getUserFull( {_id: current_user?._id} ) 
        // pubsub.publish("ME", {
        //   me: { mutation: "BUY", data: { userId: current_user?._id, data: user } },
        // });
  
        return {
          status: true,
          transitionId: tran._id,
          data: supplier,
          user,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }

      }catch(error){
        await session.abortTransaction();
        console.log(`buy #error : ${error} - ${ Utils.dumpError(error) }`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("buy #finally")
      }
    },

    async cancelTransition(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let { n , nModified, ok } = await Utils.updateSuppliers({ _id }, { $pull: {buys: { userId: current_user?._id }} })
        if(ok){
          console.log("n , nModified, ok ::", n , nModified, ok)
          await Model.Transition.updateOne( { refId: _id }, {status: Constants.CANCEL} )

          cache.ca_delete(current_user?._id.toString())

          let user = await Utils.getUserFull({_id: current_user?._id}) 
          pubsub.publish("ME", { me: { mutation: "CANCEL", data: { userId: current_user?._id, data: user } } });

          let newSupplier = await Utils.getSupplier({ _id })

          pubsub.publish("SUPPLIERS", { suppliers: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier } });

          return {
            status: true,
            data: newSupplier, 
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        console.log(`cancelTransition #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("cancelTransition #finally")
      }

      return {
        status: false,
        message: "supplier not update",
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    // Add/Edit supplier
    async lottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("supplier :", input)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR && 
          Utils.checkRole(current_user) !==Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      if(input.test){
        let supplier = await Model.Supplier.create(input);
        return {
          status: true,
          data: supplier,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }

      switch(input.mode.toLowerCase()){
        case "new":{
          cache.ca_delete("length")
          let newFiles = [];
          if(!_.isEmpty(input.files)){
        
            for (let i = 0; i < input.files.length; i++) {
              const { createReadStream, filename, encoding, mimetype } = (await input.files[i]).file //await input.files[i];
  
              const stream = createReadStream();
              const assetUniqName = Utils.fileRenamer(filename);
              let pathName = `/app/uploads/${assetUniqName}`;
    
              const output = fs.createWriteStream(pathName)
              stream.pipe(output);
    
              await new Promise(function (resolve, reject) {
                output.on('close', () => {
                  resolve();
                });
          
                output.on('error', async(err) => {
                  await Utils.loggerError(req, err.toString());
    
                  reject(err);
                });
              });
    
              // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
              newFiles.push({ url: `images/${assetUniqName}`, filename, encoding, mimetype });
            }
          }

          let supplier = await Model.Supplier.create({ ...input, files:newFiles, ownerId: current_user?._id });
        
          return {
            status: true,
            data: supplier,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{  
          cache.ca_delete(input._id)

          let newFiles = [];
          if(!_.isEmpty(input.files)){
  
            for (let i = 0; i < input.files.length; i++) {
              try{
                let fileObject = (await input.files[i]).file
  
                if(!_.isEmpty(fileObject)){
                  const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
                  const stream = createReadStream();
                  const assetUniqName = Utils.fileRenamer(filename);
                  let pathName = `/app/uploads/${assetUniqName}`;
                  
        
                  const output = fs.createWriteStream(pathName)
                  stream.pipe(output);
        
                  await new Promise(function (resolve, reject) {
                    output.on('close', () => {
                      resolve();
                    });
              
                    output.on('error', async(err) => {
                      await Utils.loggerError(req, err.toString());
        
                      reject(err);
                    });
                  });
        
                  // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
                  newFiles.push({ url: `images/${assetUniqName}`, filename, encoding, mimetype });
                }else{
                  if(input.files[i].delete){
                    let pathUnlink = '/app/uploads/' + input.files[i].url.split('/').pop()
                    fs.unlink(pathUnlink, async(err)=>{
                        if (err) {
                          await Utils.loggerError(req, err);
                        }else{
                          // if no error, file has been deleted successfully
                          console.log('File has been deleted successfully ', pathUnlink);
                        }
                    });
                  }else{
                    newFiles = [...newFiles, input.files[i]]
                  }
                }
                // console.log("updatePost #6:", newFiles)
              } catch(err) {
                await Utils.loggerError(req, err.toString());
              }
            }
          }
  
          let newInput = {...input, files:newFiles}

          await Utils.updateSupplier({ _id: input._id }, newInput )

          return {
            status: true,
            data: await Utils.getSupplier({ _id: input._id }),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "delete":{  
          await Model.Supplier.deleteOne( {"_id": mongoose.Types.ObjectId(input?._id)});
          return {
            status: true,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    async deposit(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !== Constants.AUTHENTICATED && Utils.checkRole(current_user) !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      const { createReadStream, filename, encoding, mimetype } = (await input.file).file

      const stream = createReadStream();
      const assetUniqName = Utils.fileRenamer(filename);
      let pathName = `/app/uploads/${assetUniqName}`;

      const output = fs.createWriteStream(pathName)
      stream.pipe(output);

      await new Promise(function (resolve, reject) {
        output.on('close', () => {
          resolve();
        });
  
        output.on('error', async(err) => {
          await Utils.loggerError(req, err.toString());

          reject(err);
        });
      });

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let deposit = await Model.Deposit.create({balance: input?.balance, 
                                          date: input?.date, 
                                          bankId: input?.bankId, 
                                          file: { url: `images/${assetUniqName}`, filename, encoding, mimetype }, 
                                          userIdRequest: current_user?._id })

        if(deposit?._id){
          await Model.Transition.create({
                                    type: Constants.DEPOSIT, 
                                    refId: deposit?._id, 
                                    userId: current_user?._id
                                  })
        }
    
        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          data: deposit,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        await session.abortTransaction();
        console.log(`deposit #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("deposit #finally")
      }
    },

    async withdraw(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.SELLER && 
          role !==Constants.AUTHENTICATED) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let withdraw = await Model.Withdraw.create({ ...input,  userIdRequest: current_user?._id });

        if(withdraw?._id){
          await Model.Transition.create({
                                    type: Constants.WITHDRAW, 
                                    refId: withdraw?._id, 
                                    userId: current_user?._id
                                  })
        }
    
        // Commit the transaction
        await session.commitTransaction();
        return {
          status: true,
          data: withdraw,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        await session.abortTransaction();
        console.log(`deposit #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("deposit #finally")
      }
    },

    async bank(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("new bank : ", input, current_user, current_user?._id )

          let bank = await Model.Bank.create({ input });
          
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: bank,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{
          let { input } = args

          console.log("edit bank :", input)
  
          let bank = await Model.Bank.findOneAndUpdate({ _id: input._id }, input, { new: true });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: bank,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    async follow(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !== Constants.AUTHENTICATED && Utils.checkRole(current_user) !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      cache.ca_delete(_id)

      let supplier = await Utils.getSupplier({_id})
      if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      let {follows} = supplier  
      if(!_.isEmpty(follows)){
        let isFollow = _.find(follows, (follow)=>_.isEqual(follow.userId, current_user?._id))
        if(_.isEmpty(isFollow)){
          follows = [...follows, {userId: current_user?._id}]
        }else{
          follows = _.filter(follows, (follow)=>!_.isEqual(follow.userId, current_user?._id))
        }
      }else{
        follows = [{userId: current_user?._id}]
      }

      await Utils.updateSupplier({ _id }, { follows });
      let data  = await Utils.getSupplier({_id});
      return {
        status: true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async datesLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( !_.isEqual(Utils.checkRole(current_user), Constants.AMDINISTRATOR) ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      await Promise.all( _.map(input, async(date, weight)=>{
                          let dateLottery =  await Model.DateLottery.findOne({date})
                          _.isEmpty(dateLottery) ? await Model.DateLottery.create({ date, weight }) : await dateLottery.updateOne({ weight })
                        }))

      let dateLottery = await Model.DateLottery.find({})
      dateLottery = _.filter( await Promise.all( _.map(dateLottery, async(i)=>{
        let suppliers = await Utils.getSupplier({ dateLottery: i?._id }) 
        return _.isEmpty(suppliers) ?  null : {...i?._doc, suppliers }
      })), i => !_.isNull(i))

      return {
        status: true,
        data: dateLottery,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async notification(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      console.log("notification :", _id)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied!')

      // let supplier = await Model.Supplier.findOne({_id})
      // if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      // let {follows} = supplier  
      // if(!_.isEmpty(follows)){
      //   let isFollow = _.find(follows, (follow)=>_.isEqual(follow.userId, current_user?._id))
      //   if(_.isEmpty(isFollow)){
      //     follows = [...follows, {userId: current_user?._id}]
      //   }else{
      //     follows = _.filter(follows, (follow)=>!_.isEqual(follow.userId, current_user?._id))
      //   }
      // }else{
      //   follows = [{userId: current_user?._id}]
      // }

      // await Model.Supplier.updateOne( { _id }, { follows } );
      // supplier = await Model.Supplier.findOne({_id})
      
      return {
        status: true,
        // data: {...supplier._doc, owner: (await Model.User.findById(supplier.ownerId))?._doc },
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async comment(parent, args, context, info) {
      let start = Date.now()
      let { req } = context
      let { input } = args

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.AUTHENTICATED && 
          role !==Constants.AMDINISTRATOR  &&
          role !==Constants.SELLER) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let comment = await Model.Comment.findOne({ _id: input?._id })

      if(_.isNull(comment)){
        comment = await Model.Comment.create(input);
        pubsub.publish("COMMENT_BY_ID", {
          commentById: {
            mutation: "CREATED",
            commentId: comment?._id,
            data: comment,
          },
        });
      }else{
        await Model.Comment.updateOne({ _id: input?._id }, input );
        comment = await Model.Comment.findOne({ _id: input?._id })
        pubsub.publish("COMMENT_BY_ID", {
          commentById: {
            mutation: "UPDATED",
            commentId: comment?._id,
            data: comment,
          },
        });
      }
      
      return {
        status:true,
        commentId: comment?._id,
        data: comment,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async contactUs(parent, args, context, info){
      let start = Date.now()
      let { input } = args
      let { req } = context

      await Utils.checkAuth(req);

      let newFiles = [];
      if(!_.isEmpty(input.files)){
        for (let i = 0; i < input.files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = (await input.files[i]).file //await input.files[i];

          const stream = createReadStream();
          const assetUniqName = Utils.fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;

          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', async(err) => {
              await Utils.loggerError(req, err.toString());

              reject(err);
            });
          });

          // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
          newFiles.push({ url: `images/${assetUniqName}`, filename, encoding, mimetype });
        }
      }

      let contactUs = await Model.ContactUs.create({ ...input, files:newFiles });
    
      return {
        status: true,
        data: contactUs,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async subscribe(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !== Constants.AUTHENTICATED &&
          Utils.checkRole(current_user) !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let { subscriber } = await Utils.getUserFull({ _id })
      if( _.find(subscriber, (item)=> _.isEqual(item.userId, current_user?._id)) ) {
        await Model.User.updateOne({ _id }, { subscriber: _.filter(subscriber, (item)=> !_.isEqual(item.userId, current_user?._id)) })
      }else{
        await Model.User.updateOne({ _id }, { subscriber: [...subscriber, {userId: current_user?._id}] })
      }
      return {
        status: true,
        data: await Utils.getUserFull({ _id }),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async adminDeposit(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let aggregate = [
                        { 
                          $match: { _id: mongoose.Types.ObjectId(input?._id) } 
                        },
                        {
                          $lookup: {
                            localField: "refId",
                            from: "deposit",
                            foreignField: "_id",
                            as: "deposit"
                          }
                        },
                        {
                          $unwind: {
                              path: "$deposit",
                              preserveNullAndEmptyArrays: false
                          }
                        },
                      ]

      let transition = await Model.Transition.aggregate(aggregate);
      console.log("adminDeposit #2 ", transition)

      if(_.isEmpty(transition)){
        return {
          status: false,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }      
      }

      transition = transition[0]
      console.log("adminDeposit #3 ", transition)

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        await Model.Transition.updateOne({ _id: input?._id }, { status : input?.status });

        switch(input?.status){
          case Constants.APPROVED:
          case Constants.REJECT:{
            let newInput =  {
                              user_to_notify: transition.userId,
                              user_id_approve: current_user?._id,
                              type: 1,
                              status: input?.status,
                              data: transition,
                              message: input?.message
                            }
                            
            await Model.Notification.create(newInput);
          }
        }
        
        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        
        throw new AppError(Constants.SYSTEM_ERROR, error);
      } finally {
        session.endSession();
      }

      cache.ca_delete( transition?.userId.toString() )
      if(_.isEqual(input?.status, Constants.APPROVED)){
        let user = await Utils.getUserFull({_id: transition?.userId}) 

        pubsub.publish("ME", { me: { mutation: "DEPOSIT", data: {userId: transition?.userId , data: user } } });
      }

      return {
        status: true,
        mode: input?.status,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async adminWithdraw(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let transition = await Model.Transition.findOne({ _id: input?._id })
      
      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        await Model.Transition.updateOne({ _id: input?._id }, { status : input?.status });

        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        
        throw new AppError(Constants.SYSTEM_ERROR, error);
      } finally {
        session.endSession();
      }

      if(_.isEqual(input?.status, Constants.APPROVED)){
        let user = await Utils.getUserFull({_id: transition?.userId}) 
        pubsub.publish("ME", { me: { mutation: "DEPOSIT", data: {userId: transition?.userId , data: user } } });
      }

      return {
        status: true,
        mode: input?.status,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async manageLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let result = {input}

      switch(input?.mode.toLowerCase()){
        case "new":
        case "edit":{
          const startDateTime = moment(input.start_date_time);
          const endDateTime   = moment(input.end_date_time);
          const diff          = endDateTime.diff(startDateTime);
          const diffDuration  = moment.duration(diff);

          // var duration = moment.duration(now.diff(end));
          // var days = diffDuration.asDays();

          // console.log("diffDuration.asDays() :", diffDuration.asDays())
    
          if(diffDuration.asDays() < 5) throw new AppError(Constants.ERROR, 'Date start - end > 5 day')
          
          if(input?._id){
            let newInput =  _.omit(input, ['_id', 'mode']);
            await Model.ManageLottery.updateOne({ _id: input?._id }, newInput);
    
            let data = await Model.ManageLottery.findOne({ _id: input?._id });
    
            return  { ...result, 
                      status: true,
                      data,
                      executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
                    }   
          }else{
            let newInput  =  _.omit(input, ['mode']);
            let data      = await Model.ManageLottery.create(newInput);
    
            return  {
                      ...result, 
                      status: true,
                      data,
                      executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
                    }   
          }
        }
        case "delete":{
          await Model.ManageLottery.deleteOne({_id: mongoose.Types.ObjectId(input?._id)});
          return  {
                    ...result, 
                    status: true,
                    executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
                  }   
        }
      }
    },

    async forceLogout(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("forceLogout :", input)
      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      switch(input?.mode.toLowerCase()){
        case "all":{
          let sessions = await Model.Session.find()
          _.map(sessions, async(session)=>{
            let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
            let current_user = await Utils.getUser({_id: userId}) 
            pubsub.publish("ME", { me: { mutation: "FORCE_LOGOUT", data: { userId: current_user?._id } } });
          })

          await Model.Session.deleteMany({})
          return  { 
            status: true,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }  
        }

        case "id":{
          let session = await Model.Session.findOne({_id: mongoose.Types.ObjectId(input?._id)});
          let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
          let current_user = await Utils.getUser({_id: userId}) 
          
          pubsub.publish("ME", { me: { mutation: "FORCE_LOGOUT", data: { userId: current_user?._id } } });

          await Model.Session.deleteOne({_id: mongoose.Types.ObjectId(input?._id)});

          return  { 
            status: true,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }  
        }
      }
      return  { 
        status: false,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    async expireLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("expireLottery :", input)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let manageL = await Model.ManageLottery.findOne({_id: mongoose.Types.ObjectId(input?._id)})
      console.log("expireLottery manageL :", manageL, manageL?.end_date_time)

      var now = moment(manageL?.end_date_time); //todays date
      var end = moment( new Date() ); // another date
      var duration = moment.duration(now.diff(end));
      var days = duration.asDays();
      console.log("different date @1 :", days)
      if(days > 0){
        throw new AppError(Constants.ERROR, 'ไม่สามารถปิดได้เพราะว่าเปิดขายอยู่')
      }

      let suppliers  =  await Model.Supplier.find({ manageLottery: mongoose.Types.ObjectId(input?._id) })

      _.map(suppliers, async supplier=>{
        await Model.Supplier.updateOne({ _id: supplier._id }, { expire: true });
      })
      
      return  { 
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    async calculateLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("Calculate lottery :", input)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      let manageL = await Model.ManageLottery.findOne({_id: mongoose.Types.ObjectId(input?._id)})
      console.log("Calculate lottery manageL :", manageL)

      let bon = manageL?.bon
      let lang = manageL?.lang
      if( _.isEmpty(bon) || _.isEmpty(lang) ){
        throw new AppError(Constants.ERROR, 'ผลการออกรางวัล กรอกไม่ครบ')
      }

      let transitionsBon = await Model.Transition.aggregate([
                      {
                        $match: { type: Constants.SUPPLIER, status: Constants.APPROVED }
                      },
                      {
                        $lookup: {
                          localField: "refId",
                          from: "supplier",
                          pipeline: [
                              {
                                $match: { 
                                  type: 0,  //  0: bon, 1: lang
                                  kind: 0,  //  0: thai, 1: laos, 2: vietnam
                                  manageLottery: mongoose.Types.ObjectId(input?._id),
                                  // buys:{
                                  //   $elemMatch: {
                                  //     selected: 1, 
                                  //     itemId: parseInt(bon)
                                  //   }
                                  // }
                                }
                              }
                          ],
                          foreignField: "_id",
                          as: "supplier"
                        }
                      },
                      {
                        $lookup: {
                          localField: "userId",
                          from: "user",
                          foreignField: "_id",
                          as: "user"
                        }
                      },
                      {
                        $unwind: {
                            path: "$supplier",
                            preserveNullAndEmptyArrays: false
                        }
                      },
                      {
                        $unwind: {
                          path: "$user",
                          preserveNullAndEmptyArrays: true
                        }
                      }
                  ])

      let transitionsLang = await Model.Transition.aggregate([
                      {
                        $match: { type: Constants.SUPPLIER, status: Constants.APPROVED }
                      },
                      {
                        $lookup: {
                          localField: "refId",
                          from: "supplier",
                          pipeline: [
                              {
                                $match: { 
                                  type: 1,   //  0: bon, 1: lang
                                  kind: 0,   //  0: thai, 1: laos, 2: vietnam
                                  manageLottery: mongoose.Types.ObjectId(input?._id),
                                  // buys:{
                                  //   $elemMatch: {
                                  //     selected: 1, 
                                  //     itemId: parseInt(lang)
                                  //   }
                                  // } 
                                }
                              }
                          ],
                          foreignField: "_id",
                          as: "supplier"
                        }
                      },
                      {
                        $lookup: {
                          localField: "userId",
                          from: "user",
                          foreignField: "_id",
                          as: "user"
                        }
                      },
                      {
                        $unwind: {
                            path: "$supplier",
                            preserveNullAndEmptyArrays: false
                        }
                      },
                      {
                        $unwind: {
                          path: "$user",
                          preserveNullAndEmptyArrays: true
                        }
                      }
                  ])

      let transitionsBonAndLang = await Model.Transition.aggregate([
                      {
                        $match: { type: Constants.SUPPLIER, status: Constants.APPROVED }
                      },
                      {
                        $lookup: {
                          localField: "refId",
                          from: "supplier",
                          pipeline: [
                              {
                                $match: { 
                                  type: 2,   //  0: bon, 1: lang, 2: couple
                                  kind: 0,   //  0: thai, 1: laos, 2: vietnam
                                  manageLottery: mongoose.Types.ObjectId(input?._id),
                                  // buys:{
                                  //   $elemMatch: {
                                  //     selected: 1, 
                                  //     itemId: parseInt(lang)
                                  //   }
                                  // } 
                                }
                              }
                          ],
                          foreignField: "_id",
                          as: "supplier"
                        }
                      },
                      {
                        $lookup: {
                          localField: "userId",
                          from: "user",
                          foreignField: "_id",
                          as: "user"
                        }
                      },
                      {
                        $unwind: {
                            path: "$supplier",
                            preserveNullAndEmptyArrays: false
                        }
                      },
                      {
                        $unwind: {
                          path: "$user",
                          preserveNullAndEmptyArrays: true
                        }
                      }
                  ])

      _.map(transitionsBon, async t=>{
        let { buys } = t?.supplier
        console.log("transitionsBon buys :", buys)

        if(_.find(buys, buy=> buy.selected === 1 && buy.itemId === parseInt(bon) ) ){
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: true });
        }else{
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: false });
        }
      })

      _.map(transitionsLang, async t=>{
        let { buys } = t?.supplier
        console.log("transitionsLang buys :", buys)

        if(_.find(buys, buy=> buy.selected === 1 && buy.itemId === parseInt(lang) ) ){
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: true });
        }else{
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: false });
        }
      })

      // 
      _.map(transitionsBonAndLang, async t=>{
        let { buys } = t?.supplier
        console.log("transitionsBonAndLang buys :", buys)

        if(_.find(buys, buy=> buy.selected === 1 && (buy.itemId === parseInt(bon) || buy.itemId === parseInt(lang))  ) ){
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: true });
        }else{
          await Model.Transition.updateOne({ _id: t._id }, { expire: true, isLucky: false });
        }
      })

      return  { 
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    async testNodeCacheSave(parent, args, context, info) {
      
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)

      let v = {
                  "myKeyA": { my: "Special", variable: 123 },
                  "myKeyB": { the: "Glory", answer: 42 }
              }

      // let get = cache.ca_get("A")

      // console.log("get :", get)

      let save = cache.ca_save("A", v)

      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    },

    async testNodeCacheGet(parent, args, context, info) {
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)

      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }

      let get = cache.ca_get("A")

      console.log("get :", get, _.isEmpty(get))
      // let save = cache.ca_save("A", v)
      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      // console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    },

    async testNodeCacheDelete(parent, args, context, info) {
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)
      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }

      let ca_delete = cache.ca_delete("A")
      if(ca_delete){
        console.log("ca_delete :", ca_delete)
      }

      // console.log("ca_delete :", ca_delete)

      // let save = cache.ca_save("A", v)

      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      // console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    },

    // search(input: SearchInput): JSON
    async search(parent, args, context, info) {
      let start = Date.now()

      let { input } = args
      let { req } = context

      let { TITLE, NUMBER } = input

      let q = _.map(NUMBER.split(","), (v, i)=>{
                return {
                          "buys":{
                            $not:{ $elemMatch : {itemId: parseInt(v)} } 
                          }
                        }
              })

      let suppliers  = await Model.Supplier.aggregate([
                        { 
                            $match: { "$and" : q }
                        },
                        {
                          $lookup: {
                              localField: "ownerId",
                              from: "user",
                              foreignField: "_id",
                              pipeline: [
                                { $project:{ username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 }}
                              ],
                              as: "owner"
                          }
                      },
                      {
                          $unwind: {
                                  "path": "$owner",
                                  "preserveNullAndEmptyArrays": false
                          }
                      }
                      ])

      return {
        status: true,
        data: suppliers,
        total: suppliers?.length,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    async crypto(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      return {
        status: true,
        data: cryptojs.AES.decrypt(input?.encrypt, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    /*
      async createConversation(parent, args, context, info) {
      try{
        let {input} = args
        
        let currentUser = await User.findById(input.userId);
        let friend = await User.findById(input.friendId);

        let result =  await Conversation.findOne({ "members.userId": { $all: [ currentUser._id.toString(), input.friendId ] } });
                        
        if(result === null){
          result = await Conversation.create({
            // name: friend.displayName,
            lastSenderName: currentUser.displayName,
            info:"",
            // avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].base64,
            // avatarName: friend.displayName,
            senderId: currentUser._id.toString(),
            status: "available",
            // unreadCnt: 0,
            sentTime: Date.now(),
            // userId: input.friendId,
            // members: [input.userId, input.friendId],
            // members: {[input.userId]:{ 
            //                           name: currentUser.displayName, 
            //                           avatarSrc: _.isEmpty(currentUser.image) ? "" :  currentUser.image[0].base64,
            //                           unreadCnt: 0 
            //                         }, 
            //           [input.friendId]:{ 
            //                           name: friend.displayName, 
            //                           avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].base64,
            //                           unreadCnt: 0 
            //                         }},
            members:[
              { 
                userId: currentUser._id.toString(),
                name: currentUser.displayName, 
                avatarSrc: _.isEmpty(currentUser.image) ? "" :  currentUser.image[0].url,
                unreadCnt: 0 
              },
              {
                userId: input.friendId,
                name: friend.displayName, 
                avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].url,
                unreadCnt: 0 
              }
            ]
          });

          pubsub.publish("CONVERSATION", {
            conversation: {
              mutation: "CREATED",
              data: result,
            },
          });
        }else{
          pubsub.publish("CONVERSATION", {
            conversation: {
              mutation: "UPDATED",
              data: result,
            },
          });
        }
        
        return result;

      } catch(err) {
        await Utils.loggerError(req, err.toString());
        return;
      }
    },
    async updateConversation(parent, args, context, info) {
      try{
        let {_id, input} = args

        let result = await Conversation.findOneAndUpdate({
          _id
        }, input, {
          new: true
        })

        pubsub.publish("CONVERSATION", {
          conversation: {
            mutation: "UPDATED",
            data: result,
          },
        });

        console.log("updateConversation friend : ", result)

        return result;
      } catch(err) {
        await Utils.loggerError(req, err.toString());
        return;
      }
    },
    */

    async conversation(parent, args, context, info) {
      let { mode } = args
      let { req } = context
      try{
        let start = Date.now()

        let { current_user } =  await Utils.checkAuth(req);
        let role = Utils.checkRole(current_user)
        if( role !== Constants.AMDINISTRATOR &&
            role !== Constants.AUTHENTICATED &&
            role !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

        switch(mode.toLowerCase()){
          case "new":{
            let friend = await Model.User.findById(mongoose.Types.ObjectId(args?._id))
            let conv =  await Model.Conversation.findOne({ "members.userId": { $all: [ current_user._id, mongoose.Types.ObjectId(args?._id) ] } });            
                  
            if( _.isNull(conv) ){
              let input = {
                            lastSenderName: current_user.displayName,
                            info:"",
                            senderId: current_user._id,
                            status: Constants.STATUS_DELIVERED,
                            sentTime: Date.now(),
                            members:[
                              { 
                                userId: current_user._id,
                                name: current_user.displayName, 
                                avatarSrc: _.isEmpty(current_user.avatar) ? "" :  current_user.avatar.url,
                                unreadCnt: 0 
                              },
                              {
                                userId: mongoose.Types.ObjectId(args?._id),
                                name: friend.displayName, 
                                avatarSrc: _.isEmpty(friend.avatar) ? "" :  friend.avatar.url,
                                unreadCnt: 0 
                              }
                            ]
                          }
              conv = await Model.Conversation.create(input);
            }
  
            return {
              status: true,
              data: conv,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            } 

          }

          case "edit":{
            break;
          }

          case "delete":{
            console.log("conversation :", args)

            await Model.Conversation.deleteOne({ _id: mongoose.Types.ObjectId(args?._id) });
            await Model.Message.deleteMany({conversationId: mongoose.Types.ObjectId(args?._id)});

            return {
              status: true,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            } 
            break;
          }
        }

      } catch(err) {
        await Utils.loggerError(req, err.toString());

        throw new AppError(Constants.ERROR, err.toString())
      }
    },

    async message(parent, args, context, info) {
      let start = Date.now()
      let { mode, input } = args
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.AMDINISTRATOR &&
          role !== Constants.AUTHENTICATED &&
          role !== Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      // console.log("message :", args, current_user)

      if(input.type === "image"){
        let {payload, files} = input

        let url = [];
        for (let i = 0; i < files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = await files[i];
          const stream = createReadStream();
          const assetUniqName = fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;
          
          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', async(err) => {
              await Utils.loggerError(req, err.toString());

              reject(err);
            });
          });

          // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
          url.push({ url: `images/${assetUniqName}` });
        }

        input = {...input, payload: _.map(payload, (p, index)=>{ return {...p, src: url[index].url} })}
        input = _.omit(input, ['files'])
      }

      let message = await Model.Message.findById(input._id);

      // if(_.isEmpty(result)){
      input = { ...input, 
                senderId: current_user?._id, 
                senderName: current_user?.displayName, 
                sentTime: Date.now(), 
                status: Constants.STATUS_DELIVERED,
                reads: []}
        
      message = await Model.Message.create(input);
      try {
        let conversation = await Model.Conversation.findById(input.conversationId);
        if(!_.isEmpty(conversation)){
          await Model.Conversation.updateOne({ _id: input.conversationId }, { 
                                                                              senderId: current_user._id,
                                                                              lastSenderName: current_user.displayName,
                                                                              info:input.message,
                                                                              status: Constants.STATUS_DELIVERED,
                                                                              sentTime: Date.now(),
                                                                            });
          /*
          conversation = _.omit({...conversation._doc}, ["_id", "__v"])

          let newMember = _.find(conversation.members, member => member.userId !==current_user?._id);


          // หาจำนวน unread total = (await Post.find().lean().exec()).length; 
          // https://www.educative.io/answers/what-is-the-ne-operator-in-mongodb
          let unreadCnt = (await Model.Message.find({ conversationId: input.conversationId, 
                                                      senderId: {$all : current_user?._id.toString()}, 
                                                      status: 'sent',
                                                      reads: { $nin: [ newMember.userId ] }
                                                    }).lean().exec()).length; 
          // หาจำนวน unread

          newMember = {...newMember, unreadCnt}
          
          let newMembers = _.map(conversation.members, (member)=>member.userId == newMember.userId ? newMember : member)

          conversation = {...conversation, lastSenderName:current_user?.displayName, info:input.message, sentTime: Date.now(), members: newMembers }

          await Model.Conversation.findOneAndUpdate({ _id : input.conversationId }, conversation, { new: true })

          // let p = pubsub.publish("CONVERSATION", {
          //   conversation: {
          //     mutation: "UPDATED",
          //     data: conversat,
          //   },
          // });
          */

          conversation = await Model.Conversation.findById(input.conversationId);
          pubsub.publish("CONVERSATION", {
            conversation: {
              mutation: "UPDATED",
              data: conversation,
            },
          });
        }else{

          let newMember = _.find(conversation.members, member => member.userId !==current_user?._id);
          let friend = await Model.User.findById(mongoose.Types.ObjectId(newMember.userId))
          let input = {
            senderId: current_user._id,
            lastSenderName: current_user.displayName,
            info:input.message,
            status: Constants.STATUS_DELIVERED,
            sentTime: Date.now(),
            members:[
              { 
                userId: current_user._id,
                name: current_user.displayName, 
                avatarSrc: _.isEmpty(current_user.avatar) ? "" :  current_user.avatar?.url,
                unreadCnt: 0 
              },
              {
                userId: mongoose.Types.ObjectId(_id),
                name: friend.displayName, 
                avatarSrc: _.isEmpty(friend.avatar) ? "" :  friend.avatar?.url,
                unreadCnt: 0 
              }
            ]
          }
          await Model.Conversation.create(input);
        }
      } catch (err) {
        console.log("conversation err:" , err)
      }

        // pubsub.publish('MESSAGE', {
        //   message:{
        //     mutation: 'CREATED',
        //     data: result
        //   }
        // });
      // }

      // mode: MessageMode!, conversationId: ID!
      // console.log("message : ", input)
      // let { currentUser } = context

      // if(_.isEmpty(currentUser)){
      //   return;
      // }

      /*
      console.log("addMessage : ", args)

      let { userId, conversationId, input } = args


      let { req } = context

      let authorization = await checkAuthorization(req);
      let { status, code, current_user } =  authorization


      ///////////////////////
      if(input.type === "image"){
        let {payload, files} = input

        let url = [];
        for (let i = 0; i < files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = await files[i];
          const stream = createReadStream();
          const assetUniqName = fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;
          

          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', (err) => {
              await Utils.loggerError(req, err.toString());

              reject(err);
            });
          });

          const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
          url.push({ url: urlForArray });
        }

        input = {...input, payload: _.map(payload, (p, index)=>{ return {...p, src: url[index].url} })}
        input = _.omit(input, ['files'])
      }

      /////////////////////////

      let result = await Message.findById(input._id);

      
      // let currentUser = await User.findById(userId);
      
      if(_.isEmpty(result)){
        input = { ...input, 
                  conversationId, 
                  senderId: current_user?._id.toString(), 
                  senderName: current_user?.displayName, 
                  sentTime: Date.now(), 
                  status: "sent",
                  reads: []}
         
        result = await Message.create(input);

        try {
          let conversation = await Conversation.findById(conversationId);
  
          if(!_.isEmpty(conversation)){
            conversation = _.omit({...conversation._doc}, ["_id", "__v"])
  
            let newMember = _.find(conversation.members, member => member.userId !==current_user?._id.toString());
  
  
            // หาจำนวน unread total = (await Post.find().lean().exec()).length; 
            // https://www.educative.io/answers/what-is-the-ne-operator-in-mongodb
            let unreadCnt = (await Message.find({ conversationId, 
                                                  senderId: {$all : current_user?._id.toString()}, 
                                                  status: 'sent',
                                                  reads: { $nin: [ newMember.userId ] }}).lean().exec()).length; 
            // หาจำนวน unread
  
            newMember = {...newMember, unreadCnt}
            
            let newMembers = _.map(conversation.members, (member)=>member.userId == newMember.userId ? newMember : member)
  
            conversation = {...conversation, lastSenderName:current_user?.displayName, info:input.message, sentTime: Date.now(), members: newMembers }
  
            let conversat = await Conversation.findOneAndUpdate({ _id : conversationId }, conversation, { new: true })
  
            let p = pubsub.publish("CONVERSATION", {
              conversation: {
                mutation: "UPDATED",
                data: conversat,
              },
            });
          }
        } catch (err) {
          console.log("conversation err:" , err)
        }

        pubsub.publish('MESSAGE', {
          message:{
            mutation: 'CREATED',
            data: result
          }
        });
      }
      */

      let conversation = await Model.Conversation.findById(input.conversationId);

      pubsub.publish('MESSAGE', { message:{ mutation: 'CREATED', data: message } });
      pubsub.publish("CONVERSATION", { conversation: { mutation: "UPDATED", data: conversation } });

      return {
        status: true,
        data: message,
        conversation,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }   
    },

    async content(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("content :", input)

      let { current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')

      // return {
      //   status: true,
      //   executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      // }

      switch(input.mode.toLowerCase()){
        case "new":{
          let basicContent = await Model.BasicContent.create(input);
          return {
            status: true,
            data: basicContent,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{  
          await Model.BasicContent.updateOne({ _id: input._id },  input, {});
          let basicContent = await Model.BasicContent.findOne({ _id: input._id })
          return {
            status: true,
            data: basicContent,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "delete":{  
          await Model.BasicContent.deleteOne( {"_id": mongoose.Types.ObjectId(input?._id)});
          return {
            status: true,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    async pay(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      // console.log("pay @1 :", input)

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')


      let newFiles = [];
      if(!_.isEmpty(input.files)){

        for (let i = 0; i < input.files.length; i++) {
          try{
            let fileObject = (await input.files[i]).file

            if(!_.isEmpty(fileObject)){
              const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
              const stream = createReadStream();
              const assetUniqName = Utils.fileRenamer(filename);
              let pathName = `/app/uploads/${assetUniqName}`;
              
    
              const output = fs.createWriteStream(pathName)
              stream.pipe(output);
    
              await new Promise(function (resolve, reject) {
                output.on('close', () => {
                  resolve();
                });
          
                output.on('error', async(err) => {
                  await Utils.loggerError(req, err.toString());
    
                  reject(err);
                });
              });
    
              // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
              newFiles.push({ url: `images/${assetUniqName}`, filename, encoding, mimetype });
            }else{
              if(input.files[i].delete){
                let pathUnlink = '/app/uploads/' + input.files[i].url.split('/').pop()
                fs.unlink(pathUnlink, async(err)=>{
                    if (err) {
                      await Utils.loggerError(req, err);
                    }else{
                      // if no error, file has been deleted successfully
                      console.log('File has been deleted successfully ', pathUnlink);
                    }
                });
              }else{
                newFiles = [...newFiles, input.files[i]]
              }
            }
            // console.log("updatePost #6:", newFiles)
          } catch(err) {
            await Utils.loggerError(req, err.toString());
          }
        }
      }

      let newInput = {...input, files:newFiles}

      // console.log("pay @2 :", newInput)

      newInput = _.omit(newInput, ["id"])

      // console.log("pay @3 :", newInput)

      await Model.Transition.updateOne( { _id: input?.id }, newInput )

      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async lotteryClone(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      console.log("lotteryClone @1 :", _id, await Utils.cloneLottery(_id))

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.AMDINISTRATOR && 
          role !==Constants.SELLER ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')


      // let newFiles = [];
      // if(!_.isEmpty(input.files)){

      //   for (let i = 0; i < input.files.length; i++) {
      //     try{
      //       let fileObject = (await input.files[i]).file

      //       if(!_.isEmpty(fileObject)){
      //         const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
      //         const stream = createReadStream();
      //         const assetUniqName = Utils.fileRenamer(filename);
      //         let pathName = `/app/uploads/${assetUniqName}`;
              
    
      //         const output = fs.createWriteStream(pathName)
      //         stream.pipe(output);
    
      //         await new Promise(function (resolve, reject) {
      //           output.on('close', () => {
      //             resolve();
      //           });
          
      //           output.on('error', async(err) => {
      //             await Utils.loggerError(req, err.toString());
    
      //             reject(err);
      //           });
      //         });
    
      //         // const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
      //         newFiles.push({ url: `images/${assetUniqName}`, filename, encoding, mimetype });
      //       }else{
      //         if(input.files[i].delete){
      //           let pathUnlink = '/app/uploads/' + input.files[i].url.split('/').pop()
      //           fs.unlink(pathUnlink, async(err)=>{
      //               if (err) {
      //                 await Utils.loggerError(req, err);
      //               }else{
      //                 // if no error, file has been deleted successfully
      //                 console.log('File has been deleted successfully ', pathUnlink);
      //               }
      //           });
      //         }else{
      //           newFiles = [...newFiles, input.files[i]]
      //         }
      //       }
      //       // console.log("updatePost #6:", newFiles)
      //     } catch(err) {
      //       await Utils.loggerError(req, err.toString());
      //     }
      //   }
      // }

      // let newInput = {...input, files:newFiles}

      // // console.log("pay @2 :", newInput)

      // newInput = _.omit(newInput, ["id"])

      // // console.log("pay @3 :", newInput)

      // await Model.Transition.updateOne( { _id: input?.id }, newInput )

      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
  },
  Subscription:{
    me: {
      resolve: (payload) =>{
        return payload.me
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["ME"])
        }, async(payload, variables) => {
          try{

            console.log("sub ME @1 :", variables)
            let { userId } = variables
            // if(_.isEmpty(userId)){
            //   return false;
            // }

            let {mutation, data} = payload.me

            // userId
            // let authorization = await Utils.checkAuthorizationWithSessionId(sessionId);
            // let { current_user } =  authorization

            console.log( "sub ME @2 :", payload )
            switch(mutation){
              case "DEPOSIT":
              case "WITHDRAW":
              case "BOOK":
              case "BUY":
              case "CANCEL":{
                return _.isEqual(data?.userId.toString(), userId.toString()) ? true : false;
              }
              case "UPDATE":{
                return _.isEqual(data?._id.toString(), userId.toString()) ? true : false;
              }
              case "FORCE_LOGOUT":{
                return _.isEqual(data?.userId.toString(), userId.toString()) ? true : false;
              }
            }

            console.log( "Subscription : ME @3 :", data?.userId, userId, _.isEqual(data?.userId, userId) )  

            return false;
          } catch(err) {
            console.log("Subscription : ME #Constants.ERROR =", err.toString())           
            return false;
          }
        }
      )
    },
    subscriptionSupplierById: {
      resolve: (payload) =>{
        return payload.supplierById
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["SUPPLIER_BY_ID"])
        }, (payload, variables) => {

          let {mutation, data} = payload.supplierById

          console.log("subscriptionSupplierById : ", mutation, variables?._id == data?._id)
          switch(mutation){
            case "BOOK":
            case "UNBOOK":
            case "AUTO_CLEAR_BOOK":
              {
                return variables?._id == data?._id
              }
          }
          return false;
        }
      )
    },
    subscriptionSuppliers: {
      resolve: (payload) =>{
        return payload.suppliers
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["SUPPLIERS"])
        }, (payload, variables) => {

          console.log("subscriptionSuppliers")

          let {mutation, data} = payload.suppliers

          switch(mutation){
            case "BOOK":
            case "UNBOOK":
            case "AUTO_CLEAR_BOOK":
              {
                return _.includes(JSON.parse(variables.supplierIds), data._id.toString())
              }
          }

          return false;
        }
      )
    },
    subscriptionAdmin: {
      resolve: (payload) =>{
        return payload.admin
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["ADMIN"])
        }, (payload, variables) => {

          console.log("subscriptionAdmin")

          let {mutation, data} = payload.admin

          // switch(mutation){
          //   case "BOOK":
          //   case "UNBOOK":
          //   case "AUTO_CLEAR_BOOK":
          //     {
          //       return _.includes(JSON.parse(variables.supplierIds), data._id.toString())
          //     }
          // }

          return true;
        }
      )
    },
    subscriptionCommentById: {
      resolve: (payload) =>{
        return payload.commentById 
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["COMMENT_BY_ID"])
        }, (payload, variables) => {

          let {mutation, commentId, data} = payload?.commentById

          // console.log("COMMENT_BY_ID : ", mutation, commentId, variables )
          switch(mutation){
            case "CREATED":
            case "UPDATED":
              return variables?._id == commentId
            default:
              return false;
          }
        }
      )
    },
    // subConversation: {
    //   resolve: (payload) =>{
    //     return payload.conversation
    //   },
    //   subscribe: withFilter((parent, args, context, info) => {
    //       return pubsub.asyncIterator(["CONVERSATION"])
    //     }, (payload, variables, context) => {
    //       let {mutation, data} = payload.conversation
          
    //       // let {currentUser} = context
    //       // if(_.isEmpty(currentUser)){
    //       //   return false;
    //       // }
    //       // console.log("CONVERSATION: ", payload)
    //       switch(mutation){
    //         case "CREATED":
    //         case "UPDATED":
    //         case "DELETED":
    //           {
    //             return _.findIndex(data.members, (o) => o.userId == variables.userId ) > -1
    //           }
    //         case "CONNECTED":
    //         case "DISCONNECTED":{
    //           // console.log("CONVERSATION :::: ", mutation, data)
    //         }
    //       }

    //       return false;
          
    //     }
    //   )
    // },
    subMessage: {
      resolve: (payload) =>{
        return payload.message
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["MESSAGE"])
        }, async (payload, variables, context) => {
          let {mutation, data} = payload.message

          // if(variables.conversationId === data.conversationId &&  variables.userId !== data.senderId) {
            
          //   let conversation = await Model.Conversation.findById(variables.conversationId);

          //   // console.log("MESSAGE ::", variables, data)

          //   if(!_.isEmpty(conversation)){

          //     // update all message to read
          //     await Message.updateMany({
          //         conversationId: variables.conversationId, 
          //         senderId: { $nin: [ variables.userId ] },
          //         status: 'sent',
          //         reads: { $nin: [ variables.userId ] }
          //       }, 
          //       // {$set: {reads: [ userId ] }}
          //       { $push: {reads: variables.userId } }
          //     )

          //     // update conversation  unreadCnt = 0
          //     // conversation = _.omit({...conversation._doc}, ["_id", "__v"])
          
          //     // conversation = {...conversation, members: _.map(conversation.members, (member)=>member.userId == variables.userId ? {...member, unreadCnt:0} : member) }

          //     // let newConversation = await Model.Conversation.findOneAndUpdate({ _id : variables.conversationId }, conversation, { new: true })

          //     // pubsub.publish("CONVERSATION", {
          //     //   conversation: {
          //     //     mutation: "UPDATED",
          //     //     data: newConversation,
          //     //   }
          //     // });
          //   }
          // }
          return data.conversationId === variables.conversationId && data.senderId !== variables.userId
        }
      )
    },
    conversations: {
      resolve: (payload) =>{
        return payload.conversation
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["CONVERSATION"])
        }, async (payload, variables, context, info) => {
          let { userId } = variables
          let { mutation, data } = payload.conversation
          switch(mutation){
            case "CREATED":
            case "UPDATED":
              return _.find( data?.members, m=> _.isEqual(m.userId.toString(), userId.toString()) ) ? true : false
          }

          return false;
        }
      )
    },
  },
}