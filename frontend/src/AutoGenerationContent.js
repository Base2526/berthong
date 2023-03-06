import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { getHeaders } from "./util"
import { mutationSupplier, queryDateLotterys, mutationRegister, queryUsers } from "./gqlQuery"

const { faker } = require("@faker-js/faker");

const AutoGenerationContent = (props) => {
    const location              = useLocation();
    const [users, setUsers]     = useState([]); 
    const [dateLotterys, setDateLotterys] = useState([]); 
 
    const { loading: loadingUsers, 
            data: dataUsers, 
            error: errorUsers,
            networkStatus } = useQuery(queryUsers, 
                                        { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                        }
                                    );

    const { loading: loadingDateLotterys, 
            data: dataDateLotterys, 
            error: errorDateLotterys,
            networkStatus: networkStatusDateLotterys } = useQuery(queryDateLotterys, { 
                                                                        context: { headers: getHeaders(location) }, 
                                                                        notifyOnNetworkStatusChange: true }
                                                                    );

    const [onSupplier, resultSupplier] = useMutation(mutationSupplier, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {supplier}}) => { },
        onCompleted({ data }) {
        //   history.goBack()
        },
        onError({error}){
          console.log("onError :")
        }
    });

    // 
    const [onRegister, resultRegister] = useMutation(mutationRegister, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {register}}) => { },
        onCompleted({ data }) {
        //   history.goBack()
        },
        onError(error){
          console.log("onRegister onError :", error)
        }
    });

    useEffect(() => {
        if(!loadingDateLotterys){
          if(!_.isEmpty(dataUsers?.users)){
            let { status, data } = dataUsers?.users
            if(status)setUsers(data)
          }
        }
    }, [dataUsers, loadingDateLotterys])

    useEffect(() => {
        if(!loadingUsers){
          if(!_.isEmpty(dataDateLotterys?.dateLotterys)){
            let { status, data } = dataDateLotterys?.dateLotterys
            if(status)setDateLotterys(data)
          }
        }
    }, [dataDateLotterys, loadingUsers])

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
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return(<div className="div-management">
                <div>Auto-Generation</div>
                <div>
                    <button onClick={()=>{
                        // let { data } = dateLotterysValue.data.dateLotterys
                        for ( var i = 0; i < 95; i++ ) {
                            let newInput =  {
                                mode: "NEW",
                                title: faker.lorem.lines(1),
                                price: parseInt(makeNumber(3)),
                                priceUnit: parseInt(makeNumber(2)),
                                description: faker.lorem.paragraph(),
                                dateLottery: dateLotterys[randomNumberInRange(0, dateLotterys.length - 1)]?._id,
                                files: makeFile(5),
                                condition: parseInt(randomNumberInRange(11, 100)),    // 11-100
                                category: parseInt(randomNumberInRange(0, 3)),        // money, gold, things, etc
                                type: parseInt(randomNumberInRange(0, 1)),            // bon, lang
                                ownerId: users[randomNumberInRange(0, users.length - 1)]?._id,
                                test: true,
                            }
                            // console.log("newInput : ", newInput)
                            onSupplier({ variables: { input: newInput } });
                        }

                        // console.log("users :", users[randomNumberInRange(0, users.length - 1)]?._id, users.length)
                    }}>Auto สร้าง สินค้า</button>
                </div>

                <div>
                    <button onClick={()=>{
                        for ( var i = 0; i < 100; i++ ) {
                            let newInput =  {
                                username: faker.name.firstName(),
                                password: faker.name.firstName(),
                                email: faker.internet.email(),
                                displayName: faker.name.firstName(),
                                avatar: {
                                    url: faker.image.avatar(),
                                    filename: faker.name.firstName(),
                                    encoding: '7bit',
                                    mimetype: 'image/png'
                                }
                            }

                            console.log("newInput :", newInput)
                            onRegister({ variables: { input: newInput } });
                        }
                    }}>Auto สร้าง USER</button>
                </div>
            </div>)
}

export default AutoGenerationContent;