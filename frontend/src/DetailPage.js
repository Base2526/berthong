import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import { getHeaders } from "./util"
import { gqlSupplierById, gqlBook, gqlBuys } from "./gqlQuery"

const DetailPage = (props) => {
  let history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();

  let [datas, setDatas] = useState([])

  console.log("location :", location.state )

  let { id } = location.state

  useEffect(()=>{
    let newDatas = []
    for (let i = 0; i < 100; i++) {
      newDatas = [...newDatas, {id: i, title:  i > 9 ? "" + i: "0" + i, selected: false}]
    }

    console.log("newDatas : ", newDatas)
    setDatas(newDatas)
  }, [])

  const [onBook, resultBookValues] = useMutation(gqlBook,{
    context: { headers: getHeaders() },
    update: (cache, {data: {book}}) => {
      
      console.log("onBook :", book)
      // let { postId } = createAndUpdateBookmark
      // const data1 = cache.readQuery({
      //     query: gqlIsBookmark,
      //     variables: { postId }
      // });

      // let newData = {...data1.isBookmark}
      // newData = {...newData, data: createAndUpdateBookmark}

      // cache.writeQuery({
      //     query: gqlIsBookmark,
      //     data: {
      //       isBookmark: newData
      //     },
      //     variables: { postId }
      // });     
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
  }

  const onSelected = (evt, key) =>{
    let find = _.find(datas, (itm)=>itm.id==key);

    console.log("evt find :", evt, key, find)

    let selected = !find.selected

    setDatas(_.map(datas, (itm, k)=>{
                      if(key == k)
                        return {...itm, selected }
                      return itm
                    }))

    if(selected){
      toast(<p style={{ fontSize: 16 }}>จองเบอร์ { key > 9 ? "" + key: "0" + key }</p>, {
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
      toast(<p style={{ fontSize: 16 }}>ยกเลิกการจองเบอร์ { key > 9 ? "" + key: "0" + key }</p>, {
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

    onBook({ variables: { input: { id: key, status: selected } } });
  }

  const selected = () =>{
    return _.filter(datas, (im)=>im.selected).map((curr)=> `${curr.title}`).toString();
  }

  return (<div style={{flex:1}}>
            <ToastContainer />
            <div>ID : {id} => {selected()}</div>
            <div class="container">  
            {
              _.map(datas, (val, key)=>{
                return  <div className={`itm  ${val.selected ? "itm-green" : ""}`} key={key}> 
                          <button onClick={(evt)=>onSelected(evt, key)} >{val.title}</button>
                        </div>  
              })
            }
            </div>
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return {}
};

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(DetailPage);