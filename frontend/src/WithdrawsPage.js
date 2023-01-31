import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { getHeaders, checkRole } from "./util"
import { queryWithdraws, queryBanks, mutationWithdraw } from "./gqlQuery"
import { logout } from "./redux/actions/auth"

import { AMDINISTRATOR } from "./constants"

import ReadMoreMaster from "./ReadMoreMaster"
import Table from "./TableContainer"

const WithdrawsPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let { user, logout } = props

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });


  const queryWithdrawsValue = useQuery(queryWithdraws, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true });

  console.log("queryWithdrawsValue :", queryWithdrawsValue)

  /*
  mode: WithdrawModeType
    _id: ID
    bankId: ID!
    balance: Int!
  */
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

  const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
    context: { headers: getHeaders() },
    update: (cache, {data: {withdraw}}) => {
      let { data, mode, status } = withdraw

      if(status){
        switch(mode){
          case "delete":{
            let data1 = cache.readQuery({ query: queryWithdraws });
            let dataFilter =_.filter(data1.withdraws.data, (item)=>data._id != item._id)

            cache.writeQuery({
              query: queryWithdraws,
              data: { withdraws: {...data1.withdraws, data: dataFilter} }
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
  console.log("resultMutationWithdraw :", resultMutationWithdraw)

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

          let valueBanks = useQuery(queryBanks, { notifyOnNetworkStatusChange: true, });
          if(valueBanks.loading){
            return <LinearProgress /> 
          }
          let find = _.find(valueBanks.data.banks.data, (item)=>item._id.toString() == bank[0].bankId.toString() )            
          return <div style={{ position: "relative" }}>{bank[0].bankNumber} : {find.name}</div>
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
                        pathname: "/withdraw", 
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
              queryWithdrawsValue.loading
              ? <CircularProgress /> 
              : <div>
                  <button onClick={()=>{ 
                    history.push({ 
                      pathname: "/withdraw", 
                      state: {from: "/", mode: "new"} 
                    });
                  }}>เพิ่ม แจ้งถอดเงิน</button>
                  <Table
                    columns={columns}
                    data={queryWithdrawsValue.data.withdraws.data}
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
                    let newInput = _.find(queryWithdrawsValue.data.withdraws.data, (item)=>openDialogDelete.id == item._id.toString())

                    newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                    newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                    console.log("newInput :", newInput)
                    onMutationWithdraw({ variables: { input: newInput } });
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
export default connect( mapStateToProps, mapDispatchToProps )(WithdrawsPage);