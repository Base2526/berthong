import React, { useState, useCallback, useEffect, useRef } from "react";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import moment from "moment";
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
  Home as HomeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon
} from "@material-ui/icons";
import {
  Logout as LogoutIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AccountTree as AccountTreeIcon,
  AddRoad as AddRoadIcon,
  Adjust as AdjustIcon,
  AlternateEmail as AlternateEmailIcon,
  AllOut as AllOutIcon,
  Assistant as AssistantIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import {
  IconButton,
  ClickAwayListener
} from "@mui/material";

import _ from "lodash"

import BankPage from "./BankPage";
import BanksPage from "./BanksPage";
import BookBuysPage from "./BookBuysPage";
import DateLotteryPage from "./DateLotteryPage";
import DateLotterysPage from "./DateLotterysPage";
import DepositPage from "./DepositPage";
import DepositsPage from "./DepositsPage";
import DetailPage from "./DetailPage";
import { gqlPing, subscriptionMe } from "./gqlQuery";
import HistoryTransitionsPage from "./HistoryTransitionsPage";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import MePage from "./MePage";
import ProfileBankPage from "./ProfileBankPage";
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth";
import SupplierPage from "./SupplierPage";
import SupplierProfilePage from "./SupplierProfilePage";
import SuppliersPage from "./SuppliersPage";
import UserPage from "./UserPage";
import UsersPage from "./UsersPage";
import { checkRole, getHeaders } from "./util";
import WithdrawPage from "./WithdrawPage";
import WithdrawsPage from "./WithdrawsPage";
import Breadcs from "./components/breadcrumbs";
import DialogLogin from "./DialogLogin";
import DialogLogout from "./DialogLogout";

import {
  AMDINISTRATOR, AUTHENTICATED, WS_CLOSED, WS_CONNECTED, WS_CONNECTION, WS_SHOULD_RETRY
} from "./constants";
import { login, logout } from "./redux/actions/auth";

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

  let { ws, user, editedUserBalace, editedUserBalaceBook } = props

  // console.log("ws :", location)

  /////////////////////// ping ///////////////////////////////////
  const pingValues =useQuery(gqlPing, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true});

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
        }
      }
    }, []),
    onError: useCallback((err) => {
      console.log("subscriptionMe :", err)
    }, []),
    variables: {sessionId: localStorage.getItem('token')},
  });

  useEffect(()=> {
    intervalPing.current = setInterval(() => {
      pingValues && pingValues.refetch()
        
      console.log("ping, auth : ", moment().format("DD-MM-YYYY hh:mm:ss") )

    }, 60000 /*1 min*/);
    return ()=> clearInterval(intervalPing.current);
  }, [user]);

  const ProtectedAuthenticatedRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case AMDINISTRATOR:
      case AUTHENTICATED:{
        return <Outlet />;
      }
      default:{
        return <Navigate to={redirectPath} replace />;
      }
    }
  };

  const ProtectedAdministratorRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return <Outlet />;
      }
      default:{
        return <Navigate to={redirectPath} replace />;
      }
    }
  };

  const statusView = () =>{
    switch(ws?.ws_status){
      // case WS_CONNECTED :{
      //   return <div />
      // }
      case WS_CONNECTION :
      case WS_SHOULD_RETRY: {
        return <div className="ws">server กำลังทำการเชื่อมต่อ <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      }

      case WS_CLOSED:{
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

  /*
  return2 (
      <div className="App">
        <ToastContainer />
        {statusView()}
        <Breadcs />
        <div className="container">
          <div className="row">
            <Routes>
              <Route path="/" exact element={<HomePage />} />
              <Route path="/p" element={<DetailPage />} />
              <Route path="/user/login" element={<LoginPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/supplier" element={<SupplierPage />} />
              <Route path="/profile" element={<SupplierProfilePage />}/>
              <Route element={<ProtectedAuthenticatedRoute user={user} />}>
                <Route path="/me" element={<MePage />} />
                <Route path="/deposit" element={<DepositPage />} />
                <Route path="/withdraw" element={<WithdrawPage />} />
                <Route path="/history-transitions" element={<HistoryTransitionsPage />} />
                <Route path="/me+bank" element={<ProfileBankPage />} />
                <Route path="/book+buys" element={<BookBuysPage />} />
              </Route>
              <Route element={<ProtectedAdministratorRoute user={user} />}>
                <Route path="/deposits" element={<DepositsPage />} />
                <Route path="/withdraws" element={<WithdrawsPage />} />
                <Route path="/date-lotterys" element={<DateLotterysPage />} />
                <Route path="/date-lottery" element={<DateLotteryPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/banks" element={<BanksPage />} />
                <Route path="/bank" element={<BankPage />} />
              </Route>
              <Route path="*" element={<p>There's nothing here: 404!</p>} />
            </Routes>
          </div>
        </div>
      </div>
  );
  */

  const menuList = () =>{
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon />, path: "/"},
                {id: 1, title:"รายการถอดเงิน รออนุมัติ", icon: <AccountTreeIcon />, path: "/withdraws"},
                {id: 2, title:"รายการฝากเงิน รออนุมัติ", icon: <AddRoadIcon />, path: "/deposits"},
                {id: 3, title:"จัดการ Suppliers ทั้งหมด", icon: <AdjustIcon />, path: "/suppliers"},
                {id: 4, title:"รายชื่อบุคคลทั้งหมด", icon: <AlternateEmailIcon />, path: "/users"},
                {id: 5, title:"รายชื่อธนาคารทั้งหมด", icon: <AllOutIcon />, path: "/banks"},
                {id: 6, title:"วันออกหวยทั้งหมด", icon: <AssistantIcon />, path: "/date-lotterys"},
                {id: 7, title:"รายการ บัญชีธนาคาร", icon: <AccountBalanceWalletIcon />, path: "/me+bank"},
                {id: 8, title:"Logout", icon: <LogoutIcon />, path: "/logout"}]
      }
      case AUTHENTICATED:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon />, path: "/"},
                {id: 1, title:"รายการ จอง-ซื้อ", icon: <AccountTreeIcon />, path: "/book+buys"},
                {id: 2, title:"รายการ แจ้งฝากเงิน", icon: <AdjustIcon />, path: "/deposit"},
                {id: 3, title:"รายการ แจ้งถอนเงิน", icon: <AlternateEmailIcon />, path: "/withdraw"},
                {id: 4, title:"รายการ บัญชีธนาคาร", icon: <AccountBalanceWalletIcon />, path: "/me+bank"},
                {id: 5, title:"Supplier list", icon: <AssistantIcon />, path: "/suppliers"},
                {id: 6, title:"History-Transitions", icon: <AddRoadIcon />, path: "/history-transitions"},
                {id: 7, title:"Logout", icon: <LogoutIcon />, path: "/logout"}]
      }
      default:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon />, path: "/"},
                {id: 7, title:"Login", icon: <LoginIcon />, path: "/login"}]
      }
    }
  }

  return (
    <div className="App">
      <ToastContainer />
      {
        openDialogLogout && <DialogLogout open={openDialogLogout} onClose={()=>setOpenDialogLogout(false)}/>
      }
      {statusView()}
      <div class="container-fluid">
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open
            })}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, open && classes.hide)}
              ><MenuIcon /></IconButton>
              <Typography variant="h6" noWrap onClick={()=>navigate("/")}>BERTHONG</Typography>
              <Typography variant="h6" noWrap>
                {!_.isEmpty(user)? "[  Name :" + user?.displayName +", Email :"+ user?.email + " ]" : ""}
              </Typography>
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
                {menuList().map((item, index) => {
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

                                default:{
                                  navigate(item.path)
                                }
                              }
                            }}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText 
                              primary={item.title} 
                              primaryTypographyProps={{ style: { whiteSpace: "normal" } }} />
                          </ListItem>
                }
                  
                )}
              </List>
              <Divider />
              <Typography variant="caption" display="block" gutterBottom>© 2023 BERTHONG LLC</Typography>
            </Drawer>
          </ClickAwayListener>
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open
            })}
          >
            {<div className={classes.drawerHeader} />}
          </main>
        </div>
        <div className="container">
          <Breadcs />
          <Routes>
            <Route path="/" exact element={<HomePage />} />
            <Route path="/p" element={<DetailPage />} />
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/supplier" element={<SupplierPage />} />
            <Route path="/profile" element={<SupplierProfilePage />}/>
            <Route element={<ProtectedAuthenticatedRoute user={user} />}>
              <Route path="/me" element={<MePage />} />
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/history-transitions" element={<HistoryTransitionsPage />} />
              <Route path="/me+bank" element={<ProfileBankPage />} />
              <Route path="/book+buys" element={<BookBuysPage />} />
            </Route>
            <Route element={<ProtectedAdministratorRoute user={user} />}>
              <Route path="/deposits" element={<DepositsPage />} />
              <Route path="/withdraws" element={<WithdrawsPage />} />
              <Route path="/date-lotterys" element={<DateLotterysPage />} />
              <Route path="/date-lottery" element={<DateLotteryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/banks" element={<BanksPage />} />
              <Route path="/bank" element={<BankPage />} />
            </Route>
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Routes>
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
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user, ws: state.ws }
};

const mapDispatchToProps = {
  editedUserBalace,
  editedUserBalaceBook,
  login
}
export default connect( mapStateToProps, mapDispatchToProps )(App);
