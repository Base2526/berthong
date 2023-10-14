import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { LinearProgress } from "@mui/material";

import { ObjectView } from 'react-object-view'

import { queryDblog, mutationCheck_db } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"
import TableComp from "../components/TableComp"

import DialogComp from "../components/DialogComp"

const DblogPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex] = useState(0);  
  const [pageSize, setPageSize] = useState(pageOptions[0])
  const [datas, setDatas] = useState([])
  const [dateLotterys, setDateLotterys] = useState([])
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(false)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [data, setData] = useState("")
  let [openDialog, setOpenDialog] = useState(false)

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
        let { status, data: newData } = dataDblog.dblog
        if(status && !_.isEqual(datas, newData)){
          setDatas(_.sortBy(newData, "timestamp").reverse())
        }
      }
    }
  }, [dataDblog, loadingDblog])

  // This is a custom filter UI for selecting
  // a unique option from a list
  const SelectColumnFilter =({
    column: { filterValue, setFilter, preFilteredRows, id }
  }) => {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
      const options = new Set();
      preFilteredRows.forEach(row => {
        options.add(row.values[id]);
      });
      return [...options.values()];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
      <select
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  
  const columns = useMemo(
    () => [
        {
            Header: 'Level',
            accessor: 'level',
            Cell: props =>{
                let {level} = props.row.values 
                return <div>{ level }</div>
            },
            Filter: SelectColumnFilter,
            filter: "includes"
        },
        {
          Header: 'ข้อความ',
          accessor: "message",
          // maxWidth: 70,
          // minWidth: 50,
          // width: 60,
          Cell: props =>{
            let {message} = props.row.values 
            // try {
            //   return _.map(_.map(_.toPairs(JSON.parse(message)), d => _.fromPairs([d])), (v, k)=>{
            //     return <div>{ JSON.stringify(v) }</div>
            //   })
            // }catch (error) {
            //   return <div>{message}</div>
            // }
            try {
              return <ObjectView  data={JSON.parse(message)} />
            }catch (error) {
              return <div>{message}</div>
            }
          }
        },
        {
          Header: 'User',
          accessor: 'meta',
          Cell: props => {
            let {meta} = props.row.values 
            // console.log( "meta :", JSON.parse(meta?.username) )
            // return  <div>{meta?.username ? JSON.parse(meta?.username)?.displayName : ""}</div>

            return <ObjectView  data={meta} />
          }
        },
        {
          Header: 'Date',
          accessor: 'timestamp',
          Cell: props => {
            let {timestamp} = props.row.values 
            // let date = new Date(timestamp).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
            // return <div>{moment(date).format('DD MMM, YYYY h:mm:ss a')}</div>
            return <div>{(moment(new Date(timestamp), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}</div>
          },
          disableFilters:true
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
            { loadingDblog 
              ? <LinearProgress />
              : <>
                  <TableComp
                      columns={columns}
                      data={datas}
                      fetchData={fetchData}
                      rowsPerPage={pageOptions}
                      updateMyData={updateMyData}
                      skipReset={skipResetRef.current}
                      isDebug={false}/> 
                    { openDialog && <DialogComp open={openDialog} data={ data } onHandleClose={()=>setOpenDialog(false)}/> }
                </>
            }
          </div>)
}
export default DblogPage;
