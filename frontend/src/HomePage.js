import React, { useEffect, useRef, useState } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import {
  ContentCopy as ContentCopyIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material"
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import _ from "lodash";
import Lightbox from "react-image-lightbox";
import { connect } from "react-redux";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from "react-share";
import { toast } from 'react-toastify';
import InfiniteScroll from "react-infinite-scroll-component";
import { makeStyles } from "@material-ui/core/styles";
import {
  ErrorOutline as ErrorOutlineIcon,
} from "@material-ui/icons";
// color
import { lightGreen, blueGrey } from "@material-ui/core/colors";

import { AMDINISTRATOR, AUTHENTICATED, FORCE_LOGOUT, WS_CLOSED, WS_CONNECTED, WS_SHOULD_RETRY } from "./constants";
import DialogLogin from "./DialogLogin";
import { querySuppliers, subscriptionSuppliers } from "./gqlQuery";
import ItemFollow from "./ItemFollow";
import ItemShare from "./ItemShare";
import { login, logout } from "./redux/actions/auth";
import { bookView, checkRole, getHeaders, sellView } from "./util";
import HomeItemPage from "./HomeItemPage"
import HomeSearchPage from "./HomeSearchPage"

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
  const [dialogLogin, setDialogLogin] = useState(false);
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  let [openMenuSetting, setOpenMenuSetting] = useState(null);
  let [openMenuShare, setOpenMenuShare] = useState(null);
  let [datas, setDatas] = useState([]);

  const [slice, setSlice] = useState(8);
  const [hasMore, setHasMore] = useState(true);
  const increment = 8;

  // const [number, setNumber] = useState();
  // const [title, setTitle] = useState();
  // const [detail, setDetail] = useState();
  // const [price, setPrice] = useState(500);
  // const [chkBon, setChkBon] = useState(true);
  // const [chkLang, setChkLang] = useState(true);
  // const [chkMoney, setChkMoney] = useState(true);
  // const [chkGold, setChkGold] = useState(true);
  // const [filteredList, setFilteredList] = useState([]);
  // const [noDataList, setNoDataList] = useState(null);
  // const searchForm = useRef(null);
  // const [totalSearch, setTotalSearch] = useState("");
  // const len = dataList.length;

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

  const handleNext = () => {
    if (slice === datas.length) {
      setHasMore(false);
      return;
    } else if (slice + increment > datas.length) {
      setSlice(datas.length);
      return;
    }
    // setTimeout(() => {
    //   setSlice(slice + increment);
    // }, 2000);
  };

  // const handleSliderChange = (event, newValue) => {
  //   setPrice(newValue);
  // };
  // const handleInputChange = (event) => {
  //   setPrice(event.target.value === "" ? "" : Number(event.target.value));
  // };
  // const [expanded, setExpanded] = useState(false);

  // const handleChange = (panel) => (event, isExpanded) => {
  //   console.log(panel);
  //   console.log(isExpanded);
  //   setExpanded(isExpanded ? panel : false);
  // };

  // const handleChk = (event) => {
  //   if (event.target.name === "chkBon") {
  //     console.log(event.target.checked);
  //     setChkBon(event.target.checked);
  //   } else if (event.target.name === "chkLang") {
  //     setChkLang(event.target.checked);
  //   } else if (event.target.name === "chkMoney") {
  //     setChkMoney(event.target.checked);
  //   } else if (event.target.name === "chkGold") {
  //     setChkGold(event.target.checked);
  //   }
  // };

  // const itemViewUI = () =>{
  //   // return  (filteredList[0] !== undefined ? filteredList : dataList)
  //   // .slice(0, slice)
  //   // .map((post, index) => <HomeItemPage key={index} post={post} />);
  // }

  const mainViewUI = () =>{
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

    return   loadingSuppliers
            ? <CircularProgress />
            : <div className="contrainer">
                <div style={{ paddingBottom: "1rem" }}>
                  <HomeSearchPage
                    classes={classes}
                    onSearch={(v)=>console.log("v :", v)} />
                </div>

                <div className="row">
                  <div className="col-12 pb-2">
                  {
                    _.isEmpty(datas)
                    ? <div className="noData p-2 m-1"><ErrorOutlineIcon /> ไม่พบข้อมูลที่ค้นหา </div>
                    : <InfiniteScroll
                        dataLength={slice}
                        next={handleNext}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}
                        // loader={
                        //   <div className="row">
                        //     <div className="col-md-6 col-lg-3">
                        //       <div
                        //         key={1}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3">
                        //       <div
                        //         key={2}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={3}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={4}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={5}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={6}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={7}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //     <div className="col-md-6 col-lg-3 pb-3">
                        //       <div
                        //         key={8}
                        //         className="skeleton card-custom card"
                        //         style={{ width: "100%" }}
                        //       >
                        //         <p className="image"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //         <p className="line"></p>
                        //       </div>
                        //     </div>
                        //   </div>
                        // }
                        scrollThreshold={0.5}
                        scrollableTarget="scrollableDiv"
                        endMessage={<h2>You have reached the end</h2>}>
                        <div className="row">
                          {_.map(datas, (item, index) =>{
                            return <HomeItemPage 
                                    {...props} 
                                    key={index} 
                                    index={index}
                                    item={item}
                                    onDialogLogin={()=>{
                                      setDialogLogin(true)
                                    }} />
                          } )}
                        </div>
                      </InfiniteScroll>
                    }
                  </div>
                </div>

                {dialogLogin && (
                  <DialogLogin
                    {...props}
                    open={dialogLogin}
                    onComplete={async(data)=>{
                      setDialogLogin(false);
                    }}
                    onClose={() => {
                      setDialogLogin(false);
                    }}
                  />
                )}
              </div>
  }

  /////////////////////////

  return mainViewUI()
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user, ws: state.ws }
};

const mapDispatchToProps = { login, logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);