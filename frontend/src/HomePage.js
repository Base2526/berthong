import React, { useEffect, useRef, useState } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import _ from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import { makeStyles } from "@material-ui/core/styles";
import { ErrorOutline as ErrorOutlineIcon } from "@material-ui/icons";
import { lightGreen, blueGrey } from "@material-ui/core/colors";

import { querySuppliers, subscriptionSuppliers} from "./gqlQuery";
import { getHeaders, showToast } from "./util";
import HomeItem from "./item/HomeItem"
import SearchComp from "./components/SearchComp"
import SkeletonComp from "./components/SkeletonComp"
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
const HomePage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastIdRef = useRef(null)
  const classes = useStyles();
  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  let [reset, setReset] = useState(false)

  const [slice, setSlice] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  let { user, logout, ws, search, onLogin, onSearchChange, onMutationFollow } = props

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          refetch: refetchSuppliers,
          subscribeToMore, 
          fetchMore: fetchMoreSuppliers,
          networkStatus } = useQuery(querySuppliers, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: { input: search },
                                        fetchPolicy: 'cache-first',
                                        nextFetchPolicy: 'network-only', 
                                        // fetchPolicy: 'cache-and-network', // cache all pages in the Apollo cache
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorSuppliers)){
    _.map(errorSuppliers?.graphQLErrors, (e)=>{
      switch(e?.extensions?.code){
        case Constants.FORCE_LOGOUT:{
          logout()
          break;
        }
      }
    })
  }

  useEffect(()=>{
    onSearchChange({...search, PAGE: 1 })
    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
      unsubscribeSuppliers = null;
    };
  }, [])

  useEffect(() => {
    if(!loadingSuppliers){
      if(!_.isEmpty(dataSuppliers?.suppliers)){
        let { status, total, data } = dataSuppliers?.suppliers
        if(status){
          let newDatas = _.unionBy(data, datas, '_id')
          newDatas = _.orderBy(newDatas, "createdAt", 'asc')
          setDatas(newDatas)
          setSlice(newDatas?.length)
          setTotal(total)
        }

        setLoading(false)
      }
    }
  }, [dataSuppliers, loadingSuppliers])

  useEffect(()=>{

    if( total != 0 && total == datas?.length){
      setHasMore(false);
    }

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
          
          switch(mutation){
            case "BOOK":
            case "UNBOOK":{
              let newData = _.map((prev.suppliers.data), (item)=> item._id == data._id ? data : item )
              let newPrev = {...prev.suppliers, data: newData}
              return {suppliers: newPrev}; 
            }
            case "AUTO_CLEAR_BOOK":{
              let newData = _.map((prev.suppliers.data), (item)=> item._id == data._id ? data : item )
              let newPrev = {...prev.suppliers, data: newData}
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
  }, [datas, total])

  useEffect(()=>{
    if(reset){
      setReset(false)
    }
  }, [search, reset])

  const handleRefresh = async() => {
    onSearchChange({...search, PAGE: 1})
  }

  const handleLoadMore = () => {
    fetchMoreSuppliers({
      variables: {
        input: {...search, PAGE: search.PAGE + 1}
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult?.suppliers?.data?.length) {
          return prev;
        }

        let suppliers = {...prev.suppliers, data: _.unionBy( fetchMoreResult?.suppliers?.data, prev?.suppliers?.data, '_id') }
        return Object.assign({}, prev, {suppliers} );
      },
    });

    onSearchChange({...search, PAGE: search.PAGE + 1})
  };

  const mainView = () =>{
    switch(ws?.ws_status){
      case Constants.WS_SHOULD_RETRY:{
        break;
      }
      case Constants.WS_CLOSED:{
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

      case Constants.WS_CONNECTED:{
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

    return  <div className="contrainer">
              <div style={{ paddingBottom: "1rem" }}>
                <SearchComp
                  {...props}
                  classes={classes}
                  search={search}
                  onReset={()=>setReset(true)}
                  onSearch={(search)=>onSearchChange(search)} />
              </div>
              {loading 
              ? <SkeletonComp />
              : <div className="row">
                  <div className="col-12 pb-2">
                  {
                    _.isEmpty(datas)
                    ? <div className="noData p-2 m-1"><ErrorOutlineIcon /> ไม่พบข้อมูลที่ค้นหา </div>
                    : <InfiniteScroll
                        dataLength={slice}
                        next={handleLoadMore}
                        hasMore={hasMore}
                        loader={<SkeletonComp />}
                        scrollThreshold={0.5}
                        scrollableTarget="scrollableDiv"
                        endMessage={<h1>You have reached the end</h1>}
                        
                        // below props only if you need pull down functionality
                        refreshFunction={handleRefresh}
                        pullDownToRefresh
                        pullDownToRefreshThreshold={50}
                        pullDownToRefreshContent={
                          <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                          <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                        }
                        >
                        <div className="row">
                          {_.map(datas, (item, index) =>{
                            return <HomeItem 
                                    {...props} 
                                    key={index} 
                                    index={index}
                                    item={item}
                                    search={search}
                                    onMutationFollow={(variables)=>_.isEmpty(user) ? onLogin(true) : onMutationFollow(variables) } />
                          } )}
                        </div>
                      </InfiniteScroll>
                    }
                  </div>
                </div>
                }
            </div>
  }

  return mainView()
}

export default HomePage;