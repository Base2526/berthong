import jwt from 'jsonwebtoken';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);

import { User, Session } from '../model'
import { async } from 'regenerator-runtime';

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
    if (req.headers && req.headers.authorization) {
        var auth    = req.headers.authorization;
        var parts   = auth.split(" ");
        var bearer  = parts[0];
        var sessionId   = parts[1];

        if (bearer == "Bearer") {
            // let decode = jwt.verify(token, process.env.JWT_SECRET);
            let session = await Session.findById(sessionId)   

            console.log("session > ", session)
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