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
  LinearProgress,
  IconButton
} from "@mui/material";
import moment from "moment";
import { getHeaders, handlerErrorApollo, checkRole } from "../util"
import { queryContents } from "../apollo/gqlQuery"
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

const ContentsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user, onLightbox, onMutationLottery } = props
  
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);

  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])

  const { loading: loadingContents, 
          data: dataContents, 
          error: errorContents, 
          networkStatus: networkStatusSuppliers } = useQuery( queryContents, { 
                                                              context: { headers: getHeaders(location) }, 
                                                              fetchPolicy: 'cache-first' , 
                                                              nextFetchPolicy: 'network-only' , 
                                                              notifyOnNetworkStatusChange: true
                                                            });

  if(!_.isEmpty(errorContents)){
    handlerErrorApollo( props, errorContents )
  }

  useEffect(() => {
    if(!loadingContents){
      if (dataContents?.contents) {
        let { status, data } = dataContents?.contents
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataContents, loadingContents])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });

    console.log("handleDelete :", id)
    // onMutationLottery({ variables: { input: {mode: "DELETE", _id: id} } });
  };

  // const handleLoadMore = () => {
  //   fetchMoreSuppliers({
  //     // variables: {
  //     //   input: {...search, PAGE: search.PAGE + 1}
  //     // },
  //     updateQuery: (prev, {fetchMoreResult}) => {
  //       if (!fetchMoreResult?.suppliers?.data?.length) {
  //         return prev;
  //       }

  //       let suppliers = {...prev.suppliers, data: _.unionBy( fetchMoreResult?.suppliers?.data, prev?.suppliers?.data, '_id') }
  //       return Object.assign({}, prev, {suppliers} );
  //     },
  //   });
  // }

  useEffect(()=>{
    console.log("datas :", datas)
  }, [datas])

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
                          return <div>{ original?.title }</div>
                        }
                      },
                      {
                        Header: 'Description',
                        accessor: 'description',
                        Cell: props =>{
                          let { original } = props.row
                          return <div>{ original?.description }</div>
                        }
                      },
                      {
                        Header: 'Edit',
                        Cell: props => {
                          let { original } = props.row
                          return  <div>
                                    <button onClick={(evt)=>{
                                      navigate("/content", {state: {from: "/", mode: "edit", id: original?._id } })
                                    }}><EditIcon/>{t("edit")}
                                    </button>
                                    <button onClick={(e)=>{
                                      setOpenDialogDelete({ isOpen: true, id: original?._id, description: original?.description });
                                    }}><DeleteForeverIcon/>{t("delete")}</button>
                                  </div>
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
        loadingContents
        ? <CircularProgress />
        : <div>
          {
            checkRole(user) == Constants.AMDINISTRATOR 
            ? <button onClick={(evt)=>{ navigate("/content", {state: {from: "/", mode: "new" } }) }}> <AddBoxIcon/>{t("ADD")} </button>
            : <div/>
          }
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

export default ContentsPage;