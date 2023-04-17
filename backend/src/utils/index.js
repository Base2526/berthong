import jwt from 'jsonwebtoken';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);

import { User, Session, Transition, Supplier, Deposit, Withdraw } from '../model'

import { AMDINISTRATOR, AUTHENTICATED, ANONYMOUS, SUCCESS, ERROR, FORCE_LOGOUT, DATA_NOT_FOUND, USER_NOT_FOUND } from "../constants"

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
    await Session.remove({userId})

    // let session = await Session.findOne({userId, deviceAgent: newInput.deviceAgent})
    // if(_.isEmpty(session)){
    //     let  session = await Session.create(newInput);
    // }

    let session = await Session.create({...input, 
                                        userId, 
                                        token: jwt.sign(userId.toString(), 
                                        process.env.JWT_SECRET)});
  
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
            let session = await Session.findById(sessionId)   
            if(!_.isEmpty(session)){
                var expiredDays = parseInt((session.expired - new Date())/ (1000 * 60 * 60 * 24));
                // code
                // -1 : force logout
                //  0 : anonymums
                //  1 : OK
                if(expiredDays >= 0){
                    let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
    
    
                    console.log("checkAuthorization expiredDays : ", session.token, userId, expiredDays )
                    // return {...req, currentUser: await User.findById(userId)} 
    
                    return {
                        status: true,
                        code: SUCCESS,
                        pathname,
                        current_user: await User.findById(userId),
                    }
                }
            }

            await Session.deleteOne( {"_id": sessionId} )
        }

        // force logout
        return {
            status: false,
            code: FORCE_LOGOUT,
            message: "session expired days"
        }
    }

    // without user
    return {
        status: false,
        code: USER_NOT_FOUND,
        message: "without user"
    }
}

export const checkAuthorizationWithSessionId = async(sessionId) => {
    // let decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("sessionId > ", sessionId)
    let session = await Session.findById(sessionId)   

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
            // return {...req, currentUser: await User.findById(userId)} 

            return {
                status: true,
                code: SUCCESS,
                current_user: await User.findById(userId),
            }
        }

        await Session.deleteOne( {"_id": sessionId} )

        // force logout
        return {
            status: false,
            code: FORCE_LOGOUT,
            message: "session expired days"
        }
    }

    // without user
    return {
        status: false,
        code: USER_NOT_FOUND,
        message: "without user"
    }
}

export const checkBalance = async(userId) =>{
    try{
        let transitions = await Transition.find({userId, status: 1 });

        transitions = await Promise.all(_.map(transitions, async(transition)=>{
            switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                case 0:{
                    let supplier = await Supplier.findById(transition.refId)
                    let buys = _.filter(supplier.buys, (buy)=> _.isEqual(buy.userId, userId))

                    // let books = _.filter(supplier.buys, (buy)=> _.isEqual(buy.userId, userId) && selected == 0)
                    // if(!_.isEmpty(books)){
                    //     inTheCart = [...inTheCart, transition?.refId]
                    // }
                    
                    let balance = buys.length * supplier.price
                    return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                }

                case 1:{
                    let deposit = await Deposit.findById(transition.refId)
                    return {...transition._doc, title: "title", balance: deposit.balance, description: "description", dateLottery: "dateLottery"}
                }

                case 2:{
                    let withdraw = await Withdraw.findById(transition.refId)
                    return {...transition._doc, title: "title", balance: withdraw.balance, description: "description", dateLottery: "dateLottery"}
                }
            }
        }))

        let balance = 0;
        _.map(transitions, (transition) => {
            switch (transition.type) {
                case 0: {
                    balance += -Math.abs(transition.balance);
                break;
                }
                
                case 1: {
                    balance += Math.abs(transition.balance);
                break;
                }

                case 2: {
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
                case 0:{
                    let supplier = await Supplier.findById(transition.refId)

                    let books = _.filter(supplier.buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0)
                    if(!_.isEmpty(books)){
                        console.log("inTheCarts item :", books, transition?.refId)
                        return transition?.refId
                    }
                    return null;
                }

                default:{
                    return null;
                }
            }
        })), (i)=> !_.isNull(i))

        console.log("inTheCarts :", balance, inTheCarts)

        return {balance, transitions, inTheCarts}
    } catch(err) {
        console.log(" err o checkBalance :", err.message)
        return {balance: 0, transitions: [], inTheCarts: []}
    }
}

export const checkBalanceBook = async(userId) =>{
    try{
        let suppliers = await Supplier.find({buys: { $elemMatch : {userId}}})
        let prices  =   _.filter( await Promise.all(_.map(suppliers, async(supplier)=>{
                            let { price, buys } = supplier;
                            let filters = _.filter(buys, (buy)=> _.isEqual(buy.userId, userId) && buy.selected == 0 )
                            return price * filters.length
                        })), (p)=>p!=0)

        return _.reduce(prices, (ps, i) => ps + i, 0);
    } catch(err) {
        console.log("error :", err)
        return 0;
    }
}

export const checkRole = (user) =>{
    if(user?.roles){
        if(_.includes( user?.roles, AMDINISTRATOR)){
            return AMDINISTRATOR;
        }
        else if(_.includes( user?.roles, AUTHENTICATED)){
            return AUTHENTICATED;
        }
    }
    return ANONYMOUS;
}

export const getUser = async(query) =>{
    return await User.findOne(query, { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, lastAccess: 1 } )
}

export const getUsers = () =>{

}
