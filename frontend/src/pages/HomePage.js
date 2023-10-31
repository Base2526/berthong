import React, { useEffect, useRef, useState, useMemo } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import { ErrorOutline as ErrorOutlineIcon } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { FaAngleUp } from 'react-icons/fa';
import { IoReloadCircle } from 'react-icons/io5'
import { IconButton } from "@material-ui/core"

import { querySuppliers, subscriptionSuppliers } from "../apollo/gqlQuery";
import { handlerErrorApollo,  getHeaders } from "../util";
import HomeItem from "../item/HomeItem"
import SearchComp from "../components/SearchComp"
import SkeletonComp from "../components/SkeletonComp"
import * as Constants from "../constants"
import { homeStyles } from "../styles"

let unsubscribeSuppliers = null;
const HomePage = (props) => {
  let location = useLocation();
  let toastIdRef = useRef(null)
  let classes = homeStyles();
  let { t } = useTranslation();

  let [datas, setDatas]       = useState([]);
  let [total, setTotal]       = useState(0);
  let [loading, setLoading]   = useState(true);
  let [slice, setSlice]       = useState(12);
  let [hasMore, setHasMore]   = useState(true);
  let [scrollPosition, setScrollPosition] = useState(0);
  let [isSearch, setIsSearch] = useState(false);
  let [search, setSearch] = useState( _.isNull(localStorage.getItem('SEARCH')) ? Constants.INIT_SEARCH : JSON.parse(localStorage.getItem('SEARCH')) );

  let { user, ws, onLogin, onMutationFollow } = props

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          refetch: refetchSuppliers,
          subscribeToMore, 
          fetchMore: fetchMoreSuppliers,
          networkStatus } = useQuery(querySuppliers, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'cache-first',
                                        nextFetchPolicy: 'network-only', 
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorSuppliers)){
    handlerErrorApollo( props, errorSuppliers )
  }

  const handleScroll = () => {
    setScrollPosition(window.scrollY);
  };

  useEffect(()=>{
    refetchSuppliers({ input: search })

    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
      unsubscribeSuppliers = null;

      window.removeEventListener('scroll', handleScroll);
    }
  }, [])

  useEffect(() => {
    if(!loadingSuppliers){
      if(!_.isEmpty(dataSuppliers?.suppliers)){
        let { status, total, data } = dataSuppliers?.suppliers
        if(status){
          setDatas(data)
          setSlice(data?.length)
          setTotal(total)

          if(data?.length === total)setHasMore(false)
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
              let newData = _.map((prev.suppliers.data), (item)=> item._id === data._id ? data : item )
              let newPrev = {...prev.suppliers, data: newData}
              return {suppliers: newPrev}; 
            }
            case "AUTO_CLEAR_BOOK":{
              let newData = _.map((prev.suppliers.data), (item)=> item._id === data._id ? data : item )
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
    if(isSearch){
      setLoading(true)
      
      fetchMoreSuppliers({
        variables: { input: { ...search, PAGE: 1 } },
        updateQuery: (prev, {fetchMoreResult, variables}) => {
          setIsSearch(false)
          setLoading(false)

          if (!fetchMoreResult?.suppliers?.data?.length) {
            setDatas([])
            setSlice(0)
            setTotal(0)
            return fetchMoreResult?.suppliers
          }
          
          let { status, total, data } = fetchMoreResult?.suppliers
          if(status){
            setDatas(data)
            setSlice(data?.length)
            setTotal(total)
          }
          return fetchMoreResult?.suppliers
        },
      });
    }
  }, [ isSearch ])

  const scrollToTop = () => {
    window?.scrollTo(0, 0);
  }

  const findFirstPage = () =>{
    return Math.min.apply(Math, _.map(datas, (o) => { return o.PAGE; }))
  }

  const handlePulldownToLoadMore = async() => {
    if(search.PAGE > 1){
      if( _.find(datas, (v)=>v.PAGE === findFirstPage() - 1) === undefined){
        fetchMoreSuppliers({
          variables: { input: {...search, PAGE: search.PAGE - 1} },
          updateQuery: (prev, {fetchMoreResult, variables}) => {
            if (!fetchMoreResult?.suppliers?.data?.length) {
                return prev;
            }
            let { input } = variables

            search = { ...search, PAGE: input.PAGE }
            setSearch(search)
            localStorage.setItem('SEARCH', JSON.stringify(search));

            let suppliers = {...prev.suppliers, data: [...fetchMoreResult?.suppliers?.data, ...prev?.suppliers?.data] }
            return Object.assign({}, prev, {suppliers} );
          },
        });
      }
    }
  }

  const handleLoadMore = () => {
    if( _.find(datas, (v)=>v.PAGE === search.PAGE + 1) === undefined){
      fetchMoreSuppliers({
        variables: { input: {...search, PAGE: search.PAGE + 1} },
        updateQuery: (prev, {fetchMoreResult, variables}) => {
          let { input } = variables
          let {status, data, total} = fetchMoreResult?.suppliers

          if (!data?.length) {
            if( input.PAGE * input.LIMIT > total ) setHasMore(false) 

            return prev;
          }
  
          search = { ...search, PAGE: input.PAGE }
          setSearch(search)
          localStorage.setItem('SEARCH', JSON.stringify(search));

          if(status){
            let suppliers = {...prev.suppliers, data: [ ...prev?.suppliers?.data, ...data ] }

            if( input.PAGE * input.LIMIT > total ) setHasMore(false) 
            return Object.assign({}, prev, {suppliers} );
          }
          return prev;
        },
      });
    }else{
      console.log('')
    }
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
      default: 
        break;
    }
    
    switch(networkStatus){
      case NetworkStatus.error:{
        return <div>Network not stable 🤯🤯🤯🤯🤯</div>
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
                  onReset={()=>{
                    setSearch(Constants.INIT_SEARCH)
                    localStorage.setItem('SEARCH', JSON.stringify(Constants.INIT_SEARCH));

                    setLoading(true)
                    fetchMoreSuppliers({
                      variables: { input: Constants.INIT_SEARCH },
                      updateQuery: (prev, {fetchMoreResult, variables}) => {
                        setLoading(false)
                        if (!fetchMoreResult?.suppliers?.data?.length) {
                            return prev;
                        }
                        return fetchMoreResult?.suppliers;
                      },
                    });
                  }}
                  onSearch={(search)=>
                  {
                    setIsSearch(true)

                    setSearch(search)
                    localStorage.setItem('SEARCH', JSON.stringify(search));
                  }} />
              </div>
              {
                 useMemo(() => { 
                    return <div> {t("all_result")} : {total} </div>
                 }, [ total ])
              }
              {
                search.PAGE > 1
                ? <div> 
                    <IconButton onClick={(evt)=>handlePulldownToLoadMore() }>
                      <IoReloadCircle />
                    </IconButton>
                    { `Current page : ${ search.PAGE }/${ datas?.length }` } 
                  </div>
                : ""
              }
              {loading 
              ? <SkeletonComp />
              : <div className="row">
                  <div className="col-12 pb-2">
                  {
                    _.isEmpty(datas)
                    ? <div className="noData p-2 m-1"><ErrorOutlineIcon />{t("empty_data")}</div>
                    : <InfiniteScroll
                        dataLength={slice}
                        next={handleLoadMore}
                        hasMore={hasMore}
                        loader={<SkeletonComp />}
                        scrollThreshold={0.5}
                        // scrollableTarget="scrollableDiv"
                        endMessage={<div className="text-center">{t("end_message")}</div>}
                        
                        // below props only if you need pull down functionality
                        refreshFunction={()=>handlePulldownToLoadMore()}
                        pullDownToRefresh
                        pullDownToRefreshThreshold={50}
                        pullDownToRefreshContent={
                          <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                          <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                        }>
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
                  <div>
                    {
                      scrollPosition > 400 
                      ? <IconButton 
                          className="btn-position-top"
                          onClick={(evt)=>scrollToTop()}>
                          <FaAngleUp />
                        </IconButton>
                      : "" 
                    }
                  </div>
                </div>
                }
            </div>
  }

  return mainView()
}

export default HomePage;