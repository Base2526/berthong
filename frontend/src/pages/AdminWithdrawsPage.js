import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useQuery } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import {
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material'
import moment from "moment";
import {
        Button,
        Dialog,
        DialogActions,
        DialogContent, 
        DialogContentText,
        DialogTitle,
        Box,
        Stack,
        Avatar,
        LinearProgress
      } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import { getHeaders, handlerErrorApollo } from "../util"
import { queryAdminWithdraws } from "../apollo/gqlQuery"
import * as Constants from "../constants"

import AdminWithdrawsItem from "../item/AdminWithdrawsItem"

deepdash(_);

const AdminWithdrawsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout, onLightbox, onMutationAdminWithdraw } = props

  const [datas, setDatas]             = useState([]);  
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const { loading: loadingWithdraws, 
          data: dataWithdraws, 
          error: errorWithdraws,
          networkStatus } = useQuery(queryAdminWithdraws, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'cache-first', 
                                        nextFetchPolicy: 'network-only', 
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorWithdraws)) handlerErrorApollo( props, errorWithdraws )

  useEffect(() => {
    if(!loadingWithdraws){
      if(!_.isEmpty(dataWithdraws?.adminWithdraws)){
        let { status, data } = dataWithdraws.adminWithdraws
        if(status){
          setDatas(_.orderBy(data, i => i.createdAt, 'desc'))
        }
      }
    }
  }, [dataWithdraws, loadingWithdraws])

  const fetchMoreData = async() =>{
    // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
    // let {status, data} =  mores.data.suppliers
    // console.log("status, data :", status, data)
   
    if(slice === total){
        setHasMore(false);
    }else{
        setTimeout(() => {
            // let newDatas = [...datas, ...data]
            // setDatas(newDatas)
            // setSlice(newDatas.length);
        }, 1000); 
    }
  }

  return (<div style={{flex:1}}>
            {
              loadingWithdraws
              ?  <LinearProgress />
              :  datas.length == 0 
                  ?   <label>Empty data</label>
                  :   <InfiniteScroll
                          dataLength={slice}
                          next={fetchMoreData}
                          hasMore={hasMore}
                          loader={<h4>Loading...</h4>}>
                          { 
                          _.map(datas, (item, index) => {

                            console.log("item :", item)

                            let { _id, userId, type } = item
                           
                            return  <AdminWithdrawsItem 
                                      _id={_id}
                                      userId={userId} 
                                      balance={item?.withdraw?.balance} 
                                      onMutationAdminWithdraw={(v)=>onMutationAdminWithdraw(v)} />
                          })
                        }
                      </InfiniteScroll>
            }
          </div>);
}

export default AdminWithdrawsPage;