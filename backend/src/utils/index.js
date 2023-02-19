import jwt from 'jsonwebtoken';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);

import { User, Session, Transition, Supplier, Deposit, Withdraw } from '../model'

import { AMDINISTRATOR, AUTHENTICATED, ANONYMOUS } from "../constants"

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
    let newInput = {...input, userId, token: jwt.sign(userId, process.env.JWT_SECRET)}
  
    let session = await Session.findOne({userId, deviceAgent: newInput.deviceAgent})
    if(_.isEmpty(session)){
      session = await Session.create(newInput);
    }
  
    return session._id.toString()
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

                // console.log("session expired :", session.expired, expiredDays, req)
    
                // code
                // -1 : force logout
                //  0 : anonymums
                //  1 : OK
                if(expiredDays >= 0){
                    let userId  = jwt.verify(session.token, process.env.JWT_SECRET);
    
    
                    console.log("checkAuthorization : ", session.token, userId )
                    // return {...req, currentUser: await User.findById(userId)} 
    
                    return {
                        status: true,
                        code: 1,
                        pathname,
                        current_user: await User.findById(userId),
                    }
                }
    
                // force logout
                return {
                    status: false,
                    code: -1,
                    message: "session expired days"
                }
            }
        }
    }

    // without user
    return {
        status: false,
        code: 0,
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
                code: 1,
                current_user: await User.findById(userId),
            }
        }

        // force logout
        return {
            status: false,
            code: -1,
            message: "session expired days"
        }
    }
}

export const checkBalance = async(userId) =>{
    let transitions = await Transition.find({userId, status:"success" });
    try{
        transitions = await Promise.all(_.map(transitions, async(transition)=>{
            switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                case "supplier":{
                    let supplier = await Supplier.findById(transition.refId)
                    let buys = _.filter(supplier.buys, (buy)=>buy.userId == userId.toString())
                    
                    let balance = buys.length * supplier.price
                    return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                }

                case "deposit":{
                    let deposit = await Deposit.findById(transition.refId)
                    return {...transition._doc, title: "title", balance: deposit.balance, description: "description", dateLottery: "dateLottery"}
                }

                case "withdraw":{
                    let withdraw = await Withdraw.findById(transition.refId)
                    return {...transition._doc, title: "title", balance: withdraw.balance, description: "description", dateLottery: "dateLottery"}
                }
            }
        }))

        let balance = 0;
        _.map(transitions, (transition) => {
            switch (transition.type) {
                case "supplier": {
                    balance += -Math.abs(transition.balance);
                break;
                }
                case "withdraw": {
                    balance += -Math.abs(transition.balance);
                break;
                }

                case "deposit": {
                    balance += Math.abs(transition.balance);
                break;
                }

                default: {
                break;
                }
            }
        });
        return {balance, transitions}
    } catch(err) {
        return {balance: 0, transitions: []}
    }
}

export const checkBalanceBook = async(userId) =>{
    try{
        let suppliers = await Supplier.find({});
        let prices  = _.filter( await Promise.all(_.map(suppliers, async(supplier)=>{
                        let { price, buys } = supplier;
                        let filters = _.filter(buys, (buy)=>buy.userId == userId.toString() && buy.selected == 0)
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
        if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a2")){
            return AMDINISTRATOR;
        }
        // else if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a6")){
        return AUTHENTICATED;
        // }
    }
    return ANONYMOUS;
}