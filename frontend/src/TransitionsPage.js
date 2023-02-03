import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

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
import { queryTransitions, mutationDeposit, queryWithdrawById, queryBankById } from "./gqlQuery"
import { logout } from "./redux/actions/auth"

import { AMDINISTRATOR, AUTHENTICATED } from "./constants"
import Table from "./TableContainer"

const TransitionsPage = (props) => {
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

  const transitionsValue = useQuery(queryTransitions, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true });

  console.log("transitionsValue :", transitionsValue)

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
      () =>{

        console.log("props.row.original : ", user)

        switch(checkRole(user)){
          case AMDINISTRATOR:{
            return [
              {
                Header: 'Type >><<',
                accessor: 'type',
                Cell: props =>{
                    let {type} = props.row.values
                    return ( <div style={{ position: "relative" }}>{type}</div> );
                }
              },
              {
                Header: 'Balance',
                accessor: 'balance',
                Cell: props => {
                  let {balance} = props.row.values
                  return ( <div style={{ position: "relative" }}>{balance}</div> );
                }
              },
              {
                Header: 'Bank',
                accessor: 'bank',
                Cell: props => {
                  let {bank} = props.row.values
                  return <div>{bank[0].bankName} {bank[0].bankNumber}</div>
                }
              },

              // 
              {
                Header: 'User Approve',
                accessor: 'userNameApprove',
                Cell: props => {
                  let {userNameApprove} = props.row.values
                  return <div>{userNameApprove} {userNameApprove}</div>
                }
              },
              {
                Header: 'Created at',
                accessor: 'createdAt',
                Cell: props => {
                    let {createdAt} = props.row.values
                    return <div>{createdAt}</div>
                }
              }
            ]
          }
    
          case AUTHENTICATED:{
            return [
              {
                Header: 'Type >><<',
                accessor: 'type',
                Cell: props =>{
                    let {type} = props.row.values
                    return ( <div style={{ position: "relative" }}>{type}</div> );
                }
              },
              {
                Header: 'Balance',
                accessor: 'balance',
                Cell: props => {
                  let {balance} = props.row.values
                  return ( <div style={{ position: "relative" }}>{balance}</div> );
                }
              },
              {
                Header: 'Bank',
                accessor: 'bank',
                Cell: props => {
                  let {bank} = props.row.values
                  return <div>{bank[0].bankName} {bank[0].bankNumber}</div>
                }
              },
              {
                Header: 'Created at',
                accessor: 'createdAt',
                Cell: props => {
                    let {createdAt} = props.row.values
                    return <div>{createdAt}</div>
                }
              }
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

  return (<div style={{flex:1}}>
         {
            transitionsValue.loading
            ? <CircularProgress /> 
            : <div>
                <Table
                  columns={columns}
                  data={transitionsValue.data.transitions.data}
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
                    // let newInput = _.find(depositsValue.data.deposits.data, (item)=>openDialogDelete.id == item._id.toString())

                    // newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                    // newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                    // onMutationDeposit({ variables: { input: newInput } });
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

export default connect( mapStateToProps, mapDispatchToProps )(TransitionsPage);