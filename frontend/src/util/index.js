import _ from "lodash"
import { toast } from 'react-toastify';
import UniversalCookie from 'universal-cookie';

import i18n from '../translations/i18n';
 
import * as Constants from "../constants"

const cookies = new UniversalCookie();

export const setCookie = (name, value, options = { path: '/', maxAge: 2147483647 }) => {
  cookies.set(name, value, options);
};

export const getCookie = (name) => {
  return cookies.get(name);
};

export const removeCookie = (name, options = { path: '/', maxAge: 2147483647 }) => {
  cookies.remove(name, options);
};

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of data provider decoration.
 */
export const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        console.log("convertFileToBase64 :", file)
        reader.onload = () => resolve({
            fileName:_.isEmpty(file.fileName) ? (_.isEmpty(file.title) ? file.name: "") : file.fileName,
            base64: reader.result,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });
        reader.onerror = reject;
    }
);

export const convertDate = (date) =>{
    const monthNamesThai = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.", "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    const monthNameEnglish = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    if(i18n.language.toLowerCase() === 'th'){

        date = date.split(" ")
        let x = date[1];
        let vx = _.findIndex(monthNameEnglish, (month) => {
          return x.toLowerCase() === month.toLowerCase();
        });
      
        date[1] = monthNamesThai[vx];

        let year = ( parseInt(date[2]) + 543 ).toString();
        date[2] = year.substring(year.length-2, year.length);  

        return date.join(" ")
    }

    date = date.split(" ")
    let year = date[2].toString();
    date[2] = year.substring(year.length-2, year.length);  

    return date.join(" ");
}

export const numberCurrency = (number) =>{
    let THBBaht = new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2
    });

    return THBBaht.format(number)
}

/*
        let year = ( parseInt(date[2]) + 543 ).toString();

*/
export const minTwoDigits =(n, digit)=> {
  switch(digit){
    case 4:{
      if(n < 10){
        return "00" + n;
      }else if(n < 100){
        return "0" + n;
      }
      return n;
    }
    default:{
      return (n < 10 ? '0' : '') + n;
    }
  }
}

export const currencyFormat = (num) => {
    return "$" + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const getCurrentLanguage = () => i18n.language || localStorage.getItem("i18n")

export const getHeaders = (params) =>{
  return  {
              "apollo-require-preflight": true,
              "content-Type": "application/json",
              "authorization": /*localStorage.getItem('token')*/ !_.isUndefined(getCookie('token'))  ? `Bearer ${ /*localStorage.getItem('token')*/ getCookie('token')}` : '',
              "custom-location":  JSON.stringify(params),
              "custom-authorization":  !_.isUndefined(getCookie('token'))  ? `Bearer ${getCookie('token')}` : '',
              "custom-x": "--1-- " + getCookie('token')
          }
}

export const makeid = (length) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *  charactersLength));
 }
 return result;
}

export const truncate = (str, n) => {

  const regex = /(<([^>]+)>)/ig;
  str = str.replace(regex, '');

  return (str.length > n) ? str.substr(0, n-1) + '...' : str;
};

export const getCurrentDate =(separator='')=>{
    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    
    return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
}

/*
export const ANONYMOUS        = 0;
export const AMDINISTRATOR    = 1;
export const AUTHENTICATED    = 2;
export const SELLER           = 3;
*/

export const checkRole = (user) =>{
  if(user?.roles){
    let { REACT_APP_USER_ROLES } = process.env
    console.log("checkRole :", user?.roles)
    if( _.includes( user?.roles, _.split(REACT_APP_USER_ROLES, ',' )[0]) ){
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

  // if(user?.roles){
  //   if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a2") || _.includes( user?.roles, "administrator")){
  //       return Constants.AMDINISTRATOR;
  //   }
  //   // else if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a6")){
  //   return Constants.AUTHENTICATED;
  //   // }
  // }
  // return Constants.ANONYMOUS;
}

export const bookView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected === 0 );
    return fn.length;
}

export const sellView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected === 1 );
    return fn.length;
}

export const showToast = (type, text, autoClose=1000) =>{
    toast(
        <p style={{ fontSize: 16 }}>{text}</p>, 
        {
        //   position: "top-right",
          position:"bottom-right",
          autoClose,
          hideProgressBar: true,
          newestOnTop: true,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: false,
          type /* "success", error*/ ,
        //   toastId: 'my-toast-id'
        }); 
}

export const handlerErrorApollo = (props, error) =>{
    _.map(error?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case Constants.FORCE_LOGOUT:{
            let { logout } = props

            showToast("error", i18n.t(e?.extensions?.code))
            logout()
            break;
          }

          case Constants.DATA_NOT_FOUND:
          case Constants.UNAUTHENTICATED:
          case Constants.ERROR:{
            showToast("error", e?.message)
            break;
          }

          case Constants.USER_NOT_FOUND:{
            showToast("error", i18n.t(e?.extensions?.code))
            break;
          }

          case Constants.PASSWORD_WRONG:{
            showToast("error", i18n.t(e?.extensions?.code))
            break;
          }

          case Constants.INTERNAL_SERVER_ERROR: {
            showToast("error", e?.message)
            break;
          }

          case Constants.NOT_ENOUGH_BALANCE:{
            console.log("e?.extensions?.code :", e?.extensions?.code)
            showToast("error", i18n.t(e?.extensions?.code))
            break;
          }

          case Constants.EXPIRE_DATE:{
            console.log("e?.extensions?.code :", e?.extensions?.code)
            showToast("error", i18n.t(e?.extensions?.code))
            break;
          }

          default:{
            console.log("handlerErrorApollo :", e)
          }
        }
    })
}