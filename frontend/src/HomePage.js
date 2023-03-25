import React, { useEffect, useRef, useState } from "react";
import { NetworkStatus, useQuery, useMutation } from "@apollo/client";
import _ from "lodash";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import { makeStyles } from "@material-ui/core/styles";
import { ErrorOutline as ErrorOutlineIcon } from "@material-ui/icons";
import { lightGreen, blueGrey } from "@material-ui/core/colors";

import { querySuppliers, subscriptionSuppliers, mutationFollow, querySupplierById } from "./gqlQuery";
import { logout } from "./redux/actions/auth";
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

  let [search, setSearch] = useState(Constants.INIT_SEARCH)
  let [reset, setReset] = useState(false)

  const [slice, setSlice] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  let { user, logout, ws, onLogin } = props

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          refetch: refetchSuppliers,
          subscribeToMore, 
          fetchMore,
          networkStatus } = useQuery(querySuppliers, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {input: search},
                                        fetchPolicy: 'network-only',
                                        nextFetchPolicy: 'cache-first', 
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

  const [onMutationFollow, resultMutationFollowValue] = useMutation(mutationFollow,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {follow}}) => {

      let { data, mode, status } = follow
      if(status){

        switch(mode?.toUpperCase()){
          case "FOLLOW":{
            showToast("info", `FOLLOW`)
            break
          }
  
          case "UNFOLLOW":{
            showToast("info", `UNFOLLOW`)
            break
          }
        }

        let querySuppliersValue = cache.readQuery({ query: querySuppliers, variables: {input: search} });
        if(!_.isEmpty(querySuppliersValue)){
          let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data : item ) 
          cache.writeQuery({
            query: querySuppliers,
            variables: {input: search},
            data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
          });
        }

        let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: { id: data._id  } });
        if(!_.isEmpty(querySupplierByIdValue)){
          let newData = {...querySupplierByIdValue.supplierById}
          cache.writeQuery({
            query: querySupplierById,
            data: { supplierById: {...newData, data} },
            variables: { id: data._id }
          }); 
        }
      }
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (err) => {
      _.map(err?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case Constants.UNAUTHENTICATED:{
            showToast("error", e?.message)
            break;
          }
        }
      })
    }
  });

  
  useEffect(()=>{
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
          setDatas(data)
          setTotal(total)
        }

        setLoading(false)
      }
    }
  }, [dataSuppliers, loadingSuppliers])

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
  }, [datas])

  useEffect(()=>{
    if(!_.isEqual(Constants.INIT_SEARCH, search)){
      console.log("search :", search)
    }

    if(reset){
      setReset(false)
    }
  }, [search, reset])

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
                  onReset={()=>setReset(true)}
                  onSearch={(search)=>setSearch(search)} />
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
                        next={handleNext}
                        hasMore={hasMore}
                        loader={<SkeletonComp />}
                        scrollThreshold={0.5}
                        scrollableTarget="scrollableDiv"
                        endMessage={<h1>You have reached the end</h1>}>
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

const mapStateToProps = (state, ownProps) => {
  return { }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);