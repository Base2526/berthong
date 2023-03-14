import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import _ from "lodash"
import { connect } from "react-redux";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from "react-i18next";
import CardActionArea from "@material-ui/core/CardActionArea";

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
  CircularProgress
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";

import { getHeaders, checkRole } from "./util"
import { querySuppliers } from "./gqlQuery"
import ReadMoreMaster from "./helpers/ReadMoreMaster"
import TableComp from "./components/TableComp"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"

const SuppliersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user, onLightbox } = props
  // const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  // const [pageIndex, setPageIndex]     = useState(0);  
  // const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)
  /*
  const [onDeletePhone, resultDeletePhone] = useMutation(gqlDeletePhone, {
    context: { headers: getHeaders() },
    update: (cache, {data: {deletePhone}}) => {
      const data1 = cache.readQuery({
        query: gqlPhones,
        variables: {userId: _.isEmpty(user) ? "" : user._id, page: pageIndex, perPage: pageSize},
      });

      let newPhones = {...data1.phones}
      let newData   = _.filter(data1.phones.data, phone => phone._id !== deletePhone._id)
      newPhones = {...newPhones, total: newData.length, data:newData }

      cache.writeQuery({
        query: gqlPhones,
        data: { phones: newPhones },
        variables: {userId: _.isEmpty(user) ? "" : user._id, page: pageIndex, perPage: pageSize},
      });
    },
    onCompleted({ data }) {
      history.push("/phones");
    }
  });
  console.log("resultDeletePhone :", resultDeletePhone)
  */

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          subscribeToMore: subscribeToMoreSuppliers, 
          networkStatus: networkStatusSuppliers } = useQuery( querySuppliers, { 
                                                                context: { headers: getHeaders(location) }, 
                                                                fetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: true});

  useEffect(() => {
    if(!loadingSuppliers){
      if (dataSuppliers?.suppliers) {
        let { status, data } = dataSuppliers?.suppliers
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataSuppliers, loadingSuppliers])

  ///////////////
  // const fetchData = useCallback(({ pageSize, pageIndex }) => {
  //   setPageSize(pageSize)
  //   setPageIndex(pageIndex)
  // })
  ///////////////

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  const handleDelete = (id) => {
    // onDeletePhone({ variables: { id } });
  };

  ///////////////////////
  const columns = useMemo(
    () =>{
      switch(checkRole(user)){
        case AMDINISTRATOR:{
          return [
            {
              Header: 'รูป',
              accessor: 'files',
              Cell: props =>{
                if(props.value.length < 1){
                  return <div />
                }
    
                console.log("files :", props.value)
                
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
              Header: 'ชื่อ',
              accessor: 'title',
              Cell: props =>{
                  let {_id, title} = props.row.original
                  return ( <div style={{ position: "relative" }} 
                            onClick={()=>{
                              // history.push({
                              //   pathname: "/p",
                              //   search: `?id=${_id}`,
                              //   state: { id: _id }
                              // });
                              navigate({
                                pathname: "/d",
                                search: `?${createSearchParams({ id: _id})}`,
                                state: { id: _id }
                              })
                            }}>{title}</div> );
              }
            },
            {
              Header: 'Detail',
              accessor: 'description',
              Cell: props => {
                return <Box
                        sx={{
                          maxHeight: "inherit",
                          width: "100%",
                          whiteSpace: "initial",
                          lineHeight: "16px"
                        }}>
                        <ReadMoreMaster
                          byWords={true}
                          length={10}
                          ellipsis="...">{props.value}
                        </ReadMoreMaster>
                      </Box>
              }
            },
            {
              Header: 'จำนวนที่จอง',
              // accessor: 'buys',
              Cell: props => {
                let {buys} = props.row.original

                buys = _.filter(buys, (buy)=>buy.selected == 0)
                console.log("จำนวนที่จอง : ", props.row.original)
                return <div>{buys.length}</div>
              }
            },
            {
              Header: 'จำนวนที่ขายได้',
              accessor: 'buys',
              Cell: props => {
                let {buys} = props.row.original

                buys = _.filter(buys, (buy)=>buy.selected == 1)
                return <div>{buys.length}</div>
              }
            },
            {
              Header: 'Owner name',
              accessor: 'ownerName',
              Cell: props => {
                let {ownerId, ownerName} = props.row.original

                console.log("props.row.original",  props.row.original)
                return <div onClick={()=>{
                  // history.push({ 
                  //   pathname: "/profile", 
                  //   search: `?u=${ownerId}`,
                  //   // state: {from: "/", mode: "edit", id: _id } 
                  // });

                  navigate({
                    pathname: "/profile",
                    search: `?${createSearchParams({ u: ownerId})}`
                  })
                }}>{ownerName}</div>
              }
            },
            {
              Header: 'Follows',
              accessor: 'follows',
              Cell: props => {
                let {follows} = props.row.original
    
                console.log("follows :", follows)
    
                return <div>{follows.length}</div>
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
              Header: 'Action',
              Cell: props => {
                let {_id, description} = props.row.original
                return  <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                          alignItems="center">
                            <button onClick={(evt)=>{
                              // history.push({ 
                              //   pathname: "/supplier", 
                              //   state: {from: "/", mode: "edit", id: _id } 
                              // });
                              navigate("/supplier", {state: {from: "/", mode: "edit", id: _id} })
                            }}><EditIcon/>{t("edit")}</button>
                            <button onClick={(e)=>{
                              setOpenDialogDelete({ isOpen: true, id: _id, description });
                            }}><DeleteForeverIcon/>{t("delete")}</button>
                        </Stack>
              }
            },
          ] 
        }
  
        case AUTHENTICATED:{
          return [
            {
              Header: 'รูป',
              accessor: 'files',
              Cell: props =>{
                if(props.value.length < 1){
                  return <div />
                }
    
                console.log("files :", props.value)
                
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
              Header: 'ชื่อ',
              accessor: 'title',
              Cell: props =>{
                  let {_id, title} = props.row.original
                  return ( <div style={{ position: "relative" }} 
                            onClick={()=>{
                              // history.push({
                              //   pathname: "/p",
                              //   search: `?id=${_id}`,
                              //   // hash: "#react",
                              //   state: { id: _id }
                              // });
                              navigate({
                                pathname: "/d",
                                search: `?${createSearchParams({ id: _id})}`,
                                state: { id: _id }
                              })
                            }}>{title}</div> );
              }
            },
            {
              Header: 'Detail',
              accessor: 'description',
              Cell: props => {
                return <Box
                        sx={{
                          maxHeight: "inherit",
                          width: "100%",
                          whiteSpace: "initial",
                          lineHeight: "16px"
                        }}>
                        <ReadMoreMaster
                          byWords={true}
                          length={10}
                          ellipsis="...">{props.value}
                        </ReadMoreMaster>
                      </Box>
              }
            },
            {
              Header: 'บน/ล่าง',
              accessor: 'type',
              Cell: props => {
                let {type} = props.row.original    
                return <div>{type}</div>
              }
            },
            {
              Header: 'หมวดหมู่',
              accessor: 'category',
              Cell: props => {
                let {category} = props.row.original    
                return <div>{category}</div>
              }
            },
            {
              Header: 'ขั้นตอนการขาย',
              accessor: 'condition',
              Cell: props => {
                let {condition} = props.row.original    
                return <div>{condition}</div>
              }
            },
            {
              Header: 'จำนวนที่ขายได้',
              accessor: 'buys',
              Cell: props => {
                let {buys} = props.row.original
    
                console.log("buys :", buys)
    
    
                return <div>{buys.length}</div>
              }
            },
            {
              Header: 'Follows',
              accessor: 'follows',
              Cell: props => {
                let {follows} = props.row.original
    
                console.log("follows :", follows)
    
                return <div>{follows.length}</div>
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
              Header: 'Action',
              Cell: props => {
                let {_id, description} = props.row.original
                return  <div className="Btn--posts">
                            <button onClick={(evt)=>{
                              // history.push({ 
                              //   pathname: "/supplier", 
                              //   state: {from: "/", mode: "edit", id: _id } 
                              // });
                              navigate("/supplier", {state: {from: "/", mode: "edit", id: _id} })
                            }}><EditIcon/>{t("edit")}</button>
                            <button onClick={(e)=>{
                              setOpenDialogDelete({ isOpen: true, id: _id, description });
                            }}><DeleteForeverIcon/>{t("delete")}</button>
                        </div>
              }
            },
          ] 
        }
      }
    } ,
    []
  )

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

  return (<div className="pl-2 pr-2">
            <Box style={{ flex: 4 }} className="table-responsive">
              {/* {
                loadingSuppliers
                ? <CircularProgress />
                : <TableComp
                    columns={columns}
                    data={data}
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}
                  />
              } */}

              {
                loadingSuppliers
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

                              console.log("item :", i)
                              return  <Stack direction="row" spacing={2}>{index} : {i.title}</Stack>
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

              <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                onClick={(e)=>{ 
                  navigate("/supplier", {state: {from: "/", mode: "new"} })
                }}>
              </SpeedDial>
            </Box>
          </div>);
};

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
};

export default connect( mapStateToProps, null )(SuppliersPage);
