import { NetworkStatus, useQuery } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Avatar from "@mui/material/Avatar";
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { connect } from "react-redux";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from "react-share";
import { toast } from 'react-toastify';

import { AMDINISTRATOR, AUTHENTICATED, FORCE_LOGOUT, WS_CLOSED, WS_CONNECTED, WS_SHOULD_RETRY } from "./constants";
import DialogLogin from "./DialogLogin";
import { querySuppliers, subscriptionSuppliers } from "./gqlQuery";
import ItemFollow from "./ItemFollow";
import ItemShare from "./ItemShare";
import { login, logout } from "./redux/actions/auth";
import { bookView, checkRole, getHeaders, sellView } from "./util";

let unsubscribeSuppliers = null;
const HomePage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastIdRef = useRef(null)
  const [dialogLogin, setDialogLogin] = useState(false);
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  let [openMenuSetting, setOpenMenuSetting] = useState(null);
  let [openMenuShare, setOpenMenuShare] = useState(null);
  let [datas, setDatas] = useState([]);

  let { user, logout, ws } = props

  const { loading: loadingSuppliers, 
          data: dataSuppliers, 
          error: errorSuppliers, 
          subscribeToMore, 
          networkStatus } = useQuery(querySuppliers, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );
  if(!_.isEmpty(errorSuppliers)){
    _.map(errorSuppliers?.graphQLErrors, (e)=>{
      switch(e?.extensions?.code){
        case FORCE_LOGOUT:{
          logout()
          break;
        }
      }
    })
  }
  
  useEffect(()=>{
    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
      unsubscribeSuppliers = null;
    };
  }, [])

  useEffect(() => {
    if(!loadingSuppliers){
      if(!_.isEmpty(dataSuppliers?.suppliers)){
        let { status, code, data } = dataSuppliers.suppliers
        if(status)setDatas(data)
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

  const managementView = () =>{
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return  <div><div onClick={()=>navigate("/me")}>AMDINISTRATOR : {user.displayName} - {user.email}</div></div>
      }

      case AUTHENTICATED:{
        return  <div className="itm">
                  <div>Balance : {user?.balance} [-{user?.balanceBook}]</div>
                  <div onClick={()=>navigate("/me")}>AUTHENTICATED : {user.displayName} - {user.email}</div>
                </div>
      }
      
      default:{
        return  <div>
                  <div>ANONYMOUS</div>
                  <div><button onClick={()=>setDialogLogin(true)}>Login</button></div>
                </div>
      }
    }
  }

  const menuShareView = (item, index) =>{
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

  const imageView = (val) =>{
    return (
      <div style={{ position: "relative" }}>
        <CardActionArea style={{ position: "relative", paddingBottom: "10px" }}>
          <Avatar
            sx={{ height: 100, width: 100 }}
            variant="rounded"
            alt="Example Alt"
            src={val.files[0].url}
            onClick={(e) => {
              setLightbox({ isOpen: true, photoIndex: 0, images:val.files })
            }}
          />
        </CardActionArea>
        <div style={{ position: "absolute", bottom: "5px", right: "5px", padding: "5px", backgroundColor: "#e1dede", color: "#919191"}}>
          {(_.filter(val.files, (v)=>v.url)).length}
        </div>
      </div>
    );
  }

  const mainView = () =>{
    switch(ws?.ws_status){
      case WS_SHOULD_RETRY: 
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

    return  loadingSuppliers
            ? <CircularProgress />
            : <div style={{flex:1}}>
                {managementView()}
                {
                  _.map(datas, (val, k)=>{
                    return  <div key={k} className="home-item" >
                              <img width={25} height={25} src={"https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/1176.jpg"} />
                              <div onClick={()=>{
                                // history.push({pathname: "/profile", search: `?u=${val.ownerId}` })
                                navigate({
                                  pathname: "/profile",
                                  search: `?${createSearchParams({ u: val.ownerId})}`
                                })
                              }}>Supplier : {val?.owner?.displayName}</div>
                              {menuShareView(val, k)}
                              {menuSettingView(val, k)}

                              {imageView(val)}

                              <div>ชื่อ :{val.title}, ราคา : {val.price}</div>
                              <div>จอง :{bookView(val)}</div>
                              <div>ขายไปแล้ว :{sellView(val)}</div>
                              <button onClick={(evt)=>{
                                navigate({
                                  pathname: "/p",
                                  search: `?${createSearchParams({ id: val._id})}`,
                                  state: { id: val._id }
                                })
                              }}>ดูรายละเอียด</button>

                              <div>
                                <ItemFollow 
                                  {...props} 
                                  item={val} 
                                  onDialogLogin={(e)=>{
                                    setDialogLogin(true)
                                  }}/>
                                <ItemShare 
                                  {...props}  
                                  onOpenMenuShare={(e)=>{
                                    setOpenMenuShare({ [k]: e.currentTarget });
                                  }}/>
                                <IconButton  onClick={(e) => { setOpenMenuSetting({ [k]: e.currentTarget }); }}>
                                  <MoreVertIcon />
                                </IconButton>
                              </div>
                            </div>
                  })
                }

                {dialogLogin && (
                  <DialogLogin
                    {...props}
                    open={dialogLogin}
                    onComplete={async(data)=>{
                      setDialogLogin(false);

                      // window.location.reload(false)
                    }}
                    onClose={() => {
                      setDialogLogin(false);
                    }}
                  />
                )}

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
              </div>
  }

  return mainView();
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user, ws: state.ws }
};

const mapDispatchToProps = { login, logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);