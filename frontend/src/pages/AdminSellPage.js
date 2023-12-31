import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import _ from "lodash"
import { AddBox as AddBoxIcon, 
         Edit as EditIcon, 
         DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { useTranslation } from "react-i18next";
import {
  Box,
  Stack,
  Avatar,
  SpeedDial,
  SpeedDialIcon,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  LinearProgress
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'

import { getHeaders, checkRole, handlerErrorApollo } from "../util"
import { queryBuys, queryManageLotterys } from "../apollo/gqlQuery"
import ManageLComp from "../components/ManageLComp"
import * as Constants from "../constants"
import TableComp from "../components/TableComp"

const INIT_SEARCH = {
  PAGE: 1,
  LIMIT: 1000,
  NUMBER: "",
  TITLE: "",
  DETAIL: "",
  PRICE: 500,
  CHK_BON: false,
  CHK_LAND: false,
  CHK_MONEY: false,
  CHK_GOLD: false
}

const AdminSellPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user, onLightbox } = props

  let [search, setSearch] = useState(INIT_SEARCH)
  let [manageLotterys, setManageLotterys] = useState([]);

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [data, setData] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);

  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])



  const { loading: loadingBuys, 
          data: dataBuys, 
          error: errorBuys, 
          subscribeToMore: subscribeToMoreBuys, 
          fetchMore: fetchMoreBuys,
          networkStatus: networkStatusBuys } = useQuery( queryBuys, { 
                                                                context: { headers: getHeaders(location) }, 
                                                                // variables: { input: search },
                                                                fetchPolicy: 'cache-first' , 
                                                                nextFetchPolicy: 'network-only' , 
                                                                notifyOnNetworkStatusChange: true
                                                              });

  useEffect(() => {
    if(!loadingBuys){
      if (dataBuys?.buys) {
        let { status, data: newData } = dataBuys?.buys
        if(status){
          setData(newData)
        }
      }
    }
  }, [dataBuys, loadingBuys])

  // useEffect(()=>{
  //   if(!loadingManageLotterys){
  //     if(!_.isEmpty(dataManageLotterys?.manageLotterys)){
  //       let { status, data:newManageLotterys } = dataManageLotterys.manageLotterys
  //       if(status){
  //         console.log("newManageLotterys :", newManageLotterys)
  //         if(!_.isEqual( manageLotterys, newManageLotterys ))setManageLotterys(newManageLotterys)
  //       } 
  //     }
  //   }
  // }, [dataManageLotterys, loadingManageLotterys])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });
  };

  // const handleLoadMore = () => {
  //   fetchMoreWithdraws({
  //     variables: {
  //       input: {...search, PAGE: search.PAGE + 1}
  //     },
  //     updateQuery: (prev, {fetchMoreResult}) => {
  //       if (!fetchMoreResult?.suppliers?.data?.length) {
  //         return prev;
  //       }

  //       let suppliers = {...prev.suppliers, data: _.unionBy( fetchMoreResult?.suppliers?.data, prev?.suppliers?.data, '_id') }
  //       return Object.assign({}, prev, {suppliers} );
  //     },
  //   });
  // }

  const columns = useMemo(
                            () => [
                              {
                                Header: 'งวดที่ออกรางวัล * ',
                                Cell: props =>{
                                  let {supplier} = props?.row?.original

                                  console.log("props?.row?.original :", props?.row?.original)
                                  return <ManageLComp _id={supplier?.manageLottery}/>
                                }
                              },
                              {
                                Header: 'User',
                                accessor: "user",
                                Cell: props =>{
                                  let {userId, user} = props?.row?.original
                                  return <div
                                          onClick={(evt)=>navigate({ pathname: `/p`, search: `?${createSearchParams({ id: userId })}` })}
                                  >{user?.displayName}</div>
                                }
                              },
                              {
                                Header: 'ยอดเงิน',
                                // accessor: "user",
                                Cell: props =>{
                                  let { _id, userId, supplier } = props?.row?.original
                                  let { priceUnit, buys } = supplier
                                  let buy = _.filter(buys, i=>i.transitionId === _id && i.userId === userId && i?.selected === 1)
                                  return <div>{buy.length * priceUnit}</div>
                                }
                              },
                              {
                                Header: 'Title',
                                accessor: "supplier",
                                Cell: props =>{
                                  let {supplier} = props?.row?.original
                                  return <div
                                   onClick={(evt)=>{
                                    navigate({
                                      pathname: "/d",
                                      search: `?${createSearchParams({ id: supplier._id})}`,
                                      state: { id: supplier._id }
                                    })
                                   }}>{supplier?.title}</div>
                                }
                              },
                              {
                                Header: 'isLucky',
                                accessor: "isLucky",
                                Cell: props =>{
                                  let { _id, isLucky, statusPay } = props?.row?.original
                                  console.log("isLucky, statusPay :", isLucky, statusPay)
                                  return <div>
                                            <div>
                                              {isLucky ? "YES" : "NO"}
                                            </div>
                                            <div>
                                            {
                                              isLucky 
                                              ? <button onClick={(evt)=>{
                                                  navigate("/pay",  {state: {from: "/", id: _id } } )
                                                }}><EditIcon/>{t("edit")}
                                                </button>
                                              : ""
                                            }
                                            </div>
                                            <div>
                                              {
                                               isLucky ? statusPay ? "Pay" : "No pay" : ""
                                              }
                                            </div>
                                          </div>
                                }
                              },
                              {
                                Header: 'Status',
                                Cell: props =>{
                                  let { supplier } = props?.row?.original
                                  return <div>{supplier?.expire ? "Expire" : "Not expire"}</div>
                                }
                              },
                              {
                                Header: 'Date',
                                accessor: 'createdAt',
                                Cell: props => {
                                  let {createdAt} = props.row.values 
                                  return <div>{(moment(new Date(createdAt), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}</div>
                                }
                              },
                            ],
                            []
                          )

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
      skipResetRef.current = true
  }
  
  //////////////////////

  const fetchData = useCallback(({ pageSize, pageIndex }) => {
      setPageSize(pageSize)
      setPageIndex(pageIndex)
  })
  
  return (
    <div className="App">
      {
        loadingBuys
        ? <CircularProgress />
        : <TableComp
            columns={columns}
            data={data}
            fetchData={fetchData}
            rowsPerPage={pageOptions}
            updateMyData={updateMyData}
            skipReset={skipResetRef.current}
            isDebug={false}/>
      }

      {/* { openDialogDelete.isOpen && 
        <Dialog
          open={openDialogDelete.isOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
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
                handleDelete(openDialogDelete.id);

                setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</Button>
            <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
          </DialogActions>
        </Dialog>
      } */}
    </div>
  )
};

export default AdminSellPage;