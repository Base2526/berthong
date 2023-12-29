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
import { queryManageSuppliers, queryUsers } from "../apollo/gqlQuery"
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

const UsersPage = (props) => {
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


  let [input, setInput] = useState({ OFF_SET: 0, LIMIT: 20 })
  const [loading, setLoading] = useState(true);

  // const { loading: loadingSuppliers, 
  //         data: dataSuppliers, 
  //         error: errorSuppliers, 
  //         subscribeToMore: subscribeToMoreSuppliers, 
  //         fetchMore: fetchMoreSuppliers,
  //         networkStatus: networkStatusSuppliers } = useQuery( queryManageSuppliers, { 
  //                                                             context: { headers: getHeaders(location) }, 
  //                                                             // variables: { input: search },
  //                                                             fetchPolicy: 'cache-first' , 
  //                                                             nextFetchPolicy: 'network-only' , 
  //                                                             notifyOnNetworkStatusChange: true
  //                                                           });

  // if(!_.isEmpty(errorSuppliers)){
  //   handlerErrorApollo( props, errorSuppliers )
  // }

  /////////

   const { loading: loadingUsers, 
          data: dataUsers, 
          error: errorUsers, 
          networkStatus: networkStatusUsers,
          fetchMore: fetchMoreUsers } = useQuery(queryUsers, 
                                        { 
                                          context: { headers: getHeaders(location) }, 
                                          variables: {input},
                                          fetchPolicy: 'network-only', 
                                          nextFetchPolicy: 'cache-first', 
                                          notifyOnNetworkStatusChange: true
                                        }
                                      );

  if(!_.isEmpty(errorUsers)) handlerErrorApollo( props, errorUsers )

  useEffect(() => {
    if(!loadingUsers){
      if(!_.isEmpty(dataUsers?.users)){
        let { status, total, data } = dataUsers?.users
        if(status){
          setDatas(data)
          setTotal(total)
        }

        setLoading(false)
      }
    }
  }, [dataUsers, loadingUsers])

  ////////

  // useEffect(() => {
  //   if(!loadingSuppliers){
  //     if (dataSuppliers?.manageSuppliers) {
  //       let { status, data } = dataSuppliers?.manageSuppliers
  //       if(status){
  //         setDatas(data)
  //       }
  //     }
  //   }
  // }, [dataSuppliers, loadingSuppliers])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });

    console.log("handleDelete :", id)
    onMutationLottery({ variables: { input: {mode: "DELETE", _id: id} } });
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

  // const handleRefresh = async() => {
  //   // onSearchChange({...search, PAGE: 1})
  // }

  const getColmns = () =>{
    return  [
              {
                Header: 'Edit',
                Cell: props => {
                  let { original } = props.row
                  return <button onClick={()=>{ navigate("/user", {state: {from: "/", mode: "edit", id: original?._id}}) }}><EditIcon/>{t("edit")}</button>
                }
              },
              {
                Header: 'Image',
                accessor: 'avatar',
                Cell: props =>{
                    let {original} = props.row
                    console.log("original :", original)
                    return  <div> 
                              <Avatar
                                alt="Avatar"
                                variant="rounded"
                                src={ _.isEmpty(original?.avatar) ? "" : original?.avatar?.url}
                                onClick={(e) => {
                                  onLightbox({ isOpen: true, photoIndex: 0, images:original?.avatar })
                                }}
                                sx={{ width: 56, height: 56 }}
                              />
                            </div>
                }
              },
              {
                Header: 'Display name',
                accessor: 'displayName',
                Cell: props =>{
                  let { original } = props.row
                  return <div>{ original?.displayName }</div>
                }
              },
              {
                Header: 'Is seller',
                Cell: props =>{
                  let { original } = props.row
                  let roles = original?.roles
                  return <div>{ _.includes(roles, Constants.SELLER.toString()) ? "YES" : "NO" }</div>
                }
              },

              {
                Header: 'Lock account',
                accessor: 'lockAccount',
                Cell: props =>{
                  let { original } = props.row
                  return <div>{ original?.lockAccount?.lock ? "YES" : "NO"}</div>
                }
              },
              {
                Header: 'Last access',
                accessor: 'lastAccess',
                Cell: props => {
                  let {original} = props.row 
                  return <div>{(moment(new Date(original?.lastAccess), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')} - { moment(new Date(original?.lastAccess)).fromNow() }</div>
                }
              },
            ]
    
  }

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
        loadingUsers
        ? <CircularProgress />
        : <div>
          {/* {
            checkRole(user) == Constants.SELLER 
            ? <button onClick={(evt)=>{ navigate("/lottery", {state: {from: "/", mode: "new" } }) }}> <AddBoxIcon/>{t("ADD")} </button>
            : <div/>
          } */}
            <TableComp
              columns={getColmns()}
              data={datas}
              fetchData={fetchData}
              rowsPerPage={pageOptions}
              updateMyData={updateMyData}
              skipReset={skipResetRef.current}
              isDebug={false}/>
          </div> 
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

export default UsersPage;