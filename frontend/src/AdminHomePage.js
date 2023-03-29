import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import _ from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
// color
import { lightGreen, blueGrey } from "@material-ui/core/colors";
import {
  Stack,
  IconButton,
  CircularProgress
} from "@mui/material"
import {
  FiRefreshCcw
} from "react-icons/fi"
import { queryAdminHome } from "./gqlQuery";
import { getHeaders, showToast } from "./util";
import * as Constants from "./constants"

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    transform: "rotate(0deg)",
    backgroundColor: "rgb(245, 240, 237)",
    "& .Mui-expanded": {
      backgroundColor: "rgb(245, 240, 237)",
      "& .MuiFilledInput-input": {
        backgroundColor: "rgb(248, 250, 252)"
        // backgroundColor: "rgb(250, 241, 232)"
      }
    }
  },
  accordion: {
    minHeight: 150, //ugly but works
    height: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  details: {
    alignItems: "center",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 4
  },
  column: {
    flexBasis: "33.33%"
  },
  helper: {
    padding: theme.spacing(1, 2)
  },
  containedLightGreen: {
    color: theme.palette.getContrastText(lightGreen[500]),
    backgroundColor: lightGreen[500],
    "&:hover": {
      backgroundColor: lightGreen[700],
      "@media (hover: none)": {
        backgroundColor: lightGreen[500]
      }
    }
  },
  containedBlueGrey: {
    color: theme.palette.getContrastText(blueGrey[500]),
    backgroundColor: blueGrey[500],
    "&:hover": {
      backgroundColor: blueGrey[700],
      "@media (hover: none)": {
        backgroundColor: blueGrey[500]
      }
    }
  }
}));

let unsubscribeSuppliers = null;
const AdminHomePage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastIdRef = useRef(null)
  const classes = useStyles();
  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  let [search, setSearch] = useState(Constants.INIT_SEARCH)
  let [reset, setReset] = useState(false)

  const [slice, setSlice] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  let { logout, ws, onLogin } = props

  const { loading: loadingAdminHome, 
          data: dataAdminHome, 
          error: errorAdminHome, 
          refetch: refetchAdminHome,
          subscribeToMore: subscribeToMoreAdminHome, 
          networkStatus: networkStatusAdminHome } = useQuery(queryAdminHome, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'cache-first', // Used for first execution
                                        nextFetchPolicy: 'network-only', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  
  if(!_.isEmpty(errorAdminHome)){
    _.map(errorAdminHome?.graphQLErrors, (e)=>{
      switch(e?.extensions?.code){
        case Constants.UNAUTHENTICATED:{
          showToast("error", e.message)
          break;
        }
        default:{
          console.log("error :",  e.message)
        }
      }
    })
  }
  
  /*
  useEffect(()=>{
    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
      unsubscribeSuppliers = null;
    };
  }, [])
  */

  useEffect(() => {
    if(!loadingAdminHome){
      if(!_.isEmpty(dataAdminHome?.adminHome)){
        let { status, data } = dataAdminHome?.adminHome
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataAdminHome, loadingAdminHome])

  /*
  useEffect(()=>{
    let supplierIds = JSON.stringify(_.map(datas, _.property("_id")));
    unsubscribeSuppliers && unsubscribeSuppliers()
    unsubscribeSuppliers = null;

    unsubscribeSuppliers =  subscribeToMore({
      document: subscriptionSuppliers,
      variables: { supplierIds },
      updateQuery: (prev, {subscriptionData}) => {        
        try{
          if (!subscriptionData.data) return prev;

          let { mutation, data } = subscriptionData.data.subscriptionSuppliers;

          console.log("mutation, data :", mutation, data)
          switch(mutation){
            case "BOOK":
            case "UNBOOK":{
              let newData = _.map((prev.suppliers.data), (item)=> item._id == data._id ? data : item )
              let newPrev = {...prev.suppliers, data: newData}

              setDatas(newData)

              return {suppliers: newPrev}; 
            }
            case "AUTO_CLEAR_BOOK":{
              let newData = _.map((prev.suppliers.data), (item)=> item._id == data._id ? data : item )
              let newPrev = {...prev.suppliers, data: newData}

              setDatas(newData)

              return {suppliers: newPrev}; 
            }
            default:
              return prev;
          }
        }catch(err){
          console.log("err :", err)
        }
      }
    });
  }, [datas])

  useEffect(()=>{
    if(!_.isEqual(Constants.INIT_SEARCH, search)){
      console.log("search :", search)
    }

    if(reset){
      setReset(false)
    }
  }, [search, reset])
  */

  /////////////////////////
  // const handleSearch = (v) => {
  //   const oldList = [...dataList];
  //   const filteredAll = oldList.filter((data) => {
  //     if (title !== "" && title !== undefined) {
  //       if (!data.title.includes(title)) return false;
  //     }
  //     if (detail !== "" && detail !== undefined) {
  //       if (!data.detail.includes(detail)) return false;
  //     }
  //     if (Number(price) > 0) {
  //       if (Number(data.price) > Number(price)) return false;
  //     }
  //     if (!(chkBon === true && chkLang === true)) {
  //       if (chkLang) {
  //         if (!"lang".includes(data.type)) return false;
  //       }
  //       if (chkBon) {
  //         if (!"bon".includes(data.type)) return false;
  //       }
  //     }
  //     if (!(chkMoney === true && chkGold === true)) {
  //       if (chkMoney) {
  //         if (!"money".includes(data.category)) return false;
  //       }
  //       if (chkGold) {
  //         if (!"gold".includes(data.category)) return false;
  //       }
  //     }
  //     return true;
  //   });
  //   if (filteredAll[0] === undefined || filteredAll[0] === null) {
  //     setNoDataList([{ text: "no data" }]);
  //     setTotalSearch(0);
  //   } else {
  //     setFilteredList(filteredAll);
  //     setNoDataList(null);
  //     setTotalSearch(filteredAll.length);
  //   }
  // };

  /*
  const handleNext = async() => {
    let mores =  await fetchMore({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
    let {status, data} =  mores.data.suppliers
    console.log("status, data :", status, data)

    if(slice === total){
      setHasMore(false);
    }else{
      setTimeout(() => {
        let newDatas = [...datas, ...data]
        setDatas(newDatas)
        setSlice(newDatas.length);
      }, 1000); 
    }
  }
  */

  const mainView = () =>{
    /*
    switch(ws?.ws_status){
      case WS_SHOULD_RETRY:{
        break;
      }
      case WS_CLOSED:{
        if(_.isNull(toastIdRef.current)){
          toastIdRef.current =  toast.promise(
            new Promise(resolve => setTimeout(resolve, 300000)),
            {
              pending: 'Network not stable 🤯',
              // success: 'Promise resolved 👌',
              // error: 'Promise rejected 🤯'
            }
          );
        }
        break;
      }

      case WS_CONNECTED:{
        if(!_.isNull(toastIdRef.current)){
          toast.dismiss()
        }
        break;
      }
    }
    
    switch(networkStatus){
      case NetworkStatus.error:{
        return <div>Network not stable 🤯</div>
      }

      case NetworkStatus.refetch:{
        break;
      }

      case NetworkStatus.loading:{
        break;
      }

      case NetworkStatus.poll:{
        console.log("poll")
        break;
      }
    }
    */

    return  _.map(datas, (item, index)=>{
              switch(index){
                case 0:{
                  return <div className="card-admin" onClick={(evt)=>navigate("/deposits")}>{item.title} - {item.data?.length}</div>
                }

                case 1:{
                  return <div className="card-admin" onClick={(evt)=>navigate("/withdraws")}>{item.title} - {item.data?.length}</div>
                }

                case 2:{
                  return <div className="card-admin" onClick={(evt)=>navigate("/suppliers")}>{item.title} - {item.data?.length}</div>
                }

                case 3:{
                  return <div className="card-admin" onClick={(evt)=>navigate("/users")}>{item.title} - {item.data?.length}</div>
                }
              }
            })
  }

  return  <div className="contrainer">
            <Stack
              alignItems="flex-start">
              <IconButton 
                size="small"
                onClick={(evt)=>refetchAdminHome()}><FiRefreshCcw size="0.9em"/></IconButton>
            </Stack>

            {
              loadingAdminHome
              ? <CircularProgress />
              : <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 2, md: 4 }}>
                  {mainView()}
                </Stack>
            }
            
          </div>
}

export default AdminHomePage;