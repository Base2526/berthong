import "./detail.css";
import "./seat.css";
import "./wallet.css";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';
import { useMutation, useQuery } from "@apollo/client";
import _ from "lodash"
import {LinearProgress} from "@mui/material"

import DetailPanelRight from "./DetailPanelRight"
import DetailPanelLeft from "./DetailPanelLeft"
import PopupCart from "./PopupCart";
import PopupWallet from "./PopupWallet";
import { getHeaders, showToast } from "../../util";
import * as Constants from "../../constants"

import {  mutationBook, 
          mutationBuy, 
          querySupplierById, 
          querySuppliers, 
          subscriptionSupplierById, 
          queryUserById } from "../../gqlQuery";

let unsubscribeSupplierById = null;
const Detail = (props) => {
  const location = useLocation();
  // const [selectedSeats, setSelectedSeats] = useState([]);
  const [data, setData] = useState([]);
  const [dataUser, setDataUser] = useState([]);
   
  const [isPopupOpenedWallet, setPopupOpenedWallet] = useState(false);
  const [isPopupOpenedShoppingBag, setPopupOpenedShoppingBag] = useState(false);

  let params = queryString.parse(location.search)

  let { id } = params; 

  let { user, onLogin } = props

  const { loading: loadingSupplierById, 
          data: dataSupplierById, 
          error: errorSupplierById, 
          refetch: refetchSupplierById,
          subscribeToMore: subscribeToMoreSupplierById, 
          networkStatus } = useQuery( querySupplierById, { 
                                      context: { headers: getHeaders(location) }, 
                                      // variables: { id }, 
                                      fetchPolicy: 'cache-first', 
                                      nextFetchPolicy: 'network-only', 
                                      notifyOnNetworkStatusChange: true});

  const { loading: loadingUserById, 
          data: dataUserById, 
          refetch: refetchUserById,
          error: errorUserById} = useQuery(queryUserById, { 
                                                        context: { headers: getHeaders(location) },
                                                        fetchPolicy: 'cache-first', 
                                                        nextFetchPolicy: 'network-only', 
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

  const [onBook, resultBookValues] = useMutation(mutationBook,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {book}}) => {
      let { status, action, data } = book

      let {mode, itemId} = action
      switch(mode?.toUpperCase()){
        case "BOOK":{
          showToast("success", `จองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
          break
        }

        case "UNBOOK":{
          showToast("error", `ยกเลิกการจองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
          break
        }
      }
      
      let supplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      if(status && supplierByIdValue){
        cache.writeQuery({ 
          query: querySupplierById, 
          variables: { id: data._id },
          data: { supplierById: { ...supplierByIdValue.supplierById, data } }, 
        }); 
      }

      ////////// update cache querySuppliers ///////////
      let suppliersValue = cache.readQuery({ query: querySuppliers });
      if(!_.isNull(suppliersValue)){
        let { suppliers } = suppliersValue
        let newData = _.map(suppliers.data, (supplier) => supplier._id == data._id ? data : supplier)
        cache.writeQuery({
          query: querySuppliers,
          data: { suppliers: { ...suppliersValue.suppliers, data: newData } }
        });
      }
      ////////// update cache querySuppliers ///////////
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (error) => {
      _.map(error?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case Constants.FORCE_LOGOUT:{
            // logout()
            break;
          }
          case Constants.DATA_NOT_FOUND:
          case Constants.UNAUTHENTICATED:
          case Constants.ERROR:{
            showToast("error", e?.message)
            break;
          }
        }
      })
    }
  });

  const [onBuy, resultBuyValues] = useMutation(mutationBuy,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {buy}}) => {
      let { status, data } = buy
         
      ////////// update cache queryUserById ///////////
      let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      if(querySupplierByIdValue){
        cache.writeQuery({
          query: querySupplierById,
          data: { supplierById: {...querySupplierByIdValue.supplierById, data} },
          variables: {id: data._id}
        });
      }
      ////////// update cache queryUserById ///////////    

      ////////// update cache querySuppliers ///////////
      let suppliersValue = cache.readQuery({ query: querySuppliers });
      if(!_.isNull(suppliersValue)){
        console.log("suppliersValue :", suppliersValue)
      }
      ////////// update cache querySuppliers ///////////
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

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
    if(!_.isEmpty(data) && _.isEmpty(dataUser)){
      refetchUserById({id: data?.ownerId});
    }
  }, [data])

  useEffect(()=>{
    if(_.isEmpty(data)) refetchSupplierById({id}) 

    unsubscribeSupplierById && unsubscribeSupplierById()
    unsubscribeSupplierById = null;

    unsubscribeSupplierById =  subscribeToMoreSupplierById({
      document: subscriptionSupplierById,
      variables: { id },
      updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) return prev;

        let { mutation, data } = subscriptionData.data.subscriptionSupplierById;
        switch(mutation){
          case "BOOK":
          case "UNBOOK":{
            let newPrev = {...prev.supplierById, data}

            return {supplierById: newPrev}; 
          }

          case "AUTO_CLEAR_BOOK":{
            let newPrev = {...prev.supplierById, data}
            return {supplierById: newPrev}; 
          }

          default:
            return prev;
        }
      }
    });
  }, [id])

  const onSelected = (evt, itemId) =>{
    if(_.isEmpty(user)){
      onLogin(true);
      return;
    } 

    let fn = _.find(data.buys, (buy)=>buy.itemId == itemId)
    let selected = 0;
    if(fn) selected = fn.selected == -1 ? 0 : -1
    
    if(selected == 0){
      let check = user?.balance - (user?.balanceBook + data.price)
      if(check < 0){
        showToast("error", `ยอดเงินคงเหลือไม่สามารถจองได้`)
        return;
      }
    }
    onBook({ variables: { input: { supplierId: id, itemId, selected } } });
  }

  return (
    <div className="row">
      { isPopupOpenedShoppingBag && <PopupCart opened={isPopupOpenedShoppingBag} data={data} onClose={() => setPopupOpenedShoppingBag(false) } /> }
      { isPopupOpenedWallet  && <PopupWallet opened={isPopupOpenedWallet} onClose={() => setPopupOpenedWallet(false) } /> }

      {
        loadingSupplierById || _.isEmpty(data)
        ? <LinearProgress />
        : <>
            <DetailPanelLeft data={data}/>
            <DetailPanelRight 
              {...props}
              data={data}
              owner={dataUser}
              onSelected={(evt, itemId)=>onSelected(evt, itemId)}

              onPopupOpenedWallet={(status)=> _.isEmpty(user) ? onLogin(true) : setPopupOpenedWallet(status) }
              onPopupOpenedShoppingBag={(status)=> _.isEmpty(user) ? onLogin(true) : setPopupOpenedShoppingBag(status)}/>
          </>
      }
    </div>
  )
}

export default Detail;