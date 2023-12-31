import jwt from 'jsonwebtoken';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);
import mongoose from 'mongoose';
import cryptojs from "crypto-js";
import * as fs from "fs";
import * as path from 'path';

import AppError from "./AppError"

import * as Model from "../model"
import * as Constants from "../constants"
import * as cache from "../cache"

import logger from "./logger";

export const loggerError = async(req, message) =>{
   let { current_user } = await checkAuth(req);
   let user_agent = userAgent(req)
   logger.error( message, 
                    {
                      username: current_user,
                      ipAddress: "127.0.0.1",
                      userAgent: user_agent
                    }
                )
}

export const loggerInfo = async(req, message) =>{
    let { current_user } = await checkAuth(req);
    let user_agent = userAgent(req)
    logger.info( message, 
                    {
                        username: current_user,
                        ipAddress: "127.0.0.1",
                        userAgent: user_agent
                    }
                )
 }

export const emailValidate = () =>{
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
}

export const fileRenamer = (filename) => {
    const queHoraEs = Date.now();
    const regex = /[^a-zA-Z]/g ///[\s_-]/gi;
    const fileTemp = filename.replace(regex, ".");
    let arrTemp = [fileTemp.split(".")];
    return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};

export const getSession = async(userId, input) => {  
    await Model.Session.remove({userId})
    let session = await Model.Session.create({  ...input, 
                                                userId, 
                                                token: jwt.sign(userId.toString(), process.env.JWT_SECRET)});
  
    return cryptojs.AES.encrypt(session?._id.toString(), process.env.JWT_SECRET).toString() 
}

export const checkAuth = async(req) => {
    let pathname = ""
    if(req.headers && req.headers["custom-location"]){
        let customLocation = JSON.parse(req.headers["custom-location"])
        pathname = customLocation?.pathname
    }

    /*
    if (req.headers && req.headers.authorization) {
        var auth    = req.headers.authorization;
        var parts   = auth.split(" ");
        var bearer  = parts[0];
        var sessionId   = cryptojs.AES.decrypt(parts[1], process.env.JWT_SECRET).toString(cryptojs.enc.Utf8);
        
        console.log("checkAuth # ", auth, req.headers)
        if (bearer == "Bearer") {
            let session = await Model.Session.findOne({_id: sessionId});
            if(!_.isEmpty(session)){
                var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));

                // code
                // -1 : force logout
                //  0 : anonymums
                //  1 : OK
                if(expiredDays >= 0){
                    let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
                    let current_user = await Model.User.findOne({_id: userId});

                    if(!_.isNull(current_user)){
                        return {
                            status: true,
                            code: Constants.SUCCESS,
                            pathname,
                            current_user,
                        }
                    }
                }
            }
            await Model.Session.deleteOne( {"_id": sessionId} )
        }else if(bearer == "Basic"){
            // checkAuth #  Basic YmFubGlzdDpiYW5saXN0MTIzNA==
            return {
                status: false,
                code: Constants.USER_NOT_FOUND,
                message: "without user  user"
            }
        }
        // force logout
        throw new AppError(Constants.FORCE_LOGOUT, 'Expired!')
    }
    */
    if (req.headers && req.headers["custom-authorization"]) {
        var auth    = req.headers["custom-authorization"];
        var parts   = auth.split(" ");
        var bearer  = parts[0];
        var sessionId   = cryptojs.AES.decrypt(parts[1], process.env.JWT_SECRET).toString(cryptojs.enc.Utf8);
        
        // console.log("checkAuth # ", auth, req.headers)
        if (bearer == "Bearer") {
            let session = await Model.Session.findOne({_id: sessionId});
            // console.log("checkAuth #  session @1 : ", session)
            if(!_.isEmpty(session)){
                var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));

                // code
                // -1 : force logout
                //  0 : anonymums
                //  1 : OK
                if(expiredDays >= 0){
                    let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
                    let current_user = await getUser({_id: userId}) //await Model.User.findOne({_id: userId});

                    if(!_.isNull(current_user)){
                        return {
                            status: true,
                            code: Constants.SUCCESS,
                            pathname,
                            current_user,
                        }
                    }
                }
            }
            throw new AppError(Constants.FORCE_LOGOUT, 'Expired!')
        }else if(bearer == "Basic"){
            // checkAuth #  Basic YmFubGlzdDpiYW5saXN0MTIzNA==
            return {
                status: false,
                code: Constants.USER_NOT_FOUND,
                message: "without user - anonymous user"
            }
        }
        // force logout
        throw new AppError(Constants.FORCE_LOGOUT, 'Expired!')
    }

    // console.log("checkAuth #2")
    // without user (anonymous)
    return {
        status: false,
        code: Constants.USER_NOT_FOUND,
        message: "without user - anonymous user"
    }
}

