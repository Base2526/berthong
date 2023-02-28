import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { getHeaders } from "./util"
import { mutationSupplier, queryDateLotterys } from "./gqlQuery"

const { faker } = require("@faker-js/faker");

const AutoGenerationContent = (props) => {
    let location = useLocation();

    let dateLotterysValue = useQuery(queryDateLotterys, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true });

    console.log("dateLotterysValue :", dateLotterysValue)

    const [onSupplier, resultSupplier] = useMutation(mutationSupplier, {
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

        /*
            url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
        */
    }

    const makeNumber = (length)=> {
        var result           = '';
        var characters       = '0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const randomNumberInRange = (min, max) => {
        // 👇️ get number between min (inclusive) and max (inclusive)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return(<div className="div-management">
                <div>Auto-Generation</div>
                <div>
                    <button onClick={()=>{
                        let { data } = dateLotterysValue.data.dateLotterys
                        for ( var i = 0; i < 20; i++ ) {
                            let newInput =  {
                                mode: "NEW",
                                title: faker.lorem.lines(1),
                                price: parseInt(makeNumber(3)),
                                priceUnit: parseInt(makeNumber(2)),
                                description: faker.lorem.paragraph(),
                                dateLottery: data[0]?._id,
                                files: makeFile(5),
                                condition: parseInt(randomNumberInRange(11, 100)),    // 11-100
                                category: parseInt(randomNumberInRange(0, 3)),        // money, gold, things, etc
                                type: parseInt(randomNumberInRange(0, 1)),            // bon, lang
                                auto: true
                            }

                            // console.log("dateLottery : ", newInput, data)
                            onSupplier({ variables: { input: newInput } });
                        }
                    }}>สร้าง สินค้า</button>
                </div>
            </div>)
}

export default AutoGenerationContent;