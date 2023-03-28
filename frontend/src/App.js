import React, { useState, useCallback, useEffect, useRef } from "react";
import { useApolloClient, useQuery, useMutation, useSubscription } from "@apollo/client";
import { connect } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { CDBSidebar } from "cdbreact";
import clsx from "clsx";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import {
  ListItemText,
  ListItemIcon,
  ListItem as MuiListItem,
  List,
  Divider,
  Typography,
  Toolbar,
  AppBar,
  CssBaseline,
  Drawer
} from "@material-ui/core";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon
} from "@material-ui/icons";
import {
  AccountTree as AccountTreeIcon,
  AddRoad as AddRoadIcon,
  Adjust as AdjustIcon,
  AlternateEmail as AlternateEmailIcon,
  AllOut as AllOutIcon,
  Assistant as AssistantIcon,
  Login as LoginIcon
} from '@mui/icons-material';

import {
  BiWalletAlt as AccountBalanceWalletIcon,
} from 'react-icons/bi';

import {
  FiLogOut as LogoutIcon,
} from 'react-icons/fi';

import {
  HiOutlineHome as HomeIcon,
} from 'react-icons/hi';

import {
  MdCircleNotifications as MdCircleNotificationsIcon,
} from 'react-icons/md';

import {
  FiShoppingCart
} from "react-icons/fi"

import {
  AiOutlineHistory
} from "react-icons/ai"

import {
  Avatar,
  IconButton,
  ClickAwayListener,
  Stack,
  Badge
} from "@mui/material";
import _ from "lodash"

import TaxonomyBankPage from "./TaxonomyBankPage";
import TaxonomyBanksPage from "./TaxonomyBanksPage";
import MeBookBuysPage from "./MeBookBuysPage";
import DateLotteryPage from "./DateLotteryPage";
import DateLotterysPage from "./DateLotterysPage";
import DepositPage from "./DepositPage";
import DepositsPage from "./DepositsPage";
import DetailPage from "./pages/detail/Detail";
import { queryPing, subscriptionMe } from "./gqlQuery";
import HistoryTransitionsPage from "./HistoryTransitionsPage";
import HomePage from "./HomePage";
import AdminHomePage from "./AdminHomePage";
import LoginPage from "./LoginPage";
import MePage from "./MePage";
import BankPage from "./BankPage";
import BanksPage from "./BanksPage";
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth";
import SupplierPage from "./SupplierPage";
import ProfilePage from "./ProfilePage";
import SuppliersPage from "./SuppliersPage";
import UserPage from "./UserPage";
import UsersPage from "./UsersPage";
import { checkRole, getHeaders, numberCurrency, showToast} from "./util";
import WithdrawPage from "./WithdrawPage";
import WithdrawsPage from "./WithdrawsPage";
import BreadcsComp from "./components/BreadcsComp";
import DialogLogoutComp from "./components/DialogLogoutComp";
import NotificationsPage from "./NotificationsPage";

import LightboxComp from "./components/LightboxComp"
import DialogLoginComp from "./components/DialogLoginComp"

import { queryNotifications, mutationFollow, querySuppliers, querySupplierById, mutationBook } from "./gqlQuery"
import * as Constants from "./constants"
import { update_profile as updateProfile, logout } from "./redux/actions/auth";

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex"
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
}));

const ListItem = withStyles({
  root: {
    "&$selected": {
      backgroundColor: "red",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "blue"
      }
    },
    "&$selected:hover": {
      backgroundColor: "purple",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "white"
      }
    },
    "&:hover": {
      backgroundColor: "blue",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "white"
      }
    }
  },
  selected: {}
})(MuiListItem);

const App =(props) =>{
  const client = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  let intervalPing = useRef(null);

  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openDialogLogout, setOpenDialogLogout] = useState(false);
  const [dialogLogin, setDialogLogin] = useState(false);
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });

  let [notifications, setNotifications] =useState([])

  let [search, setSearch] = useState(Constants.INIT_SEARCH)

  let { ws, user, updateProfile, editedUserBalace, editedUserBalaceBook } = props

  const { loading: loadingNotifications, 
          data: dataNotifications, 
          error: errorNotifications,
          refetch: refetchNotifications, } =  useQuery( queryNotifications, { 
                                              context: { headers: getHeaders(location) }, 
                                              fetchPolicy: 'cache-first', 
                                              nextFetchPolicy: 'network-only', 
                                              notifyOnNetworkStatusChange: true});

  const [onMutationFollow, resultMutationFollow] = useMutation(mutationFollow,{
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
          cache.writeQuery({
            query: querySupplierById,
            data: { supplierById: {...querySupplierByIdValue.supplierById, data} },
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

  const [onMutationBook, resultMutationBook] = useMutation(mutationBook,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {book}}) => {
      let { status, action, data } = book

      let {mode, itemId} = action
      switch(mode?.toUpperCase()){
        case "BOOK":{
          showToast("success", `จองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
          break
        }

        case "UNBOOK":{
          showToast("error", `ยกเลิกการจองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
          break
        }
      }
      
      let supplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      if(status && supplierByIdValue){
        cache.writeQuery({ 
          query: querySupplierById, 
          variables: { id: data._id },
          data: { supplierById: { ...supplierByIdValue.supplierById, data } }, 
        }); 
      }

      ////////// update cache querySuppliers ///////////
      let suppliersValue = cache.readQuery({ query: querySuppliers });
      if(!_.isNull(suppliersValue)){
        let { suppliers } = suppliersValue
        let newData = _.map(suppliers.data, (supplier) => supplier._id == data._id ? data : supplier)
        cache.writeQuery({
          query: querySuppliers,
          data: { suppliers: { ...suppliersValue.suppliers, data: newData } }
        });
      }
      ////////// update cache querySuppliers ///////////
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (error) => {
      _.map(error?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case Constants.FORCE_LOGOUT:{
            // logout()
            break;
          }
          case Constants.DATA_NOT_FOUND:
          case Constants.UNAUTHENTICATED:
          case Constants.ERROR:{
            showToast("error", e?.message)
            break;
          }
        }
      })
    }
  });

  useEffect(()=>{
    if(!_.isEmpty(user)){
      refetchNotifications();
    }
  }, [user])

  useEffect(() => {
    if (!loadingNotifications) {
      if(dataNotifications?.notifications){
        let { status, data } = dataNotifications?.notifications
        if(status){
          setNotifications(data)
        }
      }
    }
  }, [dataNotifications, loadingNotifications])
  // console.log("ws :", location)
  
  /////////////////////// ping ///////////////////////////////////
  // const pingValues =useQuery(queryPing, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true});

  useSubscription(subscriptionMe, {
    onSubscriptionData: useCallback((res) => {
      console.log("subscriptionMe :", res)
      if(!res.subscriptionData.loading){
        let { mutation, data } = res.subscriptionData.data.subscriptionMe

        switch(mutation){
          case "DEPOSIT":
          case "WITHDRAW":
          case "BUY":{
            editedUserBalace(data)
            break;
          }

          case "BOOK":{
            editedUserBalaceBook(data)
            break;
          }

          case "UPDATE":{
            updateProfile(data)
            break;
          }
        }
      }
    }, []),
    onError: useCallback((err) => {
      console.log("subscriptionMe :", err)
    }, []),
    variables: {sessionId: localStorage.getItem('token')},
  });
 
  const ProtectedAuthenticatedRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:
      case Constants.AUTHENTICATED:{
        return <Outlet />;
      }
      default:{
        return <Navigate to={redirectPath} replace />;
      }
    }
  };

  const ProtectedAdministratorRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:{
        return <Outlet />;
      }
      default:{
        return <Navigate to={redirectPath} replace />;
      }
    }
  };

  const statusView = () =>{
    switch(ws?.ws_status){
      // case Constants.WS_CONNECTED :{
      //   return <div />
      // }
      case Constants.WS_CONNECTION :
      case Constants.WS_SHOULD_RETRY: {
        return <div className="ws">server กำลังทำการเชื่อมต่อ <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      }

      case Constants.WS_CLOSED:{
        return <div className="ws">server มีปัญหา <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      }

      default:{
        return <div /> 
      }
    }
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuList = () =>{
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em"/>, path: "/"},
                {id: 1, title:"รายการถอดเงิน รออนุมัติทั้งหมด", icon: <AccountTreeIcon />, path: "/withdraws"},
                {id: 2, title:"รายการฝากเงิน รออนุมัติทั้งหมด", icon: <AddRoadIcon />, path: "/deposits"},
                {id: 3, title:"รายการสินค้าทั้งหมด", icon: <AdjustIcon />, path: "/suppliers"},
                {id: 4, title:"รายชื่อบุคคลทั้งหมด", icon: <AlternateEmailIcon />, path: "/users"},
                {id: 5, title:"รายชื่อธนาคารทั้งหมด", icon: <AllOutIcon />, path: "/taxonomy-banks"},
                {id: 6, title:"วันออกหวยทั้งหมด", icon: <AssistantIcon />, path: "/date-lotterys"},
                {id: 7, title:"รายการ บัญชีธนาคาร", icon: <AccountBalanceWalletIcon size="1.5em" />, path: "/banks"},
                {id: 8, title:"Logout", icon: <LogoutIcon size="1.5em"/>, path: "/logout"}]
      }
      case Constants.AUTHENTICATED:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"รายการ สินค้า", icon: <AssistantIcon />, path: "/suppliers"},
                {id: 2, title:"แจ้งฝากเงิน", icon: <AdjustIcon />, path: "/deposit"},
                {id: 3, title:"แจ้งถอนเงิน", icon: <AlternateEmailIcon />, path: "/withdraw"},
                {id: 4, title:"ประวัติการ ฝาก-ถอน", icon: <AiOutlineHistory size="1.5em" />, path: "/history-transitions"},
                {id: 5, title:"รายการ บัญชีธนาคาร", icon: <AccountBalanceWalletIcon />, path: "/banks"},
                {id: 6, title:"Logout", icon: <LogoutIcon  size="1.5em"/>, path: "/logout"}]
      }
      default:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"Login", icon: <LoginIcon />, path: "/login"}]
      }
    }
  }

  return (
    <div className="App">
      {lightbox.isOpen  && <LightboxComp lightbox={lightbox} onLightbox={(v)=>setLightbox(v)}/> }
      <ToastContainer />
      {
        openDialogLogout 
        && <DialogLogoutComp {...props} open={openDialogLogout} onClose={()=>setOpenDialogLogout(false)}/>
      }

      {
        dialogLogin 
        && <DialogLoginComp   
            {...props}
            open={dialogLogin}
            onComplete={async(data)=>{
              setDialogLogin(false);
            }}
            onClose={() => {
              setDialogLogin(false);
            }}/>
      }
      
      {statusView()}
      <div className="container-fluid">
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open
            })}>
            <Toolbar>
              {
                // _.isEqual(checkRole(user), Constants.AMDINISTRATOR)
                // ? <Typography variant="h6" noWrap>AMDINISTRATOR</Typography> 
                // : 
                <>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      onClick={handleDrawerOpen}
                      edge="start"
                      className={clsx(classes.menuButton, open && classes.hide)}
                    ><MenuIcon /></IconButton>
                    <Typography variant="h6" noWrap onClick={()=>navigate("/")}>BERTHONG</Typography>
                    {
                      !_.isEmpty(user) && checkRole(user) === Constants.AUTHENTICATED 
                      ? <Stack direction={"row"} spacing={2} alignItems="center">
                          <IconButton size={'small'}>
                            <Avatar 
                              src={ !_.isEmpty(user?.avatar) ? user?.avatar?.url : "" }
                              alt="profile"
                            />
                          </IconButton>
                          <Typography variant="h6" noWrap>
                            {"[  Name :" + user?.displayName +", Email :"+ user?.email + " ]"}
                          </Typography>
                          <div>Balance : {numberCurrency(user?.balance ? user.balance : 0)} [-{numberCurrency(user?.balanceBook ? user.balanceBook : 0)}]</div>
                          <IconButton 
                            size={'small'}
                            onClick={()=>{
                              navigate("/notifications")
                            }}>
                            <Badge badgeContent={_.map(notifications, i=>i.unread).length} color="primary">
                              <MdCircleNotificationsIcon color="white" size="1.2em"/>
                            </Badge>
                          </IconButton>
                          <IconButton 
                            size={'small'}
                            onClick={()=>{ navigate("/me+book+buys") }}>
                            <Badge badgeContent={1} color="primary">
                              <FiShoppingCart color="white" size="1.2em"/>
                            </Badge>
                          </IconButton>
                        </Stack>
                      : ""  
                    }
                  </>
              }
            </Toolbar>
          </AppBar>
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={()=> open && setOpen(false) }>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper
              }}>
              <div className={classes.drawerHeader}>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "ltr" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </div>
              <Divider />
                <List>
                  {_.map(menuList(), (item, index) => {
                    return  <ListItem
                              // button
                              selected={location?.pathname == item.path ? true : false}
                              key={index}
                              onClick={() => {
                                switch(item.path){
                                  case "/login":{
                                    setDialogLogin(true)
                                    break;
                                  }
                                  case "/logout":{
                                    handleDrawerClose();
                                    setOpenDialogLogout(true)
                                    break;
                                  }
                                  case "/withdraw":
                                  case "/deposit":{
                                    navigate(item.path, {state: {from: "/", mode: "new" }})
                                    break;
                                  }

                                  default:{
                                    navigate(item.path)
                                  }
                                }
                              }}>
                              <ListItemIcon>{item.icon}</ListItemIcon>
                              <ListItemText 
                                primary={item.title} />
                            </ListItem>
                  }                  
                  )}
                </List>
              <Divider />
              <Typography variant="caption" display="block" gutterBottom>© 2023 BERTHONG LLC</Typography>
            </Drawer>
          </ClickAwayListener>
          <main className={clsx(classes.content, { [classes.contentShift]: open })} >
            { <div className={classes.drawerHeader} /> }
          </main>
        </div>
        <div className="container">
          <BreadcsComp {...props}/>
          <Routes>
            <Route path="/" exact element={ _.isEqual(checkRole(user), Constants.AMDINISTRATOR) 
                                            ? <AdminHomePage {...props} onLogin={()=>setDialogLogin(true)} /> 
                                            : <HomePage 
                                                {...props}
                                                search={search} 
                                                onLogin={()=>setDialogLogin(true)} 
                                                onSearchChange={(evt)=>setSearch(evt)}
                                                onMutationFollow={(evt)=>onMutationFollow(evt)} />} 
                                            />

            <Route path="/d" element={<DetailPage 
                                        {...props}
                                        onLogin={()=>setDialogLogin(true)} 
                                        onLightbox={(evt)=>setLightbox(evt)} 
                                        onMutationFollow={(evt)=>onMutationFollow(evt)}
                                        onMutationBook={(evt)=>onMutationBook(evt)}/>} 
                                    />

            <Route path="/user/login" element={<LoginPage {...props} />} />
            <Route path="/suppliers" element={<SuppliersPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
            <Route path="/supplier" element={<SupplierPage />} />
            <Route path="/p" element={<ProfilePage onLightbox={(value)=>setLightbox(value)} />}/>
            <Route element={<ProtectedAuthenticatedRoute user={user} />}>
              <Route path="/me" element={<MePage  {...props} />} />
              <Route path="/deposit" element={<DepositPage {...props} />} />
              <Route path="/withdraw" element={<WithdrawPage {...props} />} />
              <Route path="/history-transitions" element={<HistoryTransitionsPage {...props} />} />
              <Route path="/bank" element={<BankPage {...props} />} />
              <Route path="/banks" element={<BanksPage {...props} />} />
              <Route path="/me+book+buys" element={<MeBookBuysPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/notifications" element={<NotificationsPage {...props} />} />
            </Route>
            <Route element={<ProtectedAdministratorRoute user={user} />}>
              <Route path="/deposits" element={<DepositsPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/withdraws" element={<WithdrawsPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/date-lotterys" element={<DateLotterysPage />} />
              <Route path="/date-lottery" element={<DateLotteryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/taxonomy-banks" element={<TaxonomyBanksPage />} />
              <Route path="/taxonomy-bank" element={<TaxonomyBankPage />} />
            </Route>
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user, ws: state.ws }
}

const mapDispatchToProps = {
  editedUserBalace,
  editedUserBalaceBook,
  updateProfile,
  logout
}

export default connect( mapStateToProps, mapDispatchToProps )(App);

