import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import _ from "lodash";
import deepdash from "deepdash";
import { useQuery, useMutation } from "@apollo/client";

import {
  Stack,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  CircularProgress
} from "@mui/material"

import InfiniteScroll from "react-infinite-scroll-component";

import { getHeaders } from "./util"
import { queryHistoryTransitions, mutationDeposit, queryDeposits } from "./gqlQuery"
import { logout } from "./redux/actions/auth"
deepdash(_);

const HistoryTransitionsPage = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = props
  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  // const historyTransitionsValue = useQuery(queryHistoryTransitions, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true });

  const { loading: loadingHistoryTransitions, 
          data: dataHistoryTransitions, 
          error: errorHistoryTransitions, 
          subscribeToMore: subscribeToMoreHistoryTransitions, 
          networkStatus: networkStatusHistoryTransitions } = useQuery(queryHistoryTransitions, { 
                                                                                                  context: { headers: getHeaders(location) }, 
                                                                                                  fetchPolicy: 'network-only', 
                                                                                                  notifyOnNetworkStatusChange: true 
                                                                                                });


  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {deposit}}) => {
      let { data, mode, status } = deposit

      if(status){
        switch(mode){
          case "delete":{
            let data1 = cache.readQuery({ query: queryDeposits });
            let dataFilter =_.filter(data1.deposits.data, (item)=>data._id != item._id)

            cache.writeQuery({
              query: queryDeposits,
              data: { deposits: {...data1.deposits, data: dataFilter} }
            });

            handleClose()
            break;
          }
        }
      }
    },
    onCompleted({ data }) {
      // history.goBack()
    },
    onError({error}){
      console.log("onError :")
    }
  });
  // console.log("resultMutationDeposit :", resultMutationDeposit)

  /*
  ฝาก
  - จำนวนเงิน
  - วันที่โอนเงิน ชม/นาที
  - สลิปการโอน
  */

  /*
  ถอน 
  - ชือบัญชี
  - ยอดเงิน
  */

  useEffect(() => {
    if (!loadingHistoryTransitions) {
      if(dataHistoryTransitions?.historyTransitions){
        let { status, data } = dataHistoryTransitions?.historyTransitions
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataHistoryTransitions, loadingHistoryTransitions])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  ///////////////////////
  ///////////////
  // const fetchData = useCallback(({ pageSize, pageIndex }) => {
  //   setPageSize(pageSize)
  //   setPageIndex(pageIndex)
  // })
  ///////////////
  // const columns = useMemo(
  //     () =>{

  //       console.log("props.row.original : ", user)

  //       switch(checkRole(user)){
  //         case AMDINISTRATOR:{
  //           return [
  //             {
  //               Header: 'Type',
  //               accessor: 'type',
  //               Cell: props =>{
  //                   let {type} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{type}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Balance',
  //               accessor: 'balance',
  //               Cell: props => {
  //                 let {balance} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{balance}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Bank',
  //               accessor: 'bank',
  //               Cell: props => {
  //                 let {bank} = props.row.values
  //                 return <div>{bank[0].bankName} {bank[0].bankNumber}</div>
  //               }
  //             },

  //             // 
  //             {
  //               Header: 'User Approve',
  //               accessor: 'userNameApprove',
  //               Cell: props => {
  //                 let {userNameApprove} = props.row.values
  //                 return <div>{userNameApprove} {userNameApprove}</div>
  //               }
  //             },
  //             {
  //               Header: 'Created at',
  //               accessor: 'createdAt',
  //               Cell: props => {
  //                   let {createdAt} = props.row.values
  //                   return <div>{createdAt}</div>
  //               }
  //             }
  //           ]
  //         }
    
  //         case AUTHENTICATED:{
  //           return [
  //             {
  //               Header: 'Type',
  //               accessor: 'type',
  //               Cell: props =>{
  //                   let {type} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{type}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Title',
  //               accessor: 'title',
  //               Cell: props =>{
  //                   let {title} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{title}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Balance',
  //               accessor: 'balance',
  //               Cell: props => {
  //                 let {balance} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{balance}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Description',
  //               accessor: 'description',
  //               Cell: props => {
  //                 let {description} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{description}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Created at',
  //               accessor: 'createdAt',
  //               Cell: props => {
  //                 let {createdAt} = props.row.values
  //                 createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

  //                 return <div>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
  //               }
  //             }, 
  //             {
  //               Header: 'updated at',
  //               accessor: 'updatedAt',
  //               Cell: props => {
  //                   let {updatedAt} = props.row.values

  //                   updatedAt = new Date(updatedAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

  //                   return <div>{ (moment(updatedAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
  //               }
  //             },
  //           ]
  //         }
  //       }
  //     } ,
  //     []
  // )
  
  // const [data, setData] = useState(() => makeData(10000))
  // const [originalData] = useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  // const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  // const updateMyData = (rowIndex, columnId, value) => {
  //   console.log("updateMyData")
  //   // We also turn on the flag to not reset the page
  //   skipResetRef.current = true
  //   // setData(old =>
  //   //   old.map((row, index) => {
  //   //     if (index === rowIndex) {
  //   //       return {
  //   //         ...row,
  //   //         [columnId]: value,
  //   //       }
  //   //     }
  //   //     return row
  //   //   })
  //   // )
  // }
  //////////////////////

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
              loadingHistoryTransitions
              ?  <CircularProgress />
              :  datas.length == 0 
                  ?   <label>Empty data</label>
                  :   <InfiniteScroll
                          dataLength={slice}
                          next={fetchMoreData}
                          hasMore={hasMore}
                          loader={<h4>Loading...</h4>}>
                          { 
                          _.map(datas, (i, index) => {
                            return  <Stack direction="row" spacing={2}>{index}</Stack>
                          })
                        }
                      </InfiniteScroll>
            }

            {openDialogDelete.isOpen && (
              <Dialog
                open={openDialogDelete.isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {openDialogDelete.description}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // let newInput = _.find(depositsValue.data.deposits.data, (item)=>openDialogDelete.id == item._id.toString())

                      // newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                      // newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                      // onMutationDeposit({ variables: { input: newInput } });
                    }}
                  >{t("delete")}</Button>
                  <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                </DialogActions>
              </Dialog>
            )}
          </div>);
}

const mapStateToProps = (state, ownProps) => {
    return {  }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(HistoryTransitionsPage);