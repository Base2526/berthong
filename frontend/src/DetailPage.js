import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import _ from "lodash"

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
      newDatas = [...newDatas, {title:  i > 9 ? "" + i: "0" + i, selected: false}]
    }
    setDatas(newDatas)
  }, [])

  const onSelected = (evt, key) =>{
    console.log("evt :", evt, key)

    setDatas(_.map(datas, (itm, k)=>{
                      if(key == k)
                        return {...itm, selected: !itm.selected}
                      return itm
                    }))

                    toast(<p style={{ fontSize: 16 }}>{key}</p>, {
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
  }

  return (<div style={{flex:1}}>
            <ToastContainer />
            <div>ID : {id}</div>
            <div class="container">  
            {
              _.map(datas, (val, key)=>{
                return  <div className={`itm  ${val.selected ? "itm-red" : ""}`} key={key}> 
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