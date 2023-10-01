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

import { getHeaders, checkRole } from "../util"
import { queryDeposits } from "../apollo/gqlQuery"
import UserComp from "../components/UserComp"
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

const DepositsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user, onLightbox } = props

  let [search, setSearch] = useState(INIT_SEARCH)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [data, setData] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);

  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])

  const { loading: loadingDeposits, 
          data: dataDeposits, 
          error: errorDeposits, 
          subscribeToMore: subscribeToMoreDeposits, 
          fetchMore: fetchMoreDeposits,
          networkStatus: networkStatusDeposits } = useQuery(  queryDeposits, 
                                                            { 
                                                              context: { headers: getHeaders(location) }, 
                                                              variables: { input: search },
                                                              fetchPolicy: 'cache-first' , 
                                                              nextFetchPolicy: 'network-only' , 
                                                              notifyOnNetworkStatusChange: true
                                                            }
                                                            );

  useEffect(() => {
    if(!loadingDeposits){
      if (dataDeposits?.deposits) {
        let { status, data: newData } = dataDeposits?.deposits
        if(status){
          setData(newData)
        }
      }
    }
  }, [dataDeposits, loadingDeposits])


  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });
  };

  const handleLoadMore = () => {
    fetchMoreDeposits({
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
        Header: 'ยอด',
        accessor: 'deposit',
        Cell: props =>{
            let deposit = props.value
            return <div>{ deposit?.balance }</div>
        }
      },
      {
        Header: 'User-Id',
        accessor: "userId",
        Cell: props =>{
          let userId = props.value      
          return <UserComp userId={userId} />
        }
      },
      {
        Header: 'Status',
        accessor: "status",
        Cell: props =>{
          let status = props.value
          switch(status){
            case Constants.WAIT:{
              return <div>WAIT</div>
            }

            case Constants.APPROVED:{
              return <div>APPROVED</div>
            }

            case Constants.REJECT:{
              return <div>REJECT</div>
            }
          }
          return <div>{status}</div>
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
        loadingDeposits
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

export default DepositsPage;