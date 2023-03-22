import "./detail.css";
import "./seat.css";
import "./wallet.css";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";
import _ from "lodash"
import {LinearProgress} from "@mui/material"

import DetailPanelRight from "./DetailPanelRight"
import DetailPanelLeft from "./DetailPanelLeft"
import PopupCart from "./PopupCart";
import PopupWallet from "./PopupWallet";
import { bookView, getHeaders, sellView, showToast } from "../../util";

import { mutationBook, mutationBuy, querySupplierById, 
        querySuppliers, subscriptionSupplierById, queryUserById } from "../../gqlQuery";

const finishBuy = [12, 14, 17]
// const data = {
//     catogory: "money",
//     id: "1",
//     title: "APPLE iPhone 12 Pro (Gold, 128 GB)",
//     rating: "4.5",
//     description:
//       "A14 Bionic rockets past every other smartphone chip. The Pro camera system takes low-light photography to the next level — with an even bigger jump on iPhone 12 Pro Max. And Ceramic Shield delivers four times better drop performance. Let’s see what this thing can do.",
//     price: "1000",
//     files: [{
//       url: "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbr37gm57f7.jpeg?q=70",
//     },
//     {
//       url: "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrnpyygbv9.jpeg?q=70",
//     }
      
      
//       // "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrpksqr8zu.jpeg?q=70",
//       // "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrgcctfysm.jpeg?q=70"
//     ]
// }

let unsubscribeSupplierById = null;
const Detail = (props) => {
  const location = useLocation();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [data, setData] = useState([]);
  const [dataUser, setDataUser] = useState([]);
   
  const [isPopupOpenedWallet, setPopupOpenedWallet] = useState(false);
  const [isPopupOpenedShoppingBag, setPopupOpenedShoppingBag] = useState(false);

  let params = queryString.parse(location.search)

  let { id } = params; 

  let { user } = props

  const { loading: loadingSupplierById, 
          data: dataSupplierById, 
          error: errorSupplierById, 
          subscribeToMore, 
          networkStatus } = useQuery( querySupplierById, { 
                                      context: { headers: getHeaders(location) }, 
                                      variables: { id }, 
                                      fetchPolicy: 'network-only', // Used for first execution
                                      nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                      notifyOnNetworkStatusChange: true});

  const { loading: loadingUserById, 
          data: dataUserById, 
          refetch: refetchUserById,
          error: errorUserById} = useQuery(queryUserById, { 
                                                        context: { headers: getHeaders(location) },
                                                        // variables: {id: userId},
                                                        fetchPolicy: 'cache-first', // Used for first execution
                                                        nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                        notifyOnNetworkStatusChange: true 
                                                    });

  if(!_.isEmpty(errorUserById)){
    _.map(errorUserById?.graphQLErrors, (e)=>{

      console.log("e :", e)
      // switch(e?.extensions?.code){
      //   case FORCE_LOGOUT:{
      //     logout()
      //     break;
      //   }
      // }
    })
  }

  useEffect(() => {
    if(!loadingUserById){
      if(!_.isEmpty(dataUserById?.userById)){
        let { status, data } = dataUserById?.userById
        if(status){
          setDataUser(data)
        }
      }
    }
  }, [dataUserById, loadingUserById])

  useEffect(() => {
    if(!loadingUserById){
      if(!_.isEmpty(dataSupplierById?.supplierById)){
        let { status, data } = dataSupplierById?.supplierById
        if(status){
          setData(data)
        }
      }
    }
  }, [dataSupplierById, loadingUserById])

  useEffect(()=>{
    if(!_.isEmpty(data)){
      refetchUserById({id: data?.ownerId});
    }
  }, [data])

  useEffect(()=>{
    // unsubscribeSupplierById && unsubscribeSupplierById()
    // unsubscribeSupplierById = null;

    // unsubscribeSupplierById =  subscribeToMore({
    //   document: subscriptionSupplierById,
    //   variables: { supplierById: id },
    //   updateQuery: (prev, {subscriptionData}) => {
    //     if (!subscriptionData.data) return prev;

    //     let { mutation, data } = subscriptionData.data.subscriptionSupplierById;
    //     switch(mutation){
    //       case "BOOK":
    //       case "UNBOOK":{
    //         let newPrev = {...prev.supplierById, data}

    //         setDatasSupplierById(data)
    //         return {supplierById: newPrev}; 
    //       }

    //       case "AUTO_CLEAR_BOOK":{
    //         let newPrev = {...prev.supplierById, data}
    //         console.log("AUTO_CLEAR_BOOK :", user, newPrev)

    //         setDatasSupplierById(data)
    //         return {supplierById: newPrev}; 
    //       }

    //       default:
    //         return prev;
    //     }
    //   }
    // });
  }, [id])

  return (
    <div className="row">
      { isPopupOpenedShoppingBag 
        && <PopupCart opened={isPopupOpenedShoppingBag} dataSelect={selectedSeats} onClose={() => setPopupOpenedShoppingBag(false)} /> }
      
      { isPopupOpenedWallet 
        && <PopupWallet opened={isPopupOpenedWallet} onClose={() => setPopupOpenedWallet(false)} /> }

      {
        loadingSupplierById || _.isEmpty(data)
        ? <LinearProgress />
        : <>
            <DetailPanelLeft data={data}/>
            <DetailPanelRight 
              {...props}
              data={data}
              owner={dataUser}

              selectedSeats={selectedSeats}
              onSelectedSeatsChange={(value)=>setSelectedSeats(value)}

              onPopupOpenedWallet={(status)=>setPopupOpenedWallet(status) }
              onPopupOpenedShoppingBag={(status)=>setPopupOpenedShoppingBag(status)}/>
          </>
      }
    </div>
  )
}

export default Detail;
