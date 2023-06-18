import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Stack,
  Box
} from '@mui/material';
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import DateObject from "react-date-object";
import InfiniteScroll from "react-infinite-scroll-component";
import { DeleteForever as DeleteForeverIcon, 
        Edit as EditIcon} from '@mui/icons-material';

import { queryDateLotterys } from "./gqlQuery"
import { getHeaders } from "./util"

const DateLotterysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  // const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  // const [pageIndex, setPageIndex] = useState(0);  
  // const [pageSize, setPageSize] = useState(pageOptions[0])
  const [dates, setDates] = useState([])
  const [dateLotterys, setDateLotterys] = useState([])
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(false)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });


  const { onMutationDatesLottery } = props

  const { loading: loadingDateLotterys, 
          data: dataDateLotterys, 
          error: errorDateLotterys       } =  useQuery(queryDateLotterys, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                              });

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

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  const handleDelete = (id) => {
    // onDeleteBank({ variables: { id } });
  };

  ///////////////////////
  /*
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
  */
  //////////////////////

  const fetchMoreData = async() =>{
    // let mores =  await fetchMoreUsers({ variables: { input: {...input, OFF_SET:input.OFF_SET + 1} } })
    // let {status, data} =  mores.data.users
    // console.log("status, data :", status, data)
   
    if(slice === total){
      // setHasMore(false);
    }else{
      setTimeout(() => {
        // let newDatas = [...datas, ...data]
        // setDatas(newDatas)
        // setSlice(newDatas.length);
      }, 1000); 
    }
  }

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
              {/* 
              <TableComp
                columns={columns}
                data={dateLotterys}
                fetchData={fetchData}
                rowsPerPage={pageOptions}
                updateMyData={updateMyData}
                skipReset={skipResetRef.current}
                isDebug={false}/> 
              */}
                  {
                    <InfiniteScroll
                      dataLength={slice}
                      next={fetchMoreData}
                      hasMore={hasMore}
                      loader={<h4>Loading...</h4>}>
                      { 
                      _.map(dateLotterys, (item, index) => {                       
                        let date         = item?.date;
                        // let avatar      = item.avatar;
                        // let displayName = item.displayName;
                        // let username    = item.username;
                        // let email       = item.email;
                        // let roles       = item.roles;
                        // let lastAccess  = item.lastAccess;

                        console.log("item :", item)

                        return <Stack direction="row" spacing={2} >
                                  <Box sx={{ width: '20%' }}> { (moment(date, 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm')} </Box>
                                  {/* 
                                  <Box sx={{ width: '8%' }}>
                                    <Avatar
                                      alt="Example avatar"
                                      variant="rounded"
                                      src={avatar?.url}
                                      // onClick={(e) => {
                                      //   // onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                      // }}
                                      sx={{ width: 56, height: 56 }}
                                    />
                                  </Box>
                                  <Box 
                                    sx={{ width: '8%' }}
                                    onClick={()=>{
                                      navigate({ pathname: `/p`, search: `?${createSearchParams({ id: _id })}` })
                                    }}>{displayName}</Box>
                                  <Box sx={{ width: '10%' }}>{username}</Box>
                                  <Box sx={{ width: '20%' }}>{email}</Box>
                                  <Box sx={{ width: '15%' }}> <RolesComp Ids={roles}/> </Box>
                                  <Box sx={{ width: '5%' }}>{ (moment(lastAccess, 'YYYY-MM-DD HH:mm')).format('DD MMM, YYYY HH:mm')}</Box>
                                  <Box sx={{ width: '20%' }}>
                                    <button onClick={(e)=>{ console.log("Force logout") }}><ExitToAppIcon />Force logout</button>
                                    <button onClick={()=>{ navigate("/user", {state: {from: "/", mode: "edit", id: _id}}) }}><EditIcon/>{t("edit")}</button>
                                    <button onClick={(e)=>{ setOpenDialogDelete({ isOpen: true, id: _id, description: displayName }) }}><DeleteForeverIcon/>{t("delete")}</button>
                                  </Box> 
                                  */}
                              </Stack>
                      })
                      }
                    </InfiniteScroll>
                  }
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
