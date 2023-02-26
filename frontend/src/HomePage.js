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

import InfiniteScroll from "react-infinite-scroll-component";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  Input,
  Typography,
  Slider,
  TextField
} from "@material-ui/core";
import {
  ErrorOutline as ErrorOutlineIcon,
  ExpandMore as ExpandMoreIcon
} from "@material-ui/icons";
// color
import { lightGreen, blueGrey } from "@material-ui/core/colors";
import Box from "@mui/joy/Box";
import Checkbox, { checkboxClasses } from "@mui/joy/Checkbox";

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

const dataList = [
  {
    id: 1,
    title: "ทองคำมูลค่า 1 สลึง",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "gold",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "12-Jan-2023",
    link: "",
    picture:
      "https://www.dailynews.co.th/wp-content/uploads/2022/04/%E0%B8%97%E0%B8%B3%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B9%E0%B9%89%E0%B8%88%E0%B8%B1%E0%B8%81-%E0%B8%97%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%B3-99.99_-%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B0%E0%B9%84%E0%B8%A3-%E0%B8%AA%E0%B8%B2%E0%B8%A1%E0%B8%B2%E0%B8%A3%E0%B8%96%E0%B8%97%E0%B8%B3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%82.jpg",
    avatar:
      "data:image/png;base64,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"
  },
  {
    id: 2,
    title: "เงินจำนวน 5000 บาท",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "lang",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "10-Jan-2023",
    link: "",
    picture:
      "https://www.finnomena.com/wp-content/uploads/2019/09/closeup-thai-baht-american-us-dollar-57609684.jpg",
    avatar: ""
  },
  {
    id: 3,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "lang",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 4,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 5,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 6,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 7,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "lang",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 8,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 9,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 10,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 11,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 12,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 13,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 14,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 15,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 16,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 17,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 18,
    title: "dddd",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 19,
    title: "cccc",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  },
  {
    id: 20,
    title: "Title",
    detail:
      "Card has minimum height set but will expand if more space is needed for card body content.",
    type: "bon",
    category: "money",
    price: 100,
    view: 1000,
    createBy: "admin",
    createDate: "",
    link: "",
    picture: "",
    avatar: ""
  }
];

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
    if (slice === dataList.length) {
      setHasMore(false);
      return;
    } else if (slice + increment > dataList.length) {
      setSlice(dataList.length);
      return;
    }
    setTimeout(() => {
      setSlice(slice + increment);
    }, 2000);
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

    return  <div className="contrainer">
              <div style={{ paddingBottom: "1rem" }}>
                <HomeSearchPage
                  classes={classes}
                  onSearch={(v)=>console.log("v :", v)} />
              </div>

              <div className="row">
                <div className="col-12 pb-2">
                {
                  _.isEmpty(dataList)
                  ? <div className="noData p-2 m-1"><ErrorOutlineIcon /> ไม่พบข้อมูลที่ค้นหา </div>
                  : <InfiniteScroll
                      dataLength={slice}
                      next={handleNext}
                      hasMore={hasMore}
                      loader={
                        <div className="row">
                          <div class="col-md-6 col-lg-3">
                            <div
                              key={1}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3">
                            <div
                              key={2}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={3}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={4}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={5}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={6}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={7}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-3 pb-3">
                            <div
                              key={8}
                              className="skeleton card-custom card"
                              style={{ width: "100%" }}
                            >
                              <p className="image"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                              <p className="line"></p>
                            </div>
                          </div>
                        </div>
                      }
                      scrollThreshold={0.5}
                      scrollableTarget="scrollableDiv"
                      endMessage={<h2>You have reached the end</h2>}>
                      <div className="row">
                        {_.map(dataList, (item, index) =>{
                          return <HomeItemPage {...props} key={index} item={item} />
                        } )}
                      </div>
                    </InfiniteScroll>
                  }
                </div>
              </div>
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