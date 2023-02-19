import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from '@mui/material/CircularProgress';
import _ from "lodash"
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { connect } from "react-redux";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from "react-i18next";
import "react-image-lightbox/style.css";
import CardActionArea from "@material-ui/core/CardActionArea";
import Avatar from "@mui/material/Avatar";
import moment from "moment";

import { getHeaders, checkRole } from "./util"
import { querySuppliers } from "./gqlQuery"
import ReadMoreMaster from "./ReadMoreMaster"
import Table from "./TableContainer"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"

const SuppliersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let { user } = props
  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [data, setData] = useState([]);
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

  // const suppliersValue = useQuery(querySuppliers, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true });

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          subscribeToMore, 
          networkStatus } = useQuery( querySuppliers, { 
                                      context: { headers: getHeaders(location) }, 
                                      fetchPolicy: 'network-only', 
                                      notifyOnNetworkStatusChange: true});

  useEffect(() => {
    if (dataSuppliers) {
      let { status, data } = dataSuppliers.suppliers
      if(status){
        setData(data)
      }
    }
  }, [dataSuppliers])

  ///////////////
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex)
  })
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

      // console.log("props.row.original : ", suppliersValue?.data?.suppliers?.data)

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
                          console.log("files props: ", props.value)
                          setLightbox({ isOpen: true, photoIndex: 0, images:props.value })
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
                                pathname: "/p",
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
                          setLightbox({ isOpen: true, photoIndex: 0, images:props.value })
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
                                pathname: "/p",
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

  return (<div className="pl-2 pr-2">
            <Box style={{ flex: 4 }} className="table-responsive">
              {
                loadingSuppliers
                ? <CircularProgress />
                : <Table
                  columns={columns}
                  data={data}
                  fetchData={fetchData}
                  rowsPerPage={pageOptions}
                  updateMyData={updateMyData}
                  skipReset={skipResetRef.current}
                  isDebug={false}
                />
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

              {lightbox.isOpen && (
                <Lightbox
                  mainSrc={lightbox.images[lightbox.photoIndex].url}
                  nextSrc={lightbox.images[(lightbox.photoIndex + 1) % lightbox.images.length].url}
                  prevSrc={
                    lightbox.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length].url
                  }
                  onCloseRequest={() => {
                    setLightbox({ ...lightbox, isOpen: false });
                  }}
                  onMovePrevRequest={() => {
                    setLightbox({
                      ...lightbox,
                      photoIndex:
                        (lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length
                    });
                  }}
                  onMoveNextRequest={() => {
                    setLightbox({
                      ...lightbox,
                      photoIndex: (lightbox.photoIndex + 1) % lightbox.images.length
                    });
                  }}
                />
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
