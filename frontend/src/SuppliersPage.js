import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import _ from "lodash"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
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

import { getHeaders, checkRole } from "./util"
import { queryAdminSuppliers } from "./gqlQuery"
import UserComp from "./components/UserComp"

import * as Constants from "./constants"

import TableComp from "./components/TableComp"

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

const SuppliersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user, onLightbox } = props

  let [search, setSearch] = useState(INIT_SEARCH)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);

  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          subscribeToMore: subscribeToMoreSuppliers, 
          fetchMore: fetchMoreSuppliers,
          networkStatus: networkStatusSuppliers } = useQuery( queryAdminSuppliers, { 
                                                                context: { headers: getHeaders(location) }, 
                                                                variables: { input: search },
                                                                fetchPolicy: 'cache-first' , 
                                                                nextFetchPolicy: 'network-only' , 
                                                                notifyOnNetworkStatusChange: true
                                                              });

  useEffect(() => {
    if(!loadingSuppliers){
      if (dataSuppliers?.adminSuppliers) {
        let { status, data } = dataSuppliers?.adminSuppliers
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataSuppliers, loadingSuppliers])


  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });
  };

 
  const handleLoadMore = () => {
    fetchMoreSuppliers({
      variables: {
        input: {...search, PAGE: search.PAGE + 1}
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult?.suppliers?.data?.length) {
          return prev;
        }

        let suppliers = {...prev.suppliers, data: _.unionBy( fetchMoreResult?.suppliers?.data, prev?.suppliers?.data, '_id') }
        return Object.assign({}, prev, {suppliers} );
      },
    });
  }

  const handleRefresh = async() => {
    // onSearchChange({...search, PAGE: 1})
  }

  /*
  return (<div className="pl-2 pr-2">
            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{ position: 'absolute' }}
              icon={<SpeedDialIcon />}
              onClick={(e)=> navigate("/supplier", {state: {from: "/", mode: "new"} }) } />
            <Box style={{ flex: 4 }} className="table-responsive">
              
              {
                loadingSuppliers
                ?  <CircularProgress />
                :  datas.length == 0 
                    ?   <label>Empty data</label>
                    :   <InfiniteScroll
                            dataLength={slice}
                            next={handleLoadMore}
                            hasMore={hasMore}
                            loader={<h4>Loading...</h4>}
                            scrollThreshold={0.5}
                            
                            // below props only if you need pull down functionality
                            refreshFunction={handleRefresh}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={50}
                            pullDownToRefreshContent={
                              <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                            }
                            releaseToRefreshContent={
                              <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                            }>
                            { 
                            _.map(datas, (item, index) => {

                              console.log("item :", item)
                              // return  <Stack direction="row" spacing={2}>{index} : {i.title}</Stack>

                              let title = item.title;
                              let description = item.description;
                              let type   = item.type;
                              let category  = item.category;
                              let condition = item.condition;
                              let buys    = item.buys;
                              let follows = item.follows;
                              let files   = item?.files
                              let createdAt = new Date(item.createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                    
                              return <Stack direction="row" spacing={2} >
                                      <Box sx={{ width: '10%' }}>
                                        <Avatar
                                          alt="Example avatar"
                                          variant="rounded"
                                          src={files[0]?.url}
                                          onClick={(e) => {
                                            onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                          }}
                                          sx={{ width: 56, height: 56 }}
                                        />
                                      </Box>
                                      <Box 
                                        sx={{ width: '10%' }}
                                        onClick={()=>{
                                          navigate({
                                          pathname: "/d",
                                          search: `?${createSearchParams({ id: item._id})}`,
                                          state: { id: item._id }
                                        })}}
                                      >{title}</Box>
                                      <Box sx={{ width: '20%' }}>{description}</Box>
                                      <Box sx={{ width: '20%' }}><UserComp userId={item?.ownerId} /></Box>
                                      <Box sx={{ width: '5%' }}>{type}</Box>
                                      <Box sx={{ width: '5%' }}>{category}</Box>
                                      <Box sx={{ width: '5%' }}>{condition}</Box>
                                      <Box sx={{ width: '5%' }}>{buys.length}</Box>
                                      <Box sx={{ width: '5%' }}>{follows.length}</Box>
                                      <Box sx={{ width: '10%' }}>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A') }</Box>
                                      <Box sx={{ width: '20%' }}>
                                        <button onClick={(evt)=>{
                                          navigate("/supplier", {state: {from: "/", mode: "edit", id: item?._id} })
                                        }}><EditIcon/>{t("edit")}
                                        </button>
                                        <button onClick={(e)=>{
                                          setOpenDialogDelete({ isOpen: true, id: item?._id, description: item?.description });
                                        }}><DeleteForeverIcon/>{t("delete")}</button>
                                      </Box>
                                    </Stack>
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
                        handleDelete(openDialogDelete.id);

                        setOpenDialogDelete({ isOpen: false, id: "", description: "" });
                      }}
                    >{t("delete")}</Button>
                    <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                  </DialogActions>
                </Dialog>
              )}
             
            </Box>
          </div>);
  */

  /*
  <Box sx={{ width: '20%' }}>{title}</Box>
  <Box sx={{ width: '20%' }}>{description}</Box>
  <Box sx={{ width: '20%' }}><UserComp userId={item?.ownerId} /></Box>
  <Box sx={{ width: '5%' }}>{type}</Box>
  <Box sx={{ width: '5%' }}>{category}</Box>
  <Box sx={{ width: '5%' }}>{condition}</Box>
  <Box sx={{ width: '5%' }}>{buys.length}</Box>
  <Box sx={{ width: '5%' }}>{follows.length}</Box>
  <Box sx={{ width: '10%' }}>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A') }</Box>
  
  let type   = item.type;
  let category  = item.category;
  let condition = item.condition;
  let buys    = item.buys;
  let follows = item.follows;
  let files   = item?.files
  */

  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
        Cell: props =>{
            let { original } = props.row
            return <div 
                    onClick={()=>{
                      navigate({
                      pathname: "/d",
                      search: `?${createSearchParams({ id: original._id})}`,
                      state: { id: original._id }
                    })}}>{ original?.title }</div>
        }
      },
      {
        Header: 'Image',
        accessor: 'files',
        Cell: props =>{
            let {files} = props.row.values
            console.log("files :", files)
            return  <div> 
                      <Avatar
                        alt="Avatar"
                        variant="rounded"
                        src={ _.isEmpty(files) ? "" : files[0]?.url}
                        onClick={(e) => {
                          onLightbox({ isOpen: true, photoIndex: 0, images:files })
                        }}
                        sx={{ width: 56, height: 56 }}
                      />
                    </div>
        }
      },
      {
        Header: 'จอง/ขาย',
        accessor: "buys",
        Cell: props =>{
          let { original } = props.row
          console.log("จอง/ขาย :", original)

          let books     =  _.filter(original?.buys, (buy)=> _.isEqual(buy?.selected, 0) )
          let buys      =  _.filter(original?.buys, (buy)=> _.isEqual(buy?.selected, 1) )
        
          return <div>{books.length}/{buys.length}</div>
        }
      },
      {
        Header: 'OWNER',
        accessor: "ownerId",
        Cell: props =>{
          let { owner } = props.row.original
          return <div>{owner.username}</div>
        }
      },
      {
        Header: 'Price',
        accessor: "price",
        Cell: props => {
          let {price} = props.row.values 
          return  <div>{ price }</div>
        }
      },
      {
        Header: 'Price Unit',
        accessor: "priceUnit",
        Cell: props => {
          let {priceUnit} = props.row.values 
          return  <div>{ priceUnit }</div>
        }
      },
      {
        Header: 'Date',
        accessor: 'createdAt',
        Cell: props => {
          let {createdAt} = props.row.values 
          let date = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
          return <div>{moment(date).format('DD MMM, YYYY h:mm:ss a')}</div>
        }
      },

      {
        Header: 'Edit',
        // accessor: 'createdAt',
        Cell: props => {
          // let {createdAt} = props.row.values 
          // let date = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
          let { original } = props.row
          console.log("props.row.values :", original)
          return  <div>
                    <button onClick={(evt)=>{
                      navigate("/supplier", {state: {from: "/", mode: "edit", id: original?._id } })
                    }}><EditIcon/>{t("edit")}
                    </button>
                    <button onClick={(e)=>{
                      setOpenDialogDelete({ isOpen: true, id: original?._id, description: original?.description });
                    }}><DeleteForeverIcon/>{t("delete")}</button>
                  </div>
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

  return  useMemo(() => {
            return (
              <div className="App">
                <TableComp
                  columns={columns}
                  data={datas}
                  fetchData={fetchData}
                  rowsPerPage={pageOptions}
                  updateMyData={updateMyData}
                  skipReset={skipResetRef.current}
                  isDebug={false}/> 

                { openDialogDelete.isOpen && 
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
                }
              </div>
            )
          }, [datas, openDialogDelete.isOpen])
  
};

export default SuppliersPage;