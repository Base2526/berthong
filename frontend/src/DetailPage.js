import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import { login } from "./redux/actions/auth"
import { getHeaders } from "./util"
import { gqlSupplierById, gqlBook, gqlBuys, subscriptionSupplierById } from "./gqlQuery"
import DialogLogin from "./DialogLogin"

let unsubscribeSupplierById = null;

const DetailPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let [datas, setDatas] = useState([])
  let [dialogLoginOpen, setDialogLoginOpen] = useState(false);

  console.log("location :", location.state )

  let { id } = location.state
  let { user } = props
  console.log("user :", user)

  useEffect(()=>{
    let newDatas = []
    for (let i = 0; i < 100; i++) {
      newDatas = [...newDatas, {id: i, title:  i > 9 ? "" + i: "0" + i, selected: -1}]
    }

    console.log("newDatas : ", newDatas)
    setDatas(newDatas)


    return () => {
      unsubscribeSupplierById && unsubscribeSupplierById()
    };
  }, [])

  const [onBook, resultBookValues] = useMutation(gqlBook,{
    context: { headers: getHeaders() },
    update: (cache, {data: {book}}) => {
      
      console.log("onBook :", book)

      let { status, data } = book
      if(status){
        cache.writeQuery({
          query: gqlSupplierById,
          data: {
            getSupplierById: {
              data
            } 
          },
          variables: { id: data._id }
        }); 
      }    
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

  let getSupplierByIdValues = useQuery(gqlSupplierById, {
    context: { headers: getHeaders() },
    variables: { id },
    notifyOnNetworkStatusChange: true,
  });

  console.log("getSupplierByIdValues :", getSupplierByIdValues)

  if(getSupplierByIdValues.loading){
    return <div><CircularProgress /></div>
  }else{
    if(_.isEmpty(getSupplierByIdValues.data.getSupplierById)){
      return;
    }

    let {subscribeToMore, networkStatus} = getSupplierByIdValues

    unsubscribeSupplierById && unsubscribeSupplierById()
    unsubscribeSupplierById =  subscribeToMore({
			document: subscriptionSupplierById,
      variables: { supplierById: id },
			updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) return prev;

        let { mutation, data } = subscriptionData.data.subscriptionSupplierById;
        switch(mutation){
          case "BOOK":
          case "UNBOOK":{
            let newPrev = {...prev.getSupplierById, data}

            return {getSupplierById: newPrev}; 
          }

          default:
            return prev;
        }
			}
		});
  }

  let {status, data} = getSupplierByIdValues.data.getSupplierById

  const onSelected = (evt, itemId) =>{
    // let find = _.find(datas, (itm)=>itm.id==itemId);

    let fn = _.find(data.buys, (buy)=>buy.itemId == itemId)

    // console.log("evt find :", evt, itemId, find)

    let selected = 0;
    if(fn){
      selected = fn.selected == -1 ? 0 : -1
    }

    setDatas(_.map(datas, (itm, k)=>{
                      if(itemId == k)
                        return {...itm, selected }
                      return itm
                    }))

    if(selected ==0){
      toast(<p style={{ fontSize: 16 }}>จองเบอร์ { itemId > 9 ? "" + itemId: "0" + itemId }</p>, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        type: "success"
      }); 
    }else{
      toast(<p style={{ fontSize: 16 }}>ยกเลิกการจองเบอร์ { itemId > 9 ? "" + itemId: "0" + itemId }</p>, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        type: "error"
      }); 
    }

    onBook({ variables: { input: { supplierId: id, itemId, selected } } });
  }

  const selected = () =>{
    // let filter = _.filter(datas, (im)=>im.selected).map((curr)=> `${curr.title}`).toString()

    let fn = _.filter(data.buys, (buy)=>buy.userId == user._id && buy.selected == 0 ).map((curr)=> `${curr.itemId}`).toString()

    console.log("filter :", fn)

    if(_.isEmpty(fn)){
      return <div></div>
    }
    return  <div className="div-buy">
              <div>รายการเลือก : {fn}</div>
              <button onClick={()=>{
                console.log("BUY")
              }}>BUY ({_.filter(data.buys, (buy)=>buy.userId == user._id && buy.selected == 0 ).length})</button>
            </div>;
  }

  return (<div style={{flex:1}}>
            <ToastContainer />
            <div>ID : {id} => {selected()}</div>
            <div class="container">  
            {
              _.map(datas, (val, key)=>{
             
                let fn = _.find(data.buys, (buy)=>buy.itemId == key)

                let cn = ""
                if(!_.isEmpty(fn)){
                  cn = fn.selected == 0 ? "itm-green" : fn.selected == 1 ? "itm-gold" : ""
                }
                
                return  <div className={`itm  ${cn}`} key={key}> 
                          <button onClick={(evt)=>{
                            if(_.isEmpty(user)){
                              setDialogLoginOpen(true)
                            }else{
                              onSelected(evt, key)
                            }
                          }}>{val.title}</button>
                        </div>  
              })
            }
            </div>

          
            {dialogLoginOpen && (
              <DialogLogin
                {...props}
                open={dialogLoginOpen}
                onComplete={async(data)=>{
                  setDialogLoginOpen(false);
                  // props.login(data)
                  
                  // await client.cache.reset();
                  // await client.resetStore();
                }}
                onClose={() => {
                  setDialogLoginOpen(false);

                  // history.push("/")
                }}
              />
            )}

          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
};

const mapDispatchToProps = { login }

export default connect( mapStateToProps, mapDispatchToProps )(DetailPage);