import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
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
        CircularProgress
      } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import { getHeaders, checkRole, showToast } from "./util"
import { queryDeposits, mutationDeposit } from "./gqlQuery"
import { logout } from "./redux/actions/auth"
import { AMDINISTRATOR, UNAUTHENTICATED } from "./constants"
import TableComp from "./components/TableComp"

deepdash(_);

const DepositsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout, onLightbox } = props

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" }); 
  const [datas, setDatas]             = useState([]);  
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const { loading: loadingDeposits, 
          data: dataDeposits, 
          error: errorDeposits,
          networkStatus } = useQuery(queryDeposits, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorDeposits)){
    _.map(errorDeposits?.graphQLErrors, (e)=>{
      switch(e?.extensions?.code){
        case UNAUTHENTICATED:{
          showToast("error", e?.message)
          break;
        }
      }
    })
  }

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
  
  useEffect(() => {
    if(!loadingDeposits){
      if(!_.isEmpty(dataDeposits?.deposits)){
        let { status, code, data } = dataDeposits.deposits
        if(status)setDatas(data)
      }
    }
  }, [dataDeposits, loadingDeposits])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

    ///////////////////////
    ///////////////
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex)
  })

  ///////////////
  const columns = useMemo(
      () => 
       {
        return [
          {
            Header: 'รูป',
            accessor: 'files',
            Cell: props =>{
              if(props.value.length < 1){
                return <div />
              }              
              return (
                <div style={{ position: "relative" }}>
                  <CardActionArea style={{ position: "relative", paddingBottom: "10px" }}>
                    <Avatar
                      sx={{
                        height: 100,
                        width: 100
                      }}
                      variant="rounded"
                      alt="Example Alt"
                      src={props.value[0].url}
                      onClick={(e) => {
                        console.log("files props: ", props.value)
                        onLightbox({ isOpen: true, photoIndex: 0, images:props.value })
                      }}
                    />
                  </CardActionArea>
                  <div
                      style={{
                          position: "absolute",
                          bottom: "5px",
                          right: "5px",
                          padding: "5px",
                          backgroundColor: "#e1dede",
                          color: "#919191"
                      }}
                      >{(_.filter(props.value, (v)=>v.url)).length}</div>
                </div>
              );
            }
          },
          {
            Header: 'Balance',
            accessor: 'balance',
            Cell: props =>{
              let {balance} = props.row.values
              return ( <div style={{ position: "relative" }}>{balance}</div> );
            }
          },
          {
            Header: 'Bank',
            accessor: 'bank',
            Cell: props =>{
                let {bank} = props.row.values
                return <div>{bank.bankNumber} - {bank.bankName}</div>
            }
          },
          {
            Header: 'Date tranfer',
            accessor: 'dateTranfer',
            Cell: props => {
                let {dateTranfer} = props.row.values
                dateTranfer = new Date(dateTranfer).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                return <div>{ (moment(dateTranfer, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
            }
          },
          {
            Header: 'Status',
            accessor: 'status',
            Cell: props => {
              let {status} = props.row.values
              return <div>{status}</div>
            }
          },
          {
            Header: 'Created at',
            accessor: 'createdAt',
            Cell: props => {
              let {createdAt} = props.row.values
              createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
  
              return <div>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
            }
          },
          {
            Header: 'updated at',
            accessor: 'updatedAt',
            Cell: props => {
                let {updatedAt} = props.row.values
    
                updatedAt = new Date(updatedAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
    
                return <div>{ (moment(updatedAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
            }
          },
          {
            Header: 'Action',
            Cell: props => {
              let {_id, status, description} = props.row.original
              switch(status){
                case "wait":{
                  return  <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            alignItems="center">
                              <button onClick={(evt)=>{
                                navigate("/deposit", {state: {from: "/", mode: "edit", id: _id }} )
                              }}><EditIcon/>{t("edit")}</button>
                              <button onClick={(e)=>{
                                setOpenDialogDelete({ isOpen: true, id: _id, description });
                              }}><DeleteForeverIcon/>{t("delete")}</button>
                          </Stack>
                }
                case "approved":{
                  return  <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            alignItems="center">
                              <button onClick={(e)=>{
                                setOpenDialogDelete({ isOpen: true, id: _id, description });
                              }}><DeleteForeverIcon/>{t("delete")}</button>
                          </Stack>
                }
                case "reject":{
                  return  <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            alignItems="center">
                            <button onClick={(evt)=>{
                              navigate("/deposit", {state: {from: "/", mode: "edit", id: _id }} )
                            }}><EditIcon/>{t("edit")}</button>
                            <button onClick={(e)=>{
                              setOpenDialogDelete({ isOpen: true, id: _id, description });
                            }}><DeleteForeverIcon/>{t("delete")}</button>
                          </Stack>
                }

                default:{
                  return <div />
                }
              }             
            }
          },
      ]
       },
      []
  )
  
  // const [data, setData] = useState(() => makeData(10000))
  // const [originalData] = useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    console.log("updateMyData")
    // We also turn on the flag to not reset the page
    skipResetRef.current = true
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...row,
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }
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
         {/* {
            loadingDeposits
            ? <CircularProgress /> 
            : <div>
                {
                  checkRole(user) !== AMDINISTRATOR 
                  ? <button onClick={()=>{  
                      // history.push({ pathname: "/deposit", state: {from: "/", mode: "new"}  });
                      navigate("/deposit", {state: {from: "/", mode: "new"}} )
                    }}>เพิ่ม แจ้งฝากเงิน</button>
                  : ""
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
          } */}

              {
                loadingDeposits
                ?  <CircularProgress />
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
                              // return  <Stack direction="row" spacing={2}>{index} : {i.title}</Stack>

                              let files   = item?.files;
                              let balance = item.balance;
                              let bank = item.bank;
                              let dateTranfer   = item.dateTranfer;
                              let status  = item.status;
                              let createdAt = item.createdAt;

                              dateTranfer = new Date(dateTranfer).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                              createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
  
                              return  <Stack direction="row" spacing={2} >
                                        <Box sx={{ width: '7%' }}>
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
                                        <Box sx={{ width: '5%' }}>{balance}</Box>
                                        <Box sx={{ width: '20%' }}>{bank.bankNumber} - {bank.bankName}</Box>
                                        <Box sx={{ width: '15%' }}>{(moment(dateTranfer, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                        <Box sx={{ width: '5%' }}>{status}</Box>
                                        <Box sx={{ width: '15%' }}>{(moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                    
                                        <Box sx={{ width: '15%' }}>
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
                    let newInput = _.find(datas, (item)=>openDialogDelete.id == item._id.toString())

                    newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                    newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                    onMutationDeposit({ variables: { input: newInput } });
                  }}
                >{t("delete")}</Button>
                <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
              </DialogActions>
            </Dialog>
          )}

          </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(DepositsPage);