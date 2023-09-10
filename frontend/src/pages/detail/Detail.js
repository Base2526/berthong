import "./detail.css";
import "./seat.css";
import "./wallet.css";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import queryString from 'query-string';
import { useQuery, useMutation } from "@apollo/client";
import _ from "lodash"
import {
  LinearProgress,
  Menu,
  MenuItem} from "@mui/material"
import {
    ContentCopy as ContentCopyIcon,
    BugReport as BugReportIcon,
    Bookmark as BookmarkIcon
  } from "@mui/icons-material"
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from "react-share";
import deepdash from "deepdash";

import DetailPanelRight from "./DetailPanelRight"
import DetailPanelLeft from "./DetailPanelLeft"
import PopupCart from "./PopupCart";
import PopupWallet from "./PopupWallet";
import { getHeaders, showToast, handlerErrorApollo } from "../../util";

import {  querySupplierById, 
          querySuppliers,
          subscriptionSupplierById, 
          mutationBuy,
          queryBookBuyTransitions
        } from "../../gqlQuery";

import * as Constants from "../../constants"

deepdash(_);

let unsubscribeSupplierById = null;
const Detail = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
   
  const [isPopupOpenedWallet, setPopupOpenedWallet] = useState(false);
  const [isPopupOpenedShoppingBag, setPopupOpenedShoppingBag] = useState(false);

  let params = queryString.parse(location.search)

  let { id } = params; 

  let { user, onLogin, onMutationFollow, onMutationBook, updateProfile } = props

  const [onMutationBuy, resultMutationBuy] = useMutation(mutationBuy,{
    refetchQueries: [queryBookBuyTransitions],
    context: { headers: getHeaders(location) },
    update: (cache, {data: {buy}}) => {
      let { status, transitionId, data:newData, user } = buy
      if(status){
        updateProfile(user)

        let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: { id: newData._id } });
        if(status && querySupplierByIdValue){
          cache.writeQuery({
            query: querySupplierById,
            data: { supplierById: {...querySupplierByIdValue.supplierById, data: newData} },
            variables: { id: newData._id }
          })
        }  

        ////////// update cache querySuppliers ///////////
        let suppliersValue = cache.readQuery({ query: querySuppliers });
        if(!_.isNull(suppliersValue)){
          let { suppliers } = suppliersValue
          let suppliersData = _.map(suppliers.data, (supplier) => supplier._id == newData._id ? newData : supplier)
          cache.writeQuery({
            query: querySuppliers,
            data: { suppliers: { ...suppliersValue.suppliers, data: suppliersData } }
          });
        }
        ////////// update cache querySuppliers ///////////

        ////////// update cache BookBuyTransitions /////////////
        let queryBookBuyTransitionsValue = cache.readQuery({ query: queryBookBuyTransitions });
        if(status && queryBookBuyTransitionsValue){       
          let newTransitions =  _.map(queryBookBuyTransitionsValue.bookBuyTransitions.data, (item)=>{
                                  if(item._id == transitionId){
                                    return  {...item, status: Constants.APPROVED, supplier: newData}
                                  }
                                  return item
                                })

          cache.writeQuery({
            query: queryBookBuyTransitions,
            data: { bookBuyTransitions: { ...queryBookBuyTransitionsValue.bookBuyTransitions, data: newTransitions } },
          });
        }  
        ////////// update cache BookBuyTransitions /////////////
      }          
    },
    onCompleted(data) {
      setPopupOpenedShoppingBag(false)
      showToast("success", `การส่งซื้อ complete`)
    },
    onError: (error) => {
      console.log("onError :", error)

      showToast("error", `เกิดปัญหาในการสั่งซื้อ`)

      return handlerErrorApollo( props, error )
    }
  });

  const { loading: loadingSupplierById, 
          data: dataSupplierById, 
          error: errorSupplierById, 
          refetch: refetchSupplierById,
          subscribeToMore: subscribeToMoreSupplierById, 
          networkStatus } = useQuery( querySupplierById, { 
                                      context: { headers: getHeaders(location) }, 
                                      fetchPolicy: 'cache-first', 
                                      nextFetchPolicy: 'network-only', 
                                      notifyOnNetworkStatusChange: true});

  useEffect(() => {
    if(!loadingSupplierById){
      if(!_.isEmpty(dataSupplierById?.supplierById)){
        let { status, data: newData } = dataSupplierById?.supplierById
        if(status){
          if(newData === undefined) {
            // Goto home page, when cannot find data by id.
            navigate("/")
          }else if(!_.isEqual(newData, data)) setData(newData)
        } 
      }
    }
  }, [dataSupplierById, loadingSupplierById])

  useEffect(()=>{
    if(_.isEmpty(data)) refetchSupplierById({id}) 

    unsubscribeSupplierById && unsubscribeSupplierById()
    unsubscribeSupplierById = null;

    unsubscribeSupplierById =  subscribeToMoreSupplierById({
      document: subscriptionSupplierById,
      variables: { id },
      updateQuery: (prev, {subscriptionData}) => {
        if (!subscriptionData.data) return prev;

        let { mutation, data } = subscriptionData.data.subscriptionSupplierById;
        switch(mutation){
          case "BOOK":
          case "UNBOOK":{
            let newPrev = {...prev.supplierById, data}

            return {supplierById: newPrev}; 
          }

          case "AUTO_CLEAR_BOOK":{
            let newPrev = {...prev.supplierById, data}
            return {supplierById: newPrev}; 
          }

          default:
            return prev;
        }
      }
    });
  }, [id])

  const onSelected = (evt, itemId) =>{
    if(_.isEmpty(user)){
      onLogin(true);
      return;
    } 
    onMutationBook({ variables: { input: { id, itemId } } });
  }

  const menuView = (item) =>{
    return  <Menu
              anchorEl={openMenu}
              keepMounted
              open={openMenu}
              onClose={(e)=>setOpenMenu(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              MenuListProps={{ "aria-labelledby": "lock-button", role: "listbox" }}>
              <MenuItem onClose={(e)=>setOpenMenu(null)}>
                  <FacebookShareButton
                    url={ window.location.href + "detail/"}
                    quote={item?.title}
                    // hashtag={"#hashtag"}
                    description={item?.description}
                    className="Demo__some-network__share-button"
                    onClick={(e)=>setOpenMenu(null)} >
                    <FacebookIcon size={32} round /> Facebook
                  </FacebookShareButton>
              </MenuItem>{" "}
  
              <MenuItem onClose={(e)=>setOpenMenu(null)}>
                <TwitterShareButton
                  title={item?.title}
                  url={ window.location.origin + "/detail/"  }
                  // hashtags={["hashtag1", "hashtag2"]}
                  onClick={(e)=>setOpenMenu(null)} >
                  <TwitterIcon size={32} round />
                  Twitter
                </TwitterShareButton>
              </MenuItem>
  
              <MenuItem 
              onClick={async(e)=>{
                let href = window.location.href

                'clipboard' in navigator 
                ? await navigator.clipboard.writeText(href) 
                : document.execCommand('copy', true, href)
                
                showToast("info", `Copy link`)
                setOpenMenu(null)
              }}>
                
              <ContentCopyIcon size={32} round /> Copy link
              </MenuItem>
            </Menu>
  }

  return (
    <div className="row">
      { isPopupOpenedShoppingBag && <PopupCart {...props} onMutationBuy={(evt)=>onMutationBuy(evt)} opened={isPopupOpenedShoppingBag} data={data} onClose={() => setPopupOpenedShoppingBag(false) } /> }
      { isPopupOpenedWallet  && <PopupWallet {...props} data={data} opened={isPopupOpenedWallet} onClose={() => setPopupOpenedWallet(false) } /> }

      {
        loadingSupplierById || _.isEmpty(data)
        ? <LinearProgress />
        : <>
            <DetailPanelLeft {...props} data={data}/>
            <DetailPanelRight 
              {...props}
              data={data}
              onMutationBook={(evt)=> _.isEmpty(user) ?  onLogin(true) : onMutationBook(evt)}
              onFollow={(evt)=> _.isEmpty(user) ? onLogin(true) : onMutationFollow(evt)}
              onPopupWallet={(evt)=> _.isEmpty(user) ? onLogin(true) : setPopupOpenedWallet(evt) }
              onPopupShopping={(evt)=> _.isEmpty(user) ? onLogin(true) : setPopupOpenedShoppingBag(evt) }
              onMenu={(evt)=>setOpenMenu(evt)}/>
            {menuView(data)}
          </>
      }
    </div>
  )
}

export default Detail;
