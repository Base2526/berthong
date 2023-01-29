import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import Avatar from "@mui/material/Avatar";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { getHeaders, checkRole } from "./util"
import { queryDeposits, mutationDeposit } from "./gqlQuery"
import { logout } from "./redux/actions/auth"

import { AMDINISTRATOR } from "./constants"

import ReadMoreMaster from "./ReadMoreMaster"
import Table from "./TableContainer"

const DepositsPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let { user, logout } = props

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  console.log("user :", user)

  const depositsValue = useQuery(queryDeposits, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true });

  console.log("depositsValue :", depositsValue)

  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders() },
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
  console.log("resultMutationDeposit :", resultMutationDeposit)

  // 

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
      () => [
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
            Header: 'Balance',
            accessor: 'balance',
            Cell: props =>{
                let {balance} = props.row.values
                return ( <div style={{ position: "relative" }}>{balance}</div> );
            }
          },
          {
            Header: 'Date tranfer',
            accessor: 'dateTranfer',
            Cell: props => {
                let {dateTranfer} = props.row.values
                return <div>{dateTranfer}</div>
            }
          },
          {
            Header: 'Status',
            accessor: 'status',
            Cell: props => {
              // switch(checkRole(user)){
              //   case AMDINISTRATOR:{
              //     return <div>AMDINISTRATOR</div>
              //   }
              // }
              let {status} = props.row.values
              return <div>{status}</div>
            }
          },
          {
            Header: 'Created at',
            accessor: 'createdAt',
            Cell: props => {
                let {createdAt} = props.row.values
                return <div>{createdAt}</div>
            }
          },
          {
          Header: 'Action',
          Cell: props => {
            let {_id, description} = props.row.original
            return  <div className="Btn--posts">
                        <button onClick={(evt)=>{
                          history.push({ 
                            pathname: "/deposit", 
                            state: {from: "/", mode: "edit", id: _id } 
                          });
                        }}><EditIcon/>{t("edit")}</button>
                        <button onClick={(e)=>{
                          setOpenDialogDelete({ isOpen: true, id: _id, description });
                        }}><DeleteForeverIcon/>{t("delete")}</button>
                    </div>
          }
          },
      ],
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

  return (<div style={{flex:1}}>
         {
            depositsValue.loading
            ? <CircularProgress /> 
            : <div>
                <button onClick={()=>{  
                  history.push({ 
                    pathname: "/deposit", 
                    state: {from: "/", mode: "new"} 
                  });
                }}>เพิ่ม แจ้งฝากเงิน</button>
                <Table
                  columns={columns}
                  data={depositsValue.data.deposits.data}
                  fetchData={fetchData}
                  rowsPerPage={pageOptions}
                  updateMyData={updateMyData}
                  skipReset={skipResetRef.current}
                  isDebug={false}/>
              </div>
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
                    let newInput = _.find(depositsValue.data.deposits.data, (item)=>openDialogDelete.id == item._id.toString())

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
    return { user:state.auth.user }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(DepositsPage);