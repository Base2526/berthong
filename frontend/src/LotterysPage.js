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

const LotterysPage = (props) => {
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
                      navigate("/lottery", {state: {from: "/", mode: "edit", id: original?._id } })
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
  
  return (
    <div className="App">
      
      {
        loadingSuppliers
        ? <CircularProgress />
        : <div>
            <button onClick={(evt)=>{ navigate("/lottery", {state: {from: "/", mode: "new" } }) }}> <AddBoxIcon/>{t("ADD")} </button>
            <TableComp
              columns={columns}
              data={datas}
              fetchData={fetchData}
              rowsPerPage={pageOptions}
              updateMyData={updateMyData}
              skipReset={skipResetRef.current}
              isDebug={false}/>
          </div> 
      }

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
};

export default LotterysPage;