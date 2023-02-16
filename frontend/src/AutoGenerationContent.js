import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import LinearProgress from '@mui/material/LinearProgress';
import queryString from 'query-string';
const { faker } = require("@faker-js/faker");

import { getHeaders, checkRole } from "./util"
import { gqlSupplier } from "./gqlQuery"
import { login, logout } from "./redux/actions/auth"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"

const AutoGenerationContent = (props) => {

    const [onSupplier, resultSupplier] = useMutation(gqlSupplier, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {supplier}}) => {
    
        //   let { data, mode, status } = supplier
    
        //   if(status){
        //     switch(mode){
        //       case "new":{
        //         const querySuppliersValue = cache.readQuery({ query: querySuppliers });
        //         let newData = [...querySuppliersValue.suppliers.data, supplier.data];
    
        //         cache.writeQuery({
        //           query: querySuppliers,
        //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
        //         });
        //         break;
        //       }
    
        //       case "edit":{
        //         const querySuppliersValue = cache.readQuery({ query: querySuppliers });
        //         let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == supplier.data._id ? supplier.data : item ) 
    
        //         cache.writeQuery({
        //           query: querySuppliers,
        //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
        //         });
                
        //         break;
        //       }
        //     }
        //   }
        },
        onCompleted({ data }) {
        //   history.goBack()
        },
        onError({error}){
          console.log("onError :")
        }
    });
    console.log("resultSupplier :", resultSupplier)

    const makeFile = (length) =>{
        let files = []
        for ( var i = 0; i < length; i++ ) {
            files.push({
                          url: faker.image.avatar(),
                          filename: faker.name.firstName(),
                          encoding: '7bit',
                          mimetype: 'image/png'
                        })
        }
        return files
    }

    return(<div className="div-management">
                <div>Auto-Generation</div>
                <div>
                    <button onClick={()=>{
                        let newInput =  {
                            mode: "NEW",
                            title: faker.lorem.lines(1),
                            price: parseInt(makeNumber(3)),
                            priceUnit: parseInt(makeNumber(2)),
                            description: faker.lorem.paragraph(),
                            dateLottery: input.dateLottery,
                            files: makeFile(5)
                        }

                        // console.log("submitForm :", newInput)
                        // onSupplier({ variables: { input: newInput } });

                    }}>สร้าง สินค้า</button>
                </div>
            </div>)
}

export default AutoGenerationContent;