import { useMutation, useQuery } from "@apollo/client";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from '@mui/material/LinearProgress';
import _ from "lodash";
import moment from "moment";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { mutationWithdraw, queryBanks, queryWithdraws } from "./gqlQuery";
import { logout } from "./redux/actions/auth";
import { checkRole, getHeaders } from "./util";

import { AMDINISTRATOR } from "./constants";

import Table from "./TableContainer";

const WithdrawsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout } = props

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });


  const queryWithdrawsValue = useQuery(queryWithdraws, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true });

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
    context: { headers: getHeaders(location) },
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
            return  <div className="Btn--posts">
                      <button onClick={(evt)=>{
                        // history.push({ 
                        //   pathname: "/withdraw", 
                        //   state: {from: "/", mode: "edit", id: _id } 
                        // });
                        navigate("/withdraw", { state: {from: "/", mode: "edit", id: _id } })
                      }}><EditIcon/>{t("edit")}</button>
                      <button onClick={(e)=>{
                        setOpenDialogDelete({ isOpen: true, id: _id, description });
                      }}><DeleteForeverIcon/>{t("delete")}</button>
                  </div>
          }
          case "approved":{
            return  <div className="Btn--posts">
                      <button onClick={(e)=>{
                        setOpenDialogDelete({ isOpen: true, id: _id, description });
                      }}><DeleteForeverIcon/>{t("delete")}</button>
                  </div>
          }
          case "reject":{
            return  <div className="Btn--posts">
                      <button onClick={(evt)=>{
                        // history.push({ 
                        //   pathname: "/withdraw", 
                        //   state: {from: "/", mode: "edit", id: _id } 
                        // });

                        navigate("/withdraw", {state: {from: "/", mode: "edit", id: _id }})
                      }}><EditIcon/>{t("edit")}</button>
                      <button onClick={(e)=>{
                        setOpenDialogDelete({ isOpen: true, id: _id, description });
                      }}><DeleteForeverIcon/>{t("delete")}</button>
                  </div>
          }

          default:{
            return <div />
          }
        }   
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
                  {
                  checkRole(user) !== AMDINISTRATOR 
                  ? <button 
                      onClick={()=>{ 
                        // history.push({ 
                        //   pathname: "/withdraw",  
                        //   state: {from: "/", mode: "new"}  
                        // });

                        navigate("/withdraw", { state: {from: "/", mode: "new"} })
                      }}>เพิ่ม แจ้งถอดเงิน</button> 
                  : ""
                  }
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