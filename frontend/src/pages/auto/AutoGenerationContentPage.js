import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { getHeaders, handlerErrorApollo } from "../../util"
import { mutationLottery, queryManageLotterys, mutationRegister, queryUsers } from "../../apollo/gqlQuery"

const { faker } = require("@faker-js/faker");

const AutoGenerationContentPage = (props) => {
    const location              = useLocation();
    const [users, setUsers]     = useState([]); 
    const [manageLotterys, setManageLotterys] = useState([]); 
 
    const { loading: loadingUsers, 
            data: dataUsers, 
            error: errorUsers,
            networkStatus } = useQuery(queryUsers, 
                                        { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {input: { OFF_SET: 0, LIMIT: 1000 }},
                                        fetchPolicy: 'cache-first', 
                                        nextFetchPolicy: 'network-only',
                                        notifyOnNetworkStatusChange: true
                                        }
                                    );

    if(!_.isEmpty(errorUsers)) handlerErrorApollo( props, errorUsers )

    const { loading: loadingManageLotterys, 
            data: dataManageLotterys, 
            error: errorManageLotterys,
            networkStatus: networkStatusManageLotterys } = useQuery( queryManageLotterys, { 
                                                                    context: { headers: getHeaders(location) }, 
                                                                    fetchPolicy: 'cache-first', 
                                                                    nextFetchPolicy: 'network-only', 
                                                                    notifyOnNetworkStatusChange: true }
                                                                    );

    const [onMutationLottery, resultLottery] = useMutation(mutationLottery, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {lottery}}) => { },
        onCompleted(data) {
            console.log("onCompleted :", data)
        },
        onError(error){
            console.log("onError :", error)
        }
    });

    const [onRegister, resultRegister] = useMutation(mutationRegister, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {register}}) => { },
        onCompleted( data ) {
        //   history.goBack()
        },
        onError(error){
          console.log("onRegister onError :", error)
        }
    });

    useEffect(() => {
        if(!loadingUsers){
          if(!_.isEmpty(dataUsers?.users)){
            let { status, data } = dataUsers?.users
            if(status)setUsers(data)
          }
        }
    }, [dataUsers, loadingUsers ])

    useEffect(() => {
        if(!loadingManageLotterys){
          if(!_.isEmpty(dataManageLotterys?.manageLotterys)){
            let { status, data } = dataManageLotterys?.manageLotterys
            if(status)setManageLotterys(data)
          }
        }
    }, [dataManageLotterys, loadingManageLotterys])

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
                        for ( var i = 0; i <200; i++ ) {
                            let newInput =  {
                                mode: "NEW",
                                title: faker.lorem.lines(1),
                                price: parseInt(makeNumber(3)),
                                priceUnit: parseInt(makeNumber(2)),
                                description: faker.lorem.paragraph(),
                                manageLottery: manageLotterys[randomNumberInRange(0, manageLotterys.length - 1)]?._id,
                                files: makeFile(5),
                                condition: parseInt(randomNumberInRange(11, 100)),    // 11-100
                                category: parseInt(randomNumberInRange(0, 3)),        // money, gold, things, etc
                                type: parseInt(randomNumberInRange(0, 1)),            // bon, lang
                                ownerId: users[randomNumberInRange(0, users.length - 1)]?._id,
                                test: true,
                            }
                            onMutationLottery({ variables: { input: newInput } });
                        }
                    }}>Auto สร้าง สินค้า</button>
                </div>

                <div>
                    <button onClick={()=>{
                        for ( var i = 0; i < 5; i++ ) {
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

                            // console.log("newInput :", newInput)
                            onRegister({ variables: { input: newInput } });
                        }
                    }}>Auto สร้าง USER</button>
                </div>
            </div>)
}

export default AutoGenerationContentPage;