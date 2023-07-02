import jwt from 'jsonwebtoken';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);

import * as Model from "../model"
import * as Constants from "../constants"
import * as cache from "../cache"

export const emailValidate = () =>{
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
}

export const fileRenamer = (filename) => {
    const queHoraEs = Date.now();
    const regex = /[\s_-]/gi;
    const fileTemp = filename.replace(regex, ".");
    let arrTemp = [fileTemp.split(".")];
    return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};

export const getSessionId = async(userId, input) => {  
    await Model.Session.remove({userId})

    // let session = await Model.Session.findOne({userId, deviceAgent: newInput.deviceAgent})
    // if(_.isEmpty(session)){
    //     let  session = await Model.Session.create(newInput);
    // }

    let session = await Model.Session.create({...input, 
                                        userId, 
                                        token: jwt.sign(userId.toString(), process.env.JWT_SECRET)});
  
    return session?._id.toString()
}

export const checkAuthorization = async(req) => {
    let pathname = ""
    if(req.headers && req.headers["custom-location"]){
        let customLocation = JSON.parse(req.headers["custom-location"])

        pathname = customLocation?.pathname
    }

    if (req.headers && req.headers.authorization) {
        var auth    = req.headers.authorization;
        var parts   = auth.split(" ");
        var bearer  = parts[0];
        var sessionId   = parts[1];
        
        if (bearer == "Bearer") {
            // let decode = jwt.verify(token, process.env.JWT_SECRET);
            // console.log("sessionId > ", sessionId)
            let session = await Model.Session.findOne({_id:sessionId})   
            if(!_.isEmpty(session)){
                var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));
                // code
                // -1 : force logout
                //  0 : anonymums
                //  1 : OK
                if(expiredDays >= 0){
                    let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
    
    
                    // console.log("checkAuthorization expiredDays : ", session.token, userId, expiredDays )
                    // return {...req, currentUser: await Model.User.findById(userId)} 
    
                    return {
                        status: true,
                        code: Constants.SUCCESS,
                        pathname,
                        current_user: await Model.User.findOne({_id: userId}),
                    }
                }
            }

            await Model.Session.deleteOne( {"_id": sessionId} )
        }

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

export const checkAuthorizationWithSessionId = async(sessionId) => {
    // let decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("sessionId > ", sessionId)
    let session = await Model.Session.findById(sessionId)   

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

export const checkBalance = async(userId) =>{
    try{
        let transitions = await Model.Transition.find({userId, status: Constants.APPROVED });
        transitions = await Promise.all(_.map(transitions, async(transition)=>{
            switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                case Constants.SUPPLIER:{
                    let supplier = await Model.Supplier.findOne({_id: transition.refId})
                    let buys = _.filter(supplier.buys, (buy)=> _.isEqual(buy.userId, userId))

                    let balance = buys.length * supplier.price

                    // console.log("checkBalance >>>> ",  supplier.price , " , >> ", buys ," = ", balance)
                    return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                }

                case Constants.DEPOSIT:{
                    let deposit = await Model.Deposit.findOne({_id: transition.refId})
                    return {...transition._doc, title: "title", balance: deposit.balance, description: "description", dateLottery: "dateLottery"}
                }

                case Constants.WITHDRAW:{
                    let withdraw = await Model.Withdraw.findOne({_id: transition.refId})
                    return {...transition._doc, title: "title", balance: withdraw.balance, description: "description", dateLottery: "dateLottery"}
                }
            }
        }))

        let balance = 0;
        _.map(transitions, (transition) => {
            switch (transition.type) {
                case Constants.SUPPLIER: {
                    balance += -Math.abs(transition.balance);
                break;
                }
                
                case Constants.DEPOSIT: {
                    balance += Math.abs(transition.balance);
                break;
                }

                case Constants.WITHDRAW: {
                    balance += -Math.abs(transition.balance);
                break;
                }

                default: {
                break;
                }
            }
        });

        let inTheCarts = _.filter( await Promise.all(_.map(transitions, async(transition)=>{
            switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                case Constants.SUPPLIER:{
                    let supplier = await Model.Supplier.findById(transition.refId)

                    let books = _.filter(supplier.buys, (buy)=> _.isEqual(buy.userId, userId) && (buy.selected == 0 || buy.selected == 1 ))
                    if(!_.isEmpty(books)){
                        // console.log("inTheCarts item :", books, transition?.refId)
                        return transition?.refId
                    }
                    return null;
                }

                default:{
                    return null;
                }
            }
        })), (i)=> !_.isNull(i))

        let suppliers = await Model.Supplier.find({buys: { $elemMatch : {userId}}})
        let prices  =   _.filter( await Promise.all(_.map(suppliers, async(supplier)=>{
                            let { price, buys } = supplier;
                            let filters = _.filter(buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0 )
                            return price * filters.length
                        })), (p)=>p!=0)

        let balanceBook =  _.reduce(prices, (ps, i) => ps + i, 0);

        return {balance, transitions, inTheCarts, balanceBook}
    } catch(err) {
        console.log(" err o checkBalance :", err.message)
        return {balance: 0, transitions: [], inTheCarts: []}
    }
}

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

export const checkRole = (user) =>{
    if(user?.roles){
        if(_.includes( user?.roles, Constants.AMDINISTRATOR)){
            return Constants.AMDINISTRATOR;
        }
        else if(_.includes( user?.roles, Constants.AUTHENTICATED)){
            return Constants.AUTHENTICATED;
        }
    }
    return Constants.ANONYMOUS;
}

export const getUser = async(query) =>{
    let user =  await Model.User.findOne(query, { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 } )

    if(user) {
        let cache_user = cache.ca_get(user?._doc?._id.toString())

        if(!_.isEmpty(cache_user)){
            console.log("getUser : for cache")
            return cache_user
        }else{
            let { banks } = user
            banks = _.filter(await Promise.all(_.map(banks, async(value)=>{
                        let bank = await Model.Model.Bank.findOne({_id: value.bankId})
                        return _.isNull(bank) ? null : {...value._doc, name:bank?.name}
                    })), e=>!_.isNull(e) ) 

            cache_user = {...user?._doc, banks, ...await checkBalance(user?._id)}
            cache.ca_save(user?._doc?._id.toString(), cache_user)

            return cache_user
        }        
    }else{
        return null
    }
}

export const getUsers = async(query) =>{
    return await Model.User.find(query, { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 })
}

export const getSupplier = async() =>{
    return 
}

export const getLineNumber = () => {
    const error = new Error();
    const stackTrace = error.stack.split('\n')[2]; // Adjust the index based on your needs
  
    // Extract the line number using a regular expression
    const lineNumber = stackTrace.match(/:(\d+):\d+/)[1];
    
    return parseInt(lineNumber);
}
