import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation, createSearchParams} from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  CircularProgress,
  SpeedDial,
  SpeedDialIcon,
  Stack
} from '@mui/material';
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import DateObject from "react-date-object";

import { DeleteForever as DeleteForeverIcon, 
        Edit as EditIcon} from '@mui/icons-material';

import { queryDateLotterys, mutationDatesLottery } from "./gqlQuery"
import TableComp from "./components/TableComp"
import { getHeaders, checkRole, showToast } from "./util"

const DateLotterysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])
  const [dates, setDates] = useState([])
  const [dateLotterys, setDateLotterys] = useState([])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingDateLotterys, 
          data: dataDateLotterys, 
          error: errorDateLotterys       } =  useQuery(queryDateLotterys, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'network-only', // Used for first execution
                                                nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                notifyOnNetworkStatusChange: false,
                                              });

  const [onMutationDatesLottery, resultMutationDatesLotteryValues] = useMutation(mutationDatesLottery
    , {
        update: (cache, {data: {datesLottery}}) => {

          // console.log("datesLottery :", datesLottery)
          
          // ////////// udpate cache Banks ///////////
          // let queryDateLotterysValue = cache.readQuery({ query: queryDateLotterys });
          // let { status, mode, data } = dateLottery
          // if(status && queryDateLotterysValue){
          //   switch(mode){
          //     case "new":{
          //       cache.writeQuery({
          //         query: queryDateLotterys,
          //         data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: [...queryDateLotterysValue.dateLotterys.data, data]} },
          //       });
          //       break;
          //     }

          //     case "edit":{
          //       let newData = _.map(queryDateLotterysValue.dateLotterys.data, (item)=>item._id.toString() == data._id.toString() ?  data : item ) 
          //       cache.writeQuery({
          //         query: queryDateLotterys,
          //         data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: newData} },
          //       });
          //       break;
          //     }
          //   }
          // }
          // ////////// udpate cache Banks ///////////
        

          // ////////// update cache queryDateLotteryById ///////////
          // let dateLotteryByIdValue = cache.readQuery({ query: queryDateLotteryById, variables: {id: data._id}});
          // if(status && dateLotteryByIdValue){
          //   cache.writeQuery({
          //     query: queryDateLotteryById,
          //     data: { dateLotteryById: {...dateLotteryByIdValue.dateLotteryById, data} },
          //     variables: {id: data._id}
          //   });
          // }
          // ////////// update cache queryDateLotteryById ///////////

        },
        onCompleted({ data }) {
          // history.goBack();
          // navigate(-1);
        },
        onError(error){
          // console.log("error :", error)
        }
      }
  );

  useEffect(() => {
    if(!loadingDateLotterys){
      if(!_.isEmpty(dataDateLotterys?.dateLotterys)){
        let { status, data } = dataDateLotterys.dateLotterys

        if(status){
          if(!_.isEqual(dateLotterys, data)) setDateLotterys(data)
          
          let newDates = _.map(data, (i)=>i.date)
          if(!_.isEqual(newDates, dates)) setDates( newDates )
        }
      }
    }
  }, [dataDateLotterys, loadingDateLotterys])

  // const [onDeleteBank, resultDeleteBank] = useMutation(gqlDeleteBank, 
  //   {
  //     update: (cache, {data: {deleteBank}}) => {
  //       const data1 = cache.readQuery({
  //         query: gqlBanks,
  //       });

  //       let newBanks = {...data1.banks}
  //       let newData   = _.filter(data1.banks.data, bank => bank._id !== deleteBank._id)
  //       newBanks = {...newBanks, total: newData.length, data:newData }

  //       cache.writeQuery({
  //         query: gqlBanks,
  //         data: { banks: newBanks },
  //       });
  //     },
  //     onCompleted({ data }) {
  //       history.push("/banks");
  //     }
  //   }
  // );
  // console.log("resultDeleteBank :", resultDeleteBank)

  ///////////////
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex)
  })
  ///////////////

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  const handleDelete = (id) => {
    // onDeleteBank({ variables: { id } });
  };

  ///////////////////////
  const columns = useMemo(
    () => [
        
        {
          Header: 'Date',
          accessor: 'date',
          Cell: props =>{
            let {date} = props.row.original 
            date = new Date(date).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
            return <div>งวดวันที่ { (moment(date, 'MM/DD/YYYY')).format('DD MMM, YYYY')}</div>
          }
        },
        {
          Header: 'จำนวน Suppliers',
          accessor: "suppliers",
          Cell: props =>{
            let {suppliers} = props.row.values 
            // let ids = _.map(suppliers, (s)=>s?._id)
            // return <div>{ids.join(", ")} - ( {suppliers.length} )</div>


            return <div><ul>{_.map(suppliers, (value)=><li className="MuiListItem-root" key={ value?._id } onClick={()=>{
              navigate({
              pathname: "/d",
              search: `?${createSearchParams({ id: value._id})}`,
              state: { id: value._id }
            })
          }}>{value.title}</li>) }</ul></div>
          }
        },
        {
          Header: 'Description',
          accessor: 'description',
          Cell: props => {
            return (
              <div>
                <Typography
                  variant="body1"
                  gutterBottom
                  dangerouslySetInnerHTML={{
                    __html: props.row.original.description
                  }}
                />
              </div>
            );
          }
        },
        {
          Header: 'Action',
          Cell: props => {
            // console.log("Cell :", props)

            let {_id, name} = props.row.original
            return  <Stack direction="row" spacing={2}>
                      <button onClick={()=>{
                        navigate("/date-lottery", { state: {from: "/", mode: "edit", _id} })
                      }}><EditIcon/>{t("edit")}</button>
                      <button onClick={(e)=>{
                        // setOpenDialogDelete({ isOpen: true, id: _id, description: name })
                      }}><DeleteForeverIcon/>{t("delete")}</button>
                    </Stack>
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
    skipResetRef.current = true
  }
  //////////////////////

  return (
    <div className="user-list-container">
      {
        loadingDateLotterys
        ?  <div><CircularProgress /></div> 
        :  <div>
              <DatePicker
                value={dates}
                onChange={setDates}
                format="MMMM DD YYYY"
                sort
                plugins={[
                  <DatePanel />
                ]}/>
              <button disabled={_.isEmpty(dates) ? true : false} onClick={()=>{
                let newInput =  _.map(dates, (date)=> (date instanceof DateObject) ?  date.toDate() : date)
                onMutationDatesLottery({ variables: { input: newInput } })
              }}>Update</button>
              <TableComp
                columns={columns}
                data={dateLotterys}
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
            <DialogContentText id="alert-dialog-description">{openDialogDelete.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <button
              variant="outlined"
              onClick={() => {
                handleDelete(openDialogDelete.id);

                setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</button>
            <button variant="contained" onClick={handleClose} autoFocus>{t("close")}</button>
          </DialogActions>
        </Dialog>
      )}

      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClick={(e)=>{
          // history.push({ 
          //   pathname: "/date-lottery", 
          //   state: {from: "/", mode: "new"} 
          // });
          navigate("/date-lottery", { state: {from: "/", mode: "new"}})
        }}
      />
    </div>
  );
};

export default DateLotterysPage;