export const userAgent = (req) => {
    if (req.headers && req.headers["user-agent"]) {
        return req.headers["user-agent"];
    }
    return "no-user-agent";
}

export const checkAuthorizationWithSessionId = async(sessionId) => {
    // let decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("sessionId > ", sessionId)
    var sId   = cryptojs.AES.decrypt(sessionId, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8);
       
    let session = await Model.Session.findById(sId)   

    if(!_.isEmpty(session)){
        var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));

        // console.log("session expired :", session.expired, expiredDays, req)

        // code
        // -1 : force logout
        //  0 : anonymums
        //  1 : OK
        if(expiredDays >= 0){
            let userId  = jwt.verify(session.token, process.env.JWT_SECRET);


            // console.log("checkAuthorization : ", session.token, userId )
            // return {...req, currentUser: await Model.User.findById(userId)} 

            return {
                status: true,
                code: Constants.SUCCESS,
                current_user: await Model.User.findById(userId),
            }
        }

        await Model.Session.deleteOne( {"_id": sessionId} )

        // force logout
        return {
            status: false,
            code: Constants.FORCE_LOGOUT,
            message: "session expired days"
        }
    }

    // without user
    return {
        status: false,
        code: Constants.USER_NOT_FOUND,
        message: "without user"
    }
}

export const getBalance = async(userId) =>{    
    let aggregate = [
                        { 
                            $match: { userId: mongoose.Types.ObjectId(userId), 
                                        status: {$in: [Constants.WAIT, Constants.APPROVED]},
                                        // status: Constants.APPROVED,
                                        type: {$in: [Constants.SUPPLIER, Constants.DEPOSIT, Constants.WITHDRAW]}  } 
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
                                path: "$supplier",
                                preserveNullAndEmptyArrays: true
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
                    ];

    let transitions = await Model.Transition.aggregate(aggregate);

    let money_use       = 0; // เงินที่เรากดซื้อหวย สำเร็จแล้ว
    let money_lock      = 0; // เงินที่เรากดจองหวย สำเร็จแล้ว
    let money_deposit   = 0; // เงินฝาก สำเร็จแล้ว
    let money_withdraw  = 0; // เงินถอน สำเร็จแล้ว
    let in_carts        = [];
    _.map(transitions, (transition) =>{
        switch(transition.type){
            case Constants.SUPPLIER:{
                let { supplier } = transition
                if(supplier !== undefined){
                    let { priceUnit, buys } = supplier
                    if(transition.status === Constants.WAIT){
                        let filter = _.filter( buys, (buy)=> _.isEqual(buy.transitionId, transition._id) )
                        money_lock += filter.length * priceUnit
                    }else if(transition.status === Constants.APPROVED){
                        let filter = _.filter( buys, (buy)=> _.isEqual(buy.transitionId, transition._id) )
                        money_use += filter.length * priceUnit
                    }
                    in_carts = [...in_carts, transition]
                }
                break
            } 
            case Constants.DEPOSIT:{
                let { status, deposit } = transition
                if(status === Constants.APPROVED){
                    let { balance } = deposit
                    money_deposit += balance;
                }
            break
            } 
            case Constants.WITHDRAW:{
                let { status, withdraw } = transition
                if(status === Constants.APPROVED){
                    let { balance } = withdraw
                    money_withdraw += balance;
                }
            break
            }
        }
    })  

    let money_balance = money_deposit - ( money_use + money_lock - money_withdraw )

    return { transitions, money_balance, money_use, money_lock, money_deposit, money_withdraw, in_carts }
}

/*
export const getBalance = async(userId) =>{    
    let supplier =  await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: {$in: [Constants.WAIT, Constants.APPROVED]}, type: Constants.SUPPLIER  } 
                        },
                        {
                            $lookup: {
                                localField: "refId",
                                from: "supplier",
                                foreignField: "_id",
                                pipeline: [{ $match: { buys: { $elemMatch : { userId }} }}],
                                as: "supplier"
                            }                 
                        },
                        {
                            $unwind: {
                                path: "$supplier",
                                preserveNullAndEmptyArrays: false
                            }
                        }
                    ])

    let deposit =   await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: Constants.APPROVED , type: Constants.DEPOSIT  } 
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
                        }
                    ])

    let withdraw = await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: 14 , type: 12  } 
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
                                path: "$withdraw",
                                preserveNullAndEmptyArrays: false
                            }
                        }
                    ])
    
    let balance     = 0;
    _.map(supplier, (sup)=>{
        let buys = _.filter(sup.supplier.buys, (buy)=> _.isEqual(buy.userId, userId))
        balance -= buys.length * sup.supplier.price
    })

    _.map(deposit, (dep)=>{
        balance +=dep?.deposit?.balance
    })

    _.map(withdraw, (dep)=>{
        balance -=dep?.withdraw?.balance
    })

    return balance
}

export const getBalanceBook = async(userId) =>{    
    let supplier = await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: {$in: [Constants.WAIT, Constants.APPROVED]} , type: Constants.SUPPLIER  } 
                        },
                        {
                            $lookup: {
                                localField: "refId",
                                from: "supplier",
                                foreignField: "_id",
                                pipeline: [{ $match: { buys: { $elemMatch : { userId }} }}],
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
    
    let balanceBook = 0;
    _.map(supplier, (sup)=>{
        let filters = _.filter(sup.supplier.buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0 )
        balanceBook += filters.length * sup.supplier.price
    })
    
    return balanceBook
}

export const getInTheCarts = async(userId) =>{
    let supplier = await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: {$in: [Constants.WAIT, Constants.APPROVED]} , type: Constants.SUPPLIER  } 
                        },
                        {
                            $lookup: {
                                localField: "refId",
                                from: "supplier",
                                foreignField: "_id",
                                pipeline: [{ $match: { buys: { $elemMatch : { userId }} }}],
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
    return supplier
}
*/

// export const checkBalanceBook = async(userId) =>{
//     try{
//         let suppliers = await Model.Supplier.find({buys: { $elemMatch : {userId}}})
//         let prices  =   _.filter( await Promise.all(_.map(suppliers, async(supplier)=>{
//                             let { price, buys } = supplier;
//                             let filters = _.filter(buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0 )
//                             return price * filters.length
//                         })), (p)=>p!=0)
//         return _.reduce(prices, (ps, i) => ps + i, 0);
//     } catch(err) {
//         console.log("error :", err)
//         return 0;
//     }
// }

export const checkBalance = async(userId) =>{
    let supplier =  await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: {$in: [Constants.WAIT, Constants.APPROVED]} , type: Constants.SUPPLIER  } 
                        },
                        {
                            $lookup: {
                                localField: "refId",
                                from: "supplier",
                                foreignField: "_id",
                                pipeline: [{ $match: { buys: { $elemMatch : { userId }} }}],
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

    let deposit =   await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: Constants.APPROVED , type: Constants.DEPOSIT  } 
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
                                "path": "$deposit",
                                "preserveNullAndEmptyArrays": false
                            }
                        }
                    ])

    let withdraw = await Model.Transition.aggregate([
                        { 
                            $match: { userId, status: 14 , type: 12  } 
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
                            "path": "$withdraw",
                            "preserveNullAndEmptyArrays": false
                        }
                        }
                    ])

    let balance     = 0;
    let balanceBook = 0;
    _.map(supplier, (sup)=>{
        let buys = _.filter(sup.supplier.buys, (buy)=> _.isEqual(buy.userId, userId))
        balance -= buys.length * sup.supplier.priceUnit

        let filters = _.filter(sup.supplier.buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0 )
        balanceBook += filters.length * sup.supplier.priceUnit
    })

    _.map(deposit, (dep)=>{
        balance +=dep?.deposit?.balance
    })

    _.map(withdraw, (dep)=>{
        balance -=dep?.withdraw?.balance
    })
} 

export const checkRole = (user) =>{
    if(user?.roles){
        let { REACT_APP_USER_ROLES } = process.env

        // console.log("checkRole :", user?.roles, REACT_APP_USER_ROLES)
        if(_.includes( user?.roles, _.split(REACT_APP_USER_ROLES, ',' )[0]) ){
            return Constants.AMDINISTRATOR;
        }
        else if(_.includes( user?.roles, _.split(REACT_APP_USER_ROLES, ',' )[2]) ){
            return Constants.SELLER;
        }
        else if(_.includes( user?.roles, _.split(REACT_APP_USER_ROLES, ',' )[1]) ){
            return Constants.AUTHENTICATED;
        }
    }
    return Constants.ANONYMOUS;
}

export const getUser = async(query, without_password = true) =>{
    let fields = { username: 1, password: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, producer: 1, lastAccess: 1 }
    if(without_password){
        fields = { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, producer: 1, lastAccess: 1 }
    }

    // if(query?._id){
    //     let cache_user = cache.ca_get( query?._id.toString() )
    //     if(!_.isEmpty(cache_user)){
    //         return cache_user
    //     }else{
    //         let user =  await Model.User.findOne( query,  fields )
    //         cache.ca_save( query?._id.toString() , user._doc)
    //         return user
    //     }       
    // }

    return  await Model.User.findOne( query, fields )
}

export const getUserFull = async(query) =>{
    let user =  await Model.User.findOne(query, { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, producer: 1, lastAccess: 1, lockAccount: 1 } )

    // if(user) {
    //     let cache_user = cache.ca_get(user?._doc?._id.toString())

    //     if(!_.isEmpty(cache_user)){
    //         return cache_user
    //     }else{
            // let { banks } = user
            // banks = _.filter(await Promise.all(_.map(banks, async(value)=>{
            //             let bank = await Model.Bank.findOne({_id: value.bankId})
            //             return _.isNull(bank) ? null : {...value._doc, name:bank?.name}
            //         })), e=>!_.isNull(e) ) 

            let { money_balance, money_lock, in_carts } = await getBalance(user?._id)
      
            let cache_user = {  ...user?._doc, 
                            // banks, 
                            balance: money_balance,//await getBalance(user?._id), 
                            balanceBook: money_lock, // await getBalanceBook(user?._id),
                            transitions: [], 
                            inTheCarts: in_carts, // await getInTheCarts(user?._id)
                        }
            // cache.ca_save(user?._doc?._id.toString(), cache_user)

            return cache_user
        // }        
    // }else{
    //     return null
    // }
}

export const getUsers = async(query) =>{
    return await Model.User.find(query, {   username: 1, 
                                            email: 1, 
                                            displayName: 1, 
                                            banks: 1, 
                                            roles: 1, 
                                            avatar: 1, 
                                            subscriber: 1, 
                                            producer: 1,
                                            lastAccess: 1 })
}

export const getSupplier = async(query) =>{
    let cache_supplier = cache.ca_get(query?._id)
    // if(!_.isEmpty(cache_supplier)){
    //     return cache_supplier;
    // }

    cache_supplier = await Model.Supplier.aggregate([
        { 
            $match: {_id: mongoose.Types.ObjectId(query?._id)} 
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
            $lookup: {
                localField: "manageLottery",
                from: "manageLottery",
                foreignField: "_id",
                // pipeline: [ { $project:{ date: 1 }} ],
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
    ])

    cache.ca_save(query?._id, cache_supplier[0])
    return cache_supplier[0];
}

export const getTotalSupplier = async() =>{
    // let key = "length"
    // let length = cache.ca_get(key)
    // if(!_.isEmpty(length)){
    //     return length;
    // }
    // length = (await Model.Supplier.find({})).length
    // cache.ca_save(key, length)
    let length = (await Model.Supplier.find({})).length
    return length
}

export const updateSupplier = async(filter, update, options = {}) =>{
    cache.ca_delete(filter?._id)
    return await Model.Supplier.updateOne( filter,  update, options );
}

export const updateSuppliers = async(filter, update, options = {}) =>{
    return await Model.Supplier.updateMany( filter,  update, options );
}

export const getLineNumber = () => {
    const error = new Error();
    const stackTrace = error.stack.split('\n')[2]; // Adjust the index based on your needs
  
    // Extract the line number using a regular expression
    const lineNumber = stackTrace.match(/:(\d+):\d+/)[1];
    
    return parseInt(lineNumber);
}

export const dumpError = (err) => {
    if (typeof err === 'object') {
      if (err.message) {
        console.log('\nMessage: ' + err.message)
      }
      if (err.stack) {
        console.log('\nStacktrace:')
        console.log('====================')
        console.log(err.stack);
      }
    } else {
      console.log('dumpError :: argument is not an object');
    }
}

export const divide = (a, b) => {
    if (b === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    return a / b;
}

export const cloneLottery = async(id) => {
    try {
        // Find the user by ID
        //   const originalUser = await User.findById(userId);
        let originalSuppliers = await Model.Supplier.findById(id)
    
        // Clone the user using toObject
        const clonedSuppliersObject = originalSuppliers.toObject();
    
        // Make modifications to the cloned object (for example, change username)
        clonedSuppliersObject.buys = [];
        clonedSuppliersObject.follows = []
    
        // Create a new Mongoose document with the cloned object
        //   const clonedUser = new User(clonedUserObject);
        const clonedSuppliers = new Model.Supplier(clonedSuppliersObject);
        clonedSuppliers._id   = new mongoose.Types.ObjectId();
        clonedSuppliers.files = [];
        clonedSuppliers.publish = false;
        clonedSuppliers.expire = false;
        await clonedSuppliers.save()

        let newFiles = [];
        _.map(originalSuppliers?.files, async originalFile=>{
            const imageBuffer = await fs.promises.readFile(`/app/uploads${ _.replace(originalFile.url, "images", "") }`);// fs.readFileSync(originalFile.url);

            const assetUniqName = fileRenamer(originalFile.filename);
            const newImagePath =  `/app/uploads/${assetUniqName}`;// `path/to/new/image/${clonedUser._id}.jpg`;
            await fs.promises.writeFile(newImagePath, imageBuffer);

            newFiles.push({ url: `images/${assetUniqName}`, filename: originalFile.filename, encoding: originalFile.encoding, mimetype: originalFile.mimetype });
            
            if(originalSuppliers?.files.length === newFiles.length){
                clonedSuppliers.files = newFiles;
                await clonedSuppliers.save()
            }
        })

        return clonedSuppliers;
      /*
      // Read the image file content
      const imageBuffer = await fs.readFile(originalUser.profileImage);
  
      // Save the image file for the new user
      const newImagePath = `path/to/new/image/${clonedUser._id}.jpg`;
      await fs.writeFile(newImagePath, imageBuffer);
  
      // Update the profileImage path for the new user
      clonedUser.profileImage = newImagePath;
      await clonedUser.save();
      */
  
      console.log('User cloned and modified successfully.');
    } catch (error) {
      console.error('Error cloning and modifying user:', error);
    } finally {
        //   mongoose.disconnect();
    }
}