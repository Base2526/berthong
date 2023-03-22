import _ from "lodash"
import { toast } from 'react-toastify';
import i18n from './translations/i18n';
import { AMDINISTRATOR, AUTHENTICATED, ANONYMOUS } from "./constants"
 
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
});

export const convertDate = (date) =>{
    const monthNamesThai = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.", "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    const monthNameEnglish = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    if(i18n.language.toLowerCase() == 'th'){

        date = date.split(" ")
        let x = date[1];
        let vx = _.findIndex(monthNameEnglish, (month) => {
          return x.toLowerCase() == month.toLowerCase();
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

export const currencyFormat = (num) => {
    return "$" + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const getCurrentLanguage = () => i18n.language || localStorage.getItem("i18n")

export const getHeaders = (params) =>{
    return  {
                "apollo-require-preflight": true,
                "content-Type": "application/json",
                authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
                "custom-location":  JSON.stringify(params)
            }
}

export const getCurrentDate =(separator='')=>{
    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    
    return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
}

export const checkRole = (user) =>{
    if(user?.roles){
        if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a2") || _.includes( user?.roles, "administrator")){
            return AMDINISTRATOR;
        }
        // else if(_.includes( user?.roles, "62a2ccfbcf7946010d3c74a6")){
        return AUTHENTICATED;
        // }
    }
    return ANONYMOUS;
}

export const bookView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 0 );
    return fn.length;
}

export const sellView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 1 );
    return fn.length;
}

export const showToast = (type, text) =>{
    toast(
        <p style={{ fontSize: 16 }}>{text}</p>, 
        {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          newestOnTop: false,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: false,
          type /* "success", error*/ 
        }); 
}