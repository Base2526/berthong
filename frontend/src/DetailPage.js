import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CircularProgress from '@mui/material/CircularProgress';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { FacebookIcon, TwitterIcon } from "react-share";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import queryString from 'query-string';
import moment from "moment";

import { login } from "./redux/actions/auth"
import { getHeaders, bookView, sellView, showToast } from "./util"
import { querySupplierById, gqlBook, gqlBuy, subscriptionSupplierById, querySuppliers } from "./gqlQuery"
import DialogLogin from "./DialogLogin"
import DialogBuy from "./DialogBuy"
import ItemFollow from "./ItemFollow"
import ItemShare from "./ItemShare";

let unsubscribeSupplierById = null;

const DetailPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let client = useApolloClient();
  let { t } = useTranslation();

  let [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  let [datas, setDatas] = useState([])
  let [dialogLogin, setDialogLogin] = useState(false);
  let [dialogBuy, setDialogBuy] = useState(false);
  let [openMenuSetting, setOpenMenuSetting] = useState(null);
  let [openMenuShare, setOpenMenuShare] = useState(null);
  
  let params = queryString.parse(location.search)

  let { id } = params; //location.state
  let { user } = props

  let [datasSupplierById, setDatasSupplierById] = useState([]);

  const [onBook, resultBookValues] = useMutation(gqlBook,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {book}}) => {
      let { status, data } = book
      let supplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      if(status && supplierByIdValue){
        cache.writeQuery({ query: querySupplierById, data: { supplierById: { data } }, variables: { id: data._id } }); 
      }

       ////////// update cache querySuppliers ///////////
       let suppliersValue = cache.readQuery({ query: querySuppliers });
       if(!_.isNull(suppliersValue)){
        let { suppliers } = suppliersValue
        let newData = _.map(suppliers.data, (supplier) => supplier._id == data._id ? data : supplier)
        cache.writeQuery({
          query: querySuppliers,
          data: { suppliers: {...suppliersValue.suppliers, data: newData} }
        });
       }
 
       ////////// update cache querySuppliers ///////////
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

  const [onBuy, resultBuyValues] = useMutation(gqlBuy,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {buy}}) => {
      let { status, data } = buy
         
      ////////// update cache queryUserById ///////////
      let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      if(querySupplierByIdValue){
        cache.writeQuery({
          query: querySupplierById,
          data: { supplierById: {...querySupplierByIdValue.supplierById, data} },
          variables: {id: data._id}
        });
      }
      ////////// update cache queryUserById ///////////    

      ////////// update cache querySuppliers ///////////
      let suppliersValue = cache.readQuery({ query: querySuppliers });
      if(!_.isNull(suppliersValue)){
        console.log("suppliersValue :", suppliersValue)
      }
      ////////// update cache querySuppliers ///////////
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

  const { loading:loadingSupplierById, 
          data: dataSupplierById, 
          error: errorSupplierById, 
          subscribeToMore, 
          networkStatus } = useQuery( querySupplierById, { 
                                      context: { headers: getHeaders(location) }, 
                                      variables: { id }, 
                                      fetchPolicy: 'network-only', 
                                      notifyOnNetworkStatusChange: true});

  useEffect(()=>{
    let newDatas = []
    for (let i = 0; i < 100; i++) {
      newDatas = [...newDatas, {id: i, title:  i > 9 ? "" + i: "0" + i, selected: -1}]
    }
    setDatas(newDatas)

    return () => {
      unsubscribeSupplierById && unsubscribeSupplierById()
      unsubscribeSupplierById = null;
    };
  }, [])

  useEffect(() => {
    if (dataSupplierById) {
      let { status, data } = dataSupplierById.supplierById
      if(status){
        setDatasSupplierById(data)
      }
    }
  }, [dataSupplierById])

  if(loadingSupplierById){
    return <div><CircularProgress /></div>
  }else{
    if(_.isEmpty(datasSupplierById)){
      return;
    }

    // let {subscribeToMore, networkStatus} = querySupplierByIdValue

    // unsubscribeSupplierById && unsubscribeSupplierById()
    if(_.isNull(unsubscribeSupplierById)){
      unsubscribeSupplierById =  subscribeToMore({
        document: subscriptionSupplierById,
        variables: { supplierById: id },
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
              console.log("AUTO_CLEAR_BOOK :", user, newPrev)
              return {supplierById: newPrev}; 
            }
  
            default:
              return prev;
          }
        }
      });
    }
  }

  // let {status, data} = querySupplierByIdValue.data.supplierById

  const onSelected = (evt, itemId) =>{
    let fn = _.find(datasSupplierById.buys, (buy)=>buy.itemId == itemId)

    let selected = 0;
    if(fn){
      selected = fn.selected == -1 ? 0 : -1
    }

    if(selected == 0){
      let check = user?.balance - (user?.balanceBook + datasSupplierById.price)
      if(check < 0){
        showToast("error", `ยอดเงินคงเหลือไม่สามารถจองได้`)

        return;
      }
    }

    let newDatas =  _.map(datas, (itm, k)=>itemId == k ? {...itm, selected }: itm)
    setDatas(newDatas)

    selected ==0 
    ? showToast("success", `จองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
    : showToast("error", `ยกเลิกการจองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)

    onBook({ variables: { input: { supplierId: id, itemId, selected } } });
  }

  const selected = () =>{
    let fn = _.filter(datasSupplierById.buys, (buy)=>buy.userId == user._id && buy.selected == 0 ).map((curr)=> `${curr.itemId}`).toString()

    if(_.isEmpty(fn)){
      return <div></div>
    }
    return  <div className="div-buy">
              <div>รายการเลือก : {fn}</div>
              <button onClick={()=>{
                // onBuy({ variables: { id } })
                setDialogBuy(true)
              }}>BUY ({_.filter(datasSupplierById.buys, (buy)=>buy.userId == user._id && buy.selected == 0 ).length})</button>
            </div>;
  }

  const isDisabled = (fn) =>{
    if(!_.isEmpty(fn)){
      if(fn.userId == user._id){
        return false
      }

      if(fn?.selected == 0 || fn?.selected == 1 ){
        return true
      }
    }
    return false
  }

  const imageView = () =>{

    // console.log("imageView :", data)
    return (
      <div style={{ position: "relative" }}>
        <CardActionArea style={{ position: "relative", paddingBottom: "10px" }}>
          <Avatar
            sx={{ height: 100, width: 100 }}
            variant="rounded"
            alt="Example Alt"
            src={datasSupplierById?.files[0].url}
            onClick={(e) => {
              setLightbox({ isOpen: true, photoIndex: 0, images: datasSupplierById?.files })
            }}
          />
        </CardActionArea>
        <div style={{ position: "absolute", bottom: "5px", right: "5px", padding: "5px", backgroundColor: "#e1dede", color: "#919191"}}>
          {(_.filter(datasSupplierById?.files, (v)=>v.url)).length}
        </div>
      </div>
    );
  }

  const menuShareView = (item, index) =>{
    // console.log("menuShareView :", item)
    return  <Menu
              anchorEl={openMenuShare && openMenuShare[index]}
              keepMounted
              open={openMenuShare && Boolean(openMenuShare[index])}
              onClose={(e)=>setOpenMenuShare(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              MenuListProps={{ "aria-labelledby": "lock-button", role: "listbox" }}>
              <MenuItem onClose={(e)=>setOpenMenuShare(null)}>
                  <FacebookShareButton
                    url={ window.location.href + "detail/"}
                    quote={item?.title}
                    // hashtag={"#hashtag"}
                    description={item?.description}
                    className="Demo__some-network__share-button"
                    onClick={(e)=>setOpenMenuShare(null)} >
                    <FacebookIcon size={32} round /> Facebook
                  </FacebookShareButton>
              </MenuItem>{" "}

              <MenuItem onClose={(e)=>setOpenMenuShare(null)}>
                <TwitterShareButton
                  title={item?.title}
                  url={ window.location.origin + "/detail/"  }
                  // hashtags={["hashtag1", "hashtag2"]}
                  onClick={(e)=>setOpenMenuShare(null)} >
                  <TwitterIcon size={32} round />
                  Twitter
                </TwitterShareButton>
              </MenuItem>

              <MenuItem 
              onClick={async(e)=>{
                let text = window.location.href + "p/?id=" + item._id
                if ('clipboard' in navigator) {
                  await navigator.clipboard.writeText(text);
                } else {
                  document.execCommand('copy', true, text);
                }

                setOpenMenuShare(null)
              }}>
                
              <ContentCopyIcon size={32} round /> Copy link
              </MenuItem>
            </Menu>
  }

  const menuSettingView = (item, index) =>{
    return  <Menu
              anchorEl={openMenuSetting && openMenuSetting[index]}
              keepMounted
              open={openMenuSetting && Boolean(openMenuSetting[index])}
              onClose={()=>{ setOpenMenuSetting(null) }}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox"
              }}
            >
              <MenuItem onClick={(e)=>{setOpenMenuSetting(null)}}>Report</MenuItem>
            </Menu>
  }

  return (<div style={{flex:1}}>

            {_.isEmpty(user) ? "" : <div className="itm">{user.displayName} - {user.email} : Balance : { user?.balance } [-{user?.balanceBook}] </div>}
            

            <div className="itm">
              <div>ชื่อ :{datasSupplierById.title},  ราคา : {datasSupplierById?.price}</div>
              <div>จอง :{bookView(datasSupplierById)}</div>
              <div>ขายไปแล้ว :{sellView(datasSupplierById)}</div>
            </div>
           
            {menuShareView(datasSupplierById, 1)}
            {menuSettingView(datasSupplierById, 1)}
            {imageView()}
            <ToastContainer />
            <div>
              <ItemFollow 
                {...props} 
                item={datasSupplierById} 
                onDialogLogin={(e)=>{
                  setDialogLogin(true)
                }}/>
              <ItemShare 
                {...props}  
                onOpenMenuShare={(e)=>{
                  setOpenMenuShare({ [1]: e.currentTarget });
                }}/>
              <IconButton  onClick={(e) => { setOpenMenuSetting({ [1]: e.currentTarget }) }}>
                <MoreVertIcon />
              </IconButton>
            </div>

            <div>{selected()}</div>
            <div className="container">  
            {
              _.map(datas, (val, key)=>{
             
                let fn = _.find(datasSupplierById.buys, (buy)=>buy.itemId == key)

                let cn = ""
                if(!_.isEmpty(fn)){
                  cn = fn.selected == 0 ? "itm-green" : fn.selected == 1 ? "itm-gold" : ""
                }
                
                return  <div className={`itm  ${cn}`} key={key}> 
                          <button 
                          disabled={isDisabled(fn)}
                          // disabled={ !_.isEmpty(fn) && (fn?.selected == 0 || fn?.selected == 1 )? true : false }
                          onClick={(evt)=>{
                            if(_.isEmpty(user)){
                              setDialogLogin(true)
                            }else{
                              onSelected(evt, key)
                            }
                          }}>{val.title}</button>
                        </div>  
              })
            }
            </div>  
            {dialogLogin && (
              <DialogLogin
                {...props}
                open={dialogLogin}
                onComplete={async(data)=>{ setDialogLogin(false) }}
                onClose={() => { setDialogLogin(false) }}
              />
            )}

            {
              dialogBuy && (
                <DialogBuy 
                  {...props}
                  data={datasSupplierById} 
                  onBuy={()=>{
                    onBuy({ variables: { id } })
                    setDialogBuy(false)
                  }}
                  onClose={()=>setDialogBuy(false)} />
              )
            }
            {lightbox.isOpen && (
              <Lightbox
                mainSrc={lightbox.images[lightbox.photoIndex].url}
                nextSrc={lightbox.images[(lightbox.photoIndex + 1) % lightbox.images.length].url}
                prevSrc={
                  lightbox.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length].url
                }
                onCloseRequest={() => {
                  setLightbox({ ...lightbox, isOpen: false });
                }}
                onMovePrevRequest={() => {
                  setLightbox({
                    ...lightbox,
                    photoIndex:
                      (lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length
                  });
                }}
                onMoveNextRequest={() => {
                  setLightbox({
                    ...lightbox,
                    photoIndex: (lightbox.photoIndex + 1) % lightbox.images.length
                  });
                }}
              />
            )}
          </div>);
}

const mapStateToProps = (state, ownProps) => {

  console.log("mapStateToProps : ", state.auth.user)
  return {user: state.auth.user}
};

const mapDispatchToProps = { login }

export default connect( mapStateToProps, mapDispatchToProps )(DetailPage);