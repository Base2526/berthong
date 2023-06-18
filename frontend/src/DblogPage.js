import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

import { queryDblog } from "./gqlQuery"
import { getHeaders } from "./util"
import TableComp from "./components/TableComp"

const DblogPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])
  const [dates, setDates] = useState([])
  const [dateLotterys, setDateLotterys] = useState([])
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(false)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });


  const { loading: loadingDblog, 
          data: dataDblog, 
          error: errorDblog  } =  useQuery( queryDblog, {
                                                context: { headers: getHeaders(location) },
                                                fetchPolicy: 'cache-first', 
                                                nextFetchPolicy: 'network-only', 
                                                notifyOnNetworkStatusChange: false,
                                            });

  useEffect(() => {
    if(!loadingDblog){
      if(!_.isEmpty(dataDblog?.dblog)){
        let { status, data } = dataDblog.dblog
        if(status){
          setDates(data)
        }
      }
    }
  }, [dataDblog, loadingDblog])

//   const handleClose = () => {
//     setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
//   };

//   const handleDelete = (id) => {
//     // onDeleteBank({ variables: { id } });
//   };

  ///////////////////////
  
  /*
  level
: 
"error"
message
  */
    const columns = useMemo(
    () => [
        {
            Header: 'Level',
            accessor: 'level',
            Cell: props =>{
                let {level} = props.row.values 
                return <div>{ level }</div>
                // let {date} = props.row.original 
                // date = new Date(date).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                // return <div>งวดวันที่ { (moment(date, 'MM/DD/YYYY')).format('DD MMM, YYYY')}</div>
            }
        },
        {
          Header: 'ข้อความ',
          accessor: "message",
          Cell: props =>{
            let {message} = props.row.values 
            return <div>{ message }</div>
          }
        },
        {
          Header: 'User',
          Cell: props => {
            return  <div>admin</div>
          }
        },
        {
          Header: 'Date',
          accessor: 'timestamp',
          Cell: props => {
            let {timestamp} = props.row.values 
            let date = new Date(timestamp).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
            return <div>{moment(date).format('DD MMM, YYYY h:mm:ss a')}</div>
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

    const fetchData = useCallback(({ pageSize, pageIndex }) => {
        setPageSize(pageSize)
        setPageIndex(pageIndex)
    })

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

    return (<div className="dblog-list-container">
                <TableComp
                    columns={columns}
                    data={dates}
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}/> 
            </div>)
}
export default DblogPage;
