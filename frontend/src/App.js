import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { useApolloClient, useQuery, useMutation, useSubscription } from "@apollo/client";
import { connect } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { CDBSidebar } from "cdbreact";
import clsx from "clsx";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
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
  AddTask as AddTaskIcon
} from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
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
  CgProfile as ProfileIcon
} from "react-icons/cg"
import {
  MdOutlineBookmarkAdded as MdOutlineBookmarkAddedIcon
} from "react-icons/md"
import {
  FiLogIn as LoginIcon
} from "react-icons/fi"
import {
  VscDebug as VscDebugIcon
} from "react-icons/vsc"
import {
  Avatar,
  IconButton,
  ClickAwayListener,
  Stack,
  Badge,
  Menu,
  MenuItem
} from "@mui/material";
import {
  GrContactInfo as GrContactInfoIcon
} from "react-icons/gr"
import {
  SlUserFollowing
} from "react-icons/sl"
import {
  BiStoreAlt
} from "react-icons/bi"
import _ from "lodash"
import TaxonomyBankPage from "./TaxonomyBankPage";
import TaxonomyBanksPage from "./TaxonomyBanksPage";
import BookBuysPage from "./BookBuysPage";
import ManageLotteryPage from "./ManageLotteryPage";
import ManageLotterysPage from "./ManageLotterysPage";
import DepositPage from "./DepositPage";
import AdminDepositsPage from "./AdminDepositsPage";
import AdminWithdrawsPage from "./AdminWithdrawsPage";
import DetailPage from "./pages/detail/Detail";
import HistoryTransitionsPage from "./HistoryTransitionsPage";
import HomePage from "./HomePage";
import AdminHomePage from "./AdminHomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import MePage from "./MePage";
import BankPage from "./BankPage";
import BanksPage from "./BanksPage";
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth";
import LotteryPage from "./LotteryPage";
import FriendPage from "./FriendPage";
import LotterysPage from "./LotterysPage";
import UserPage from "./UserPage";
import UsersPage from "./UsersPage";
import { checkRole, getHeaders, handlerErrorApollo, showToast, setCookie, getCookie} from "./util";
import WithdrawPage from "./WithdrawPage";
import BreadcsComp from "./components/BreadcsComp";
import DialogLogoutComp from "./components/DialogLogoutComp";
import DialogDeleteBankComp from "./components/DialogDeleteBankComp";
import NotificationsPage from "./NotificationsPage";
import LoginWithLine from "./LoginWithLine";
import LightboxComp from "./components/LightboxComp";
import DialogLoginComp from "./components/DialogLoginComp";
import BookMarksPage from "./BookMarksPage";
import ContactUsPage from "./ContactUsPage";
import SubscribesPage from "./SubscribesPage";
import Footer from "./Footer";
import DblogPage from "./DblogPage";
import AutoGenerationContent from "./AutoGenerationContent"
import ProducersPage from "./ProducersPage"
import DepositsPage from "./DepositsPage"
import WithdrawsPage from "./WithdrawsPage"
 
import { queryNotifications, 
          mutationFollow, 
          querySuppliers, 
          querySupplierById, 
          mutationBook,
          mutationComment,
          queryCommentById,
          mutationBuy,
          subscriptionMe,
          mutationContactUs,
          mutationLogin,
          mutationLoginWithSocial,
          mutationWithdraw,
          mutationBank,
          mutationLottery,
          mutationNotification,
          mutationDeposit,
          queryBanks,
          queryBankById,
          mutationSubscribe,
          queryFriendProfile,
          mutationMe, 
          mutationDatesLottery, 
          queryDateLotterys, 
          queryDateLotteryById,
          mutationAdminDeposit,
          mutationAdminWithdraw,
          queryBookBuyTransitions
        } from "./gqlQuery"
          
import * as Constants from "./constants"
import { update_profile as updateProfile, logout } from "./redux/actions/auth";

import logo from "./images/logo_4.png";

let { REACT_APP_SITE_TITLE } = process.env

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
      backgroundColor: "#264360",
      color: "#fff",
      "& .MuiListItemIcon-root": {
        color: "#fff"
      }
    },
    "&$selected:hover": {
      backgroundColor: "#264360",
      color: "#fff",
      "& .MuiListItemIcon-root": {
        color: "#fff"
      }
    },
    "&:hover": {
      backgroundColor: "#EBECF4",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "#000"
      }
    }
  },
  selected: {}
})(MuiListItem);

const App =(props) =>{
  let { t } = useTranslation();
  let location = useLocation();
  let navigate = useNavigate();
  let [openMenuProfile, setOpenMenuProfile] = useState(null);
  let classes = useStyles();
  let theme = useTheme();
  let [open, setOpen] = useState(false);
  let [openDialogLogout, setOpenDialogLogout] = useState(false);
  let [openDialogDeleteBank, setOpenDialogDeleteBank] = useState({ open: false, id: 0});
  let [dialogLogin, setDialogLogin]     = useState(false);
  let [lightbox, setLightbox]           = useState({ isOpen: false, photoIndex: 0, images: [] });
  let [notifications, setNotifications] = useState([])
  let [search, setSearch]               = useState(Constants.INIT_SEARCH)

  let { ws, user, updateProfile, logout } = props

  let { loading: loadingNotifications, 
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
      let { data, status } = follow
      if(status){
        let querySuppliersValue = cache.readQuery({ query: querySuppliers, variables: { input: search } });
        if(!_.isEmpty(querySuppliersValue)){
          cache.writeQuery({
            query: querySuppliers,
            variables: { input: search},
            data: Object.assign({}, querySuppliersValue, { suppliers: {...querySuppliersValue.suppliers, data: _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data: item ) } } )
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

        if(_.find(data?.follows, (follow)=> _.isEqual(follow.userId, user._id) )){
          showToast("info", `Bookmark`)
        }else{
          showToast("info", `Un-Bookmark`)
        }
      }
    },
    onCompleted(data) { },
    onError: (error) => handlerErrorApollo( props, error ) 
  });

  const [onMutationBook, resultMutationBook] = useMutation(mutationBook,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {book}}, context) => {
      let { status, action, data, user } = book
      if(status){
        updateProfile(user)

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

        let { itemId } = context?.variables?.input
        if(_.find(data?.buys, buy=>buy.itemId === itemId && _.isEqual(buy.userId, user._id) && buy.selected === 0 )){
          showToast("success", `จองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
        }else{
          showToast("error", `ยกเลิกการจองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
        }
      }
    },
    onCompleted(data) {},
    onError: (error) => handlerErrorApollo( props, error )
  });

  const [onMutationComment, resultMutationComment] = useMutation(mutationComment,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {comment}}) => {
      let { status, commentId, data } = comment
      
      let resultCommentById = cache.readQuery({ query: queryCommentById, variables: {id: commentId}});
      if(status && resultCommentById){
        cache.writeQuery({ 
          query: queryCommentById, 
          variables: {id: commentId},
          data: { commentById: { ...resultCommentById.commentById, data } }, 
        }); 
      }

      // ////////// update cache querySuppliers ///////////
      // let suppliersValue = cache.readQuery({ query: querySuppliers });
      // if(!_.isNull(suppliersValue)){
      //   let { suppliers } = suppliersValue
      //   let newData = _.map(suppliers.data, (supplier) => supplier._id == data._id ? data : supplier)
      //   cache.writeQuery({
      //     query: querySuppliers,
      //     data: { suppliers: { ...suppliersValue.suppliers, data: newData } }
      //   });
      // }
      // ////////// update cache querySuppliers ///////////
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (error) => handlerErrorApollo( props, error ) 
  });

  const [onMutationContactUs, resultMutationContactUs] = useMutation(mutationContactUs,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {contactUs}}) => {
      // let { status, commentId, data } = comment

      console.log("contactUs :", contactUs)

      // let {mode, itemId} = action
      // switch(mode?.toUpperCase()){
      //   case "BOOK":{
      //     showToast("success", `จองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
      //     break
      //   }

      //   case "UNBOOK":{
      //     showToast("error", `ยกเลิกการจองเบอร์ ${itemId > 9 ? "" + itemId: "0" + itemId }`)
      //     break
      //   }
      // }
      
      // let resultCommentById = cache.readQuery({ query: queryCommentById, variables: {id: commentId}});
      // if(status && resultCommentById){
      //   cache.writeQuery({ 
      //     query: queryCommentById, 
      //     variables: {id: commentId},
      //     data: { commentById: { ...resultCommentById.commentById, data } }, 
      //   }); 
      // }

      // ////////// update cache querySuppliers ///////////
      // let suppliersValue = cache.readQuery({ query: querySuppliers });
      // if(!_.isNull(suppliersValue)){
      //   let { suppliers } = suppliersValue
      //   let newData = _.map(suppliers.data, (supplier) => supplier._id == data._id ? data : supplier)
      //   cache.writeQuery({
      //     query: querySuppliers,
      //     data: { suppliers: { ...suppliersValue.suppliers, data: newData } }
      //   });
      // }
      // ////////// update cache querySuppliers ///////////
    },
    onCompleted(data) {
      showToast("success", "ส่งเรียบร้อย")
    },
    onError: (error) => {
      return handlerErrorApollo( props, error ) 
    }
  });

  const [onMutationLogin, resultMutationLogin] = useMutation(mutationLogin, {
    context: { headers: getHeaders(location) },
    update: (cache, {data:{login}}) => {
      let {status, data, sessionId} = login
      if(status){
        console.log("onMutationLogin :", data, sessionId)
        // localStorage.setItem('token', sessionId)
        setCookie('token', sessionId)
        updateProfile(data)
        setDialogLogin(false);
      }
    },
    onCompleted(data) {
      showToast("success", t("welcome_to_berthong"))
      window.location.reload();
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationLoginWithSocial, resultMutationLoginWithSocial] = useMutation(mutationLoginWithSocial, 
    {
      context: { headers: getHeaders(location) },
      update: (cache, {data: {loginWithSocial}}) => {
        let {status, data, sessionId} = loginWithSocial
        if(status){
          // localStorage.setItem('token', sessionId)

          setCookie('token', sessionId)

          updateProfile(data)
          setDialogLogin(false);
        }
      },
      onCompleted(data) {
        showToast("success", t("welcome_to_berthong"))
        navigate("/")
      },
      onError(error){
        return handlerErrorApollo( props, error )
      }
    }
  );

  const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {withdraw}}) => {
      let { data, mode, status } = withdraw

      console.log("")
      // if(status){
      //   switch(mode){
      //     case "delete":{
      //       let data1 = cache.readQuery({ query: queryWithdraws });
      //       let dataFilter =_.filter(data1.withdraws.data, (item)=>data._id != item._id)

      //       cache.writeQuery({
      //         query: queryWithdraws,
      //         data: { withdraws: {...data1.withdraws, data: dataFilter} }
      //       });

      //       // handleClose()
      //       break;
      //     }
      //   }
      // }
    },
    onCompleted(data) {
      showToast("success", "ได้รับเรื่องแล้ว กำลังดำเนินการ")
      navigate("/");    
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationBank, resultMutationBankValues] = useMutation(mutationBank
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {bank}}) => {

          ////////// udpate cache Banks ///////////
          let banksValue = cache.readQuery({ query: queryBanks });
          let { status, mode, data } = bank
          if(status && banksValue){
            switch(mode){
              case "new":{
                cache.writeQuery({
                  query: queryBanks,
                  data: { banks: {...banksValue.banks, data: [...banksValue.banks.data, data]} },
                });
                break;
              }

              case "edit":{
                let newData = _.map(banksValue.banks.data, (item)=>item._id.toString() == data._id.toString() ?  data : item ) 
                cache.writeQuery({
                  query: queryBanks,
                  data: { banks: {...banksValue.banks, data: newData} },
                });
                break;
              }
            }
          }
          ////////// udpate cache Banks ///////////

          ////////// update cache queryBankById ///////////
          let bankByIdValue = cache.readQuery({ query: queryBankById, variables: {id: data._id}});
          if(status && bankByIdValue){
            cache.writeQuery({
              query: queryBankById,
              data: { bankById: {...bankByIdValue.bankById, data} },
              variables: {id: data._id}
            });
          }
          ////////// update cache queryBankById ///////////
        },
        onCompleted(data) {
          navigate(-1)
        }
      }
  );

  const [onMutationSupplier, resultSupplier] = useMutation(mutationLottery, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {supplier}}) => {
      let { data, mode, status } = supplier

      // if(status){
      //   switch(mode){
      //     case "new":{
      //       const querySuppliersValue = cache.readQuery({ query: querySuppliers });

      //       if(!_.isNull(querySuppliersValue)){
      //         let newData = [...querySuppliersValue.suppliers.data, data];

      //         cache.writeQuery({
      //           query: querySuppliers,
      //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
      //         });
      //       }
      //       break;
      //     }
      //     case "edit":{
      //       const querySuppliersValue = cache.readQuery({ query: querySuppliers });
      //       if(!_.isNull(querySuppliersValue)){
      //         let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data : item ) 

      //         cache.writeQuery({
      //           query: querySuppliers,
      //           data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
      //         });
      //       }
      //       break;
      //     }
      //   }
      // }
    },
    onCompleted(data) {
      navigate(-1)
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationNotification, resultNotification] = useMutation(mutationNotification, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {notification}}) => {
      let { data, status } = notification
      console.log("update")
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {deposit}}) => {
      let { data, status } = deposit
      console.log("")
      // if(status){
      //   switch(mode){
      //     // case "new":{
      //     //   const queryDepositsValue = cache.readQuery({ query: queryDeposits });
      //     //   if(!_.isNull(queryDepositsValue)){
      //     //     let newData = [...queryDepositsValue.deposits.data, data];

      //     //     cache.writeQuery({
      //     //       query: queryDeposits,
      //     //       data: { deposits: {...queryDepositsValue.deposits, data: newData} }
      //     //     });
      //     //   }
      //     //   break;
      //     // }

      //     case "edit":{
      //       let queryDepositsValue = cache.readQuery({ query: queryDeposits });
      //       if(!_.isNull(queryDepositsValue)){
      //         let newData = _.map(queryDepositsValue.deposits.data, (item)=> item._id == data._id ? data : item ) 

      //         if(deposit.data.status == "approved" || deposit.data.status == "reject"){
      //           newData = _.filter(queryDepositsValue.deposits.data, (item)=> item._id != data._id ) 
      //         }

      //         cache.writeQuery({
      //           query: queryDeposits,
      //           data: { deposits: {...queryDepositsValue.deposits, data: newData} }
      //         });
      //       }
      //       break;
      //     }
      //   }
      // }
    },
    onCompleted(data) {
      showToast("success", "ได้รับเรื่องแล้ว กำลังดำเนินการ")
      navigate("/");    
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationSubscribe, resultSubscribe] = useMutation(mutationSubscribe, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {subscribe}}) => {
      let { data, status } = subscribe
      if(status){
        const queryFriendProfileValue = cache.readQuery({ query: queryFriendProfile, variables: {id: data?._id} });
        if(!_.isNull(queryFriendProfileValue)){
          let updateData =   {...queryFriendProfileValue.friendProfile.data, ...data}
          cache.writeQuery({
            query: queryFriendProfile,
            variables: {id: data?._id},
            data: { friendProfile: {...queryFriendProfileValue.friendProfile, data: updateData } }
          });
        }

        _.find( data?.subscriber, (i)=> _.isEqual( i?.userId,  user?._id) ) 
        ? showToast("success", `Subscribe`)
        : showToast("error", `Unsubscribe`)
      }
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
    context: { headers: getHeaders(location) },
    update: (cache, {data:{ me }}, context) => {
      let { status, data } = me
      if(status){
        updateProfile(data)

        let { type, mode } = context?.variables?.input
        switch(type){
          case "bank":{
            switch(mode){
              case "new":{
                showToast("success", `Add bank success`)
                navigate(-1)
                break;
              }
              case "delete":{
                showToast("success", `Delete bank success`)
                setOpenDialogDeleteBank({ open: false, id: ""})  
                break;
              }
            }
  
            break;
          }
  
          case "avatar":{
            showToast("success", `Update profile success`)
            break;
          }
        }
      }
    },
    onCompleted: (data) => {},
    onError: (error) => handlerErrorApollo( props, error )
  });

  const [onMutationDateLottery, resultMutationDateLotteryValues] = useMutation(mutationDatesLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {dateLottery}}) => {

          console.log("DateLottery :", dateLottery)
          
          ////////// udpate cache Banks ///////////
          let queryDateLotterysValue = cache.readQuery({ query: queryDateLotterys });
          let { status, mode, data } = dateLottery
          if(status && queryDateLotterysValue){
            switch(mode){
              case "new":{
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: [...queryDateLotterysValue.dateLotterys.data, data]} },
                });
                break;
              }

              case "edit":{
                let newData = _.map(queryDateLotterysValue.dateLotterys.data, (item)=>item._id.toString() == data._id.toString() ?  data : item ) 
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: newData} },
                });
                break;
              }
            }
          }
          ////////// udpate cache Banks ///////////
        

          ////////// update cache queryDateLotteryById ///////////
          let dateLotteryByIdValue = cache.readQuery({ query: queryDateLotteryById, variables: {id: data._id}});
          if(status && dateLotteryByIdValue){
            cache.writeQuery({
              query: queryDateLotteryById,
              data: { dateLotteryById: {...dateLotteryByIdValue.dateLotteryById, data} },
              variables: {id: data._id}
            });
          }
          ////////// update cache queryDateLotteryById ///////////

        },
        onCompleted(data) {
          // history.goBack();
          navigate(-1);
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const [onMutationDatesLottery, resultMutationDatesLottery] = useMutation(mutationDatesLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {datesLottery}}) => {

          console.log("datesLottery :", datesLottery)
          
          //////////// udpate cache Banks ///////////
          let queryDateLotterysValue = cache.readQuery({ query: queryDateLotterys });
          // let { status, mode, data } = datesLottery
          console.log("")
          /*
          if(status && queryDateLotterysValue){
            switch(mode){
              case "new":{
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: [...queryDateLotterysValue.dateLotterys.data, data]} },
                });
                break;
              }

              case "edit":{
                let newData = _.map(queryDateLotterysValue.dateLotterys.data, (item)=>item._id.toString() == data._id.toString() ?  data : item ) 
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: newData} },
                });
                break;
              }
            }
          }
          */
          ////////// udpate cache Banks ///////////
        

          // ////////// update cache queryDateLotteryById ///////////
          // let dateLotteryByIdValue = cache.readQuery({ query: queryDateLotteryById, variables: {id: data._id}});
          // if(status && dateLotteryByIdValue){
          //   cache.writeQuery({
          //     query: queryDateLotteryById,
          //     data: { dateLotteryById: {...dateLotteryByIdValue.dateLotteryById, data} },
          //     variables: {id: data._id}
          //   });
          // }
          // ////////// update cache queryDateLotteryById ///////////

        },
        onCompleted(data) {
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const [onMutationAdminDeposit, resultMutationAdminDeposit] = useMutation(mutationAdminDeposit
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {adminDeposit}}) => {
          console.log("adminDeposit :", adminDeposit)
        },
        onCompleted(data) {
          let { status, mode } = data?.adminDeposit
          console.log("onCompleted :", data)
          if(status){
            showToast("success", "ดำเนินการเรียบร้อย")
          }
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const [onMutationAdminWithdraw, resultMutationAdminWithdraw] = useMutation(mutationAdminWithdraw
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {adminWithdraw}}) => {
          console.log("adminWithdraw :", adminWithdraw)
        },
        onCompleted(data) {
          // let { status, mode } = data?.adminDeposit
          // console.log("onCompleted :", data)
          // if(status){
          //   showToast("success", "ดำเนินการเรียบร้อย")
          // }
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  useEffect(()=>{
    if(!_.isEmpty(user)){
      refetchNotifications();
    }

    console.log("user :", user)
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

  useEffect(()=>{
    console.log("location?.pathname :", location?.pathname)
  }, [location?.pathname])
  
  useSubscription(subscriptionMe, {
    onSubscriptionData: useCallback((res) => {
      console.log("subscriptionMe :", res)
      if(!res.subscriptionData.loading){
        let { mutation, data } = res.subscriptionData.data.subscriptionMe

        switch(mutation){
          case "BOOK":
          case "BUY":
          case "DEPOSIT":
          case "WITHDRAW":
          case "CANCEL":{
            updateProfile(data?.data)
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
    variables: {sessionId: /*localStorage.getItem('token')*/ getCookie('token') }, // setCookie('token', sessionId, {})
  });
 
  const ProtectedAuthenticatedRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:
      case Constants.AUTHENTICATED:
      case Constants.SELLER: 
        return <Outlet />;
      default:
        return <Navigate to={redirectPath} replace />;
    }
  };

  const ProtectedSellerRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:
      case Constants.SELLER:
        return <Outlet />;
      default:
        return <Navigate to={redirectPath} replace />;
    }
  };

  const ProtectedAdministratorRoute = ({ user, redirectPath = '/' }) => {
    switch(checkRole(user)){
      case Constants.AMDINISTRATOR:
        return <Outlet />;
      default:
        return <Navigate to={redirectPath} replace />;
    }
  };

  const statusView = () =>{
    switch(ws?.ws_status){
      // case Constants.WS_CONNECTED :{
      //   return <div />
      // }
      case Constants.WS_CONNECTION :
      case Constants.WS_SHOULD_RETRY: {
        // return <div className="ws">server กำลังทำการเชื่อมต่อ <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
        return  <Stack position="fixed" sx={{ width: '100%', zIndex: 10000 }}>
                  <LinearProgress 
                  sx={{
                    // backgroundColor: 'white',
                    '& .MuiLinearProgress-bar': { backgroundColor: 'yellow' }
                  }} />
                </Stack>
      }

      // case Constants.WS_CLOSED:{
      //   // return <div className="ws">server มีปัญหา <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      //   return  <Stack position="fixed" sx={{ width: '100%', zIndex: 10000 }}>
      //             <LinearProgress 
      //             sx={{
      //               // backgroundColor: 'white',
      //               '& .MuiLinearProgress-bar': { backgroundColor: 'red' }
      //             }} />
      //           </Stack>
      // }

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
                {id: 3, title:"รายการถอดเงินทั้งหมด", icon: <AccountTreeIcon />, path: "/withdraws"},
                {id: 4, title:"รายการฝากเงินทั้งหมด", icon: <AddRoadIcon />, path: "/all-deposits"},
                {id: 5, title:"รายการหวยทั้งหมด", icon: <AddTaskIcon />, path: "/lotterys"},
                {id: 6, title:"รายชื่อบุคคลทั้งหมด", icon: <AlternateEmailIcon />, path: "/users"},
                {id: 7, title:"รายชื่อธนาคารทั้งหมด", icon: <AllOutIcon />, path: "/taxonomy-banks"},
                {id: 8, title:"จัดการหวยทั้งหมด", icon: <AssistantIcon />, path: "/manage-lotterys"},
                {id: 9, title:"Db-Log", icon: <VscDebugIcon size="1.5em" />, path: "/dblog"}
              ]
      }
      case Constants.AUTHENTICATED:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"แจ้งฝากเงิน", icon: <AdjustIcon />, path: "/deposit"},
                {id: 2, title:"แจ้งถอนเงิน", icon: <AlternateEmailIcon />, path: "/withdraw"},
                {id: 3, title:"ประวัติการ ฝาก-ถอน", icon: <AiOutlineHistory size="1.5em" />, path: "/history-transitions"}
              ]
      }

      case Constants.SELLER:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"รายการหวยทั้งหมด", icon: <AddTaskIcon />, path: "/lotterys"},
                {id: 2, title:"แจ้งฝากเงิน", icon: <AdjustIcon />, path: "/deposit"},
                {id: 3, title:"แจ้งถอนเงิน", icon: <AlternateEmailIcon />, path: "/withdraw"},
                {id: 4, title:"ประวัติการ ฝาก-ถอน", icon: <AiOutlineHistory size="1.5em" />, path: "/history-transitions"}
              ]
      }
      default:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"Login", icon: <LoginIcon size="1.5em"  />, path: "/login"}]
      }
    }
  }

  const menuProfile = () =>{
    return  <Menu
              anchorEl={openMenuProfile}
              keepMounted
              open={openMenuProfile && Boolean(openMenuProfile)}
              onClose={()=>{ setOpenMenuProfile(null) }}
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
              <MenuItem onClick={(e)=>{
                setOpenMenuProfile(null)
                navigate("/me")
              }}><ProfileIcon size={20} round />Profile</MenuItem>
              <MenuItem onClick={(e)=>{
                setOpenMenuProfile(null)
                setOpenDialogLogout(true)
              }}><LoginIcon size={20} round />Logout</MenuItem>
            </Menu>
  }

  const toolbarMenu = () =>{
      if(!_.isEmpty(user)){
        switch(checkRole(user)){
          case Constants.AUTHENTICATED:{
            return  <Stack direction={"row"} spacing={2} alignItems="center">
                      <div className="border-login">
                        <IconButton size={'small'} onClick={()=> navigate("/notifications") }>
                          <Badge badgeContent={_.map(notifications, i=>i.unread).length} color="primary">
                            <MdCircleNotificationsIcon color={ _.isEqual(location?.pathname, "/notifications") ? "red" : "white" }  size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/book-buy")}>
                          <Badge badgeContent={user?.inTheCarts ? user?.inTheCarts?.length : 0} color="primary">
                            <FiShoppingCart color={ _.isEqual(location?.pathname, "/book-buy") ? "red" : "white" } size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/bookmarks")}>
                          <MdOutlineBookmarkAddedIcon color={ _.isEqual(location?.pathname, "/bookmarks") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/subscribes")}>
                          <SlUserFollowing color={ _.isEqual(location?.pathname, "/subscribes") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton size={'small'} onClick={(evt)=>{ setOpenMenuProfile(evt.currentTarget) }}>
                          <Avatar alt="profile" src={ !_.isEmpty(user?.avatar) ? user?.avatar?.url : "" }/>
                        </IconButton>
                      </div>
                    </Stack>
          }

          case Constants.AMDINISTRATOR:{
            return  <Stack direction={"row"} spacing={2} alignItems="center">
                      <div className="border-login">
                        <IconButton 
                          size={'small'}
                          onClick={(evt)=> setOpenMenuProfile(evt.currentTarget) }>
                          <Avatar 
                            src={ !_.isEmpty(user?.avatar) ? user?.avatar?.url : "" }
                            alt="profile"
                          />
                        </IconButton>
                      </div>
                    </Stack>
          }

          case Constants.SELLER:{
            return  <Stack direction={"row"} spacing={2} alignItems="center">
                      <div className="border-login">
                        <IconButton size={'small'} onClick={()=> navigate("/notifications") }>
                          <Badge badgeContent={_.map(notifications, i=>i.unread).length} color="primary">
                            <MdCircleNotificationsIcon color={ _.isEqual(location?.pathname, "/notifications") ? "red" : "white" }  size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/book-buy")}>
                          <Badge badgeContent={user?.inTheCarts ? user?.inTheCarts?.length : 0} color="primary">
                            <FiShoppingCart color={ _.isEqual(location?.pathname, "/book-buy") ? "red" : "white" } size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/bookmarks")}>
                          <MdOutlineBookmarkAddedIcon color={ _.isEqual(location?.pathname, "/bookmarks") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/subscribes")}>
                          <SlUserFollowing color={ _.isEqual(location?.pathname, "/subscribes") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton size={'small'} onClick={()=> navigate("/lotterys")}>
                          <BiStoreAlt color={ _.isEqual(location?.pathname, "/lotterys") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton size={'small'} onClick={(evt)=>{ setOpenMenuProfile(evt.currentTarget) }}>
                          <Avatar alt="profile" src={ !_.isEmpty(user?.avatar) ? user?.avatar?.url : "" }/>
                        </IconButton>
                      </div>
                    </Stack>
          }
        }
      }

      return  <Stack direction={"row"} spacing={2} alignItems="center">
                <IconButton size={'small'} onClick={()=>{ setDialogLogin(true) }}>
                  <LoginIcon color="white" size="1.2em"/>
                </IconButton>
              </Stack>
  }

  return (
    <div className="App page-container">
      <div className="content-wrap" >
      {lightbox.isOpen  && <LightboxComp datas={lightbox} onLightbox={(v)=>setLightbox(v)}/> }
      <ToastContainer />
      {
        openDialogLogout 
        && <DialogLogoutComp 
            {...props} 
            open={openDialogLogout} 
            onLogout={()=>{
              logout()
              setOpenDialogLogout(false)
              window.location.reload()
            }}
            onClose={()=>setOpenDialogLogout(false)}/>
      }
      {
        dialogLogin 
        && <DialogLoginComp   
            {...props}
            open={dialogLogin}
            onComplete={async(data)=> setDialogLogin(false) }
            onClose={()=> setDialogLogin(false) }
            onMutationLogin={(evt)=>onMutationLogin(evt)}
            onMutationLoginWithSocial={(evt)=>onMutationLoginWithSocial(evt)}/>
      }
      {
        openDialogDeleteBank.open
        && <DialogDeleteBankComp 
            {...props} 
            data={ openDialogDeleteBank }
            onDelete={(evt)=>{
              onMutationMe({ variables: { input: { type: "bank", mode: "delete", data: evt } } })
            }}
            onClose={()=>setOpenDialogDeleteBank({ open: false, id: ""})}/>
      }

      {statusView()}
      {menuProfile()}
      
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
                <>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    className={clsx(classes.menuButton, open && classes.hide)}
                  ><MenuIcon /></IconButton>
                  <Typography variant="h6" noWrap onClick={()=>navigate("/")}><div className="fnt">{ REACT_APP_SITE_TITLE } { checkRole(user) === Constants.SELLER ? "(Seller)" : ""}</div></Typography>
                  {toolbarMenu()}
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
                  {
                  _.map(menuList(), (item, index) => {
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
                                    setOpenDialogLogout(true)
                                    break;
                                  }
                                  case "/withdraw":
                                  case "/deposit":{
                                    navigate(item.path)
                                    break;
                                  }

                                  case "/contact-us":{
                                    navigate(item.path)
                                    break;
                                  }
                                  default:{
                                    navigate(item.path)
                                  }
                                }

                                handleDrawerClose();
                              }}>
                              <ListItemIcon>{item.icon}</ListItemIcon>
                              <ListItemText primary={item.title} />
                            </ListItem>
                  })
                  }
                </List>
              <Divider />
              <div className="text-center">
                <img
                  className="logo1"
                  src={logo}
                  alt="Avatar"
                />
              </div>
              <Typography variant="caption" display="block" gutterBottom><div className="text-center p-1">© 2023 BERTHONG LLC</div></Typography>
            </Drawer>
          </ClickAwayListener>
          <main className={clsx(classes.content, { [classes.contentShift]: open })}>{ <div className={classes.drawerHeader} /> } </main>
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
                                                onMutationFollow={(evt)=>onMutationFollow(evt)} />} />
            <Route path="/d" element={<DetailPage 
                                        {...props}
                                        onLogin={()=>setDialogLogin(true)} 
                                        onLightbox={(evt)=>setLightbox(evt)} 
                                        onMutationFollow={(evt)=>onMutationFollow(evt)}
                                        onMutationBook={(evt)=>onMutationBook(evt)}
                                        onMutationComment={(evt)=>onMutationComment(evt)}/>} />
            <Route path="/user/login" element={<LoginPage {...props} />} />
            <Route path="/p" element={<FriendPage 
                                        {...props} 
                                        onLogin={()=>setDialogLogin(true)}
                                        onLightbox={(value)=>setLightbox(value)} 
                                        onMutationSubscribe={(evt)=>{ onMutationSubscribe(evt) }} />}/>
            <Route path="/login-with-line" element={<LoginWithLine />}  />
            <Route path="/contact-us" element={<ContactUsPage {...props} onMutationContactUs={(evt)=>onMutationContactUs(evt)} />}  />
            <Route path="/register" element={<RegisterPage />}  />
            <Route element={<ProtectedAuthenticatedRoute user={user} />}>
              <Route path="/me" element={<MePage 
                                          {...props} 
                                          onDialogDeleteBank={(id)=>setOpenDialogDeleteBank({open: true, id})} 
                                          onMutationMe={(evt)=>onMutationMe(evt)}
                                          onLightbox={(evt)=>setLightbox(evt)} />} />
              <Route path="/deposit" element={<DepositPage {...props} onMutationDeposit={(evt)=> onMutationDeposit(evt) } />} />
              <Route path="/withdraw" element={<WithdrawPage {...props} onMutationWithdraw={(evt)=>onMutationWithdraw(evt)} />} />
              <Route path="/history-transitions" {...props} element={<HistoryTransitionsPage {...props} />} />
              <Route path="/bank" element={<BankPage {...props} onMutationMe={(evt)=>onMutationMe(evt)} />} />
              <Route path="/banks" element={<BanksPage {...props} />} />
              <Route path="/book-buy" element={<BookBuysPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/notifications" element={<NotificationsPage {...props} onMutationNotification={(evt)=>onMutationNotification(evt)} />} />
              <Route path="/bookmarks" element={<BookMarksPage {...props} onMutationFollow={(evt)=>onMutationFollow(evt) } />} />
              <Route path="/subscribes" element={<SubscribesPage {...props} onMutationSubscribe={(evt)=>onMutationSubscribe(evt)} />} />
              <Route path="/producers" element={<ProducersPage {...props}  onLightbox={(evt)=>setLightbox(evt)}  />} />
            </Route>
            <Route element={<ProtectedSellerRoute user={user} />}>
              <Route path="/lotterys" element={<LotterysPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/lottery" element={<LotteryPage {...props} onMutationSupplier={(evt)=>onMutationSupplier(evt)} />} />
            </Route>
            <Route element={<ProtectedAdministratorRoute user={user} />}>
              <Route path="/deposits" element={<AdminDepositsPage 
                                                      {...props} 
                                                      onLightbox={(value)=>setLightbox(value)} 
                                                      onMutationAdminDeposit={(evt)=>onMutationAdminDeposit(evt)} />} />
              <Route path="/withdraws" element={<AdminWithdrawsPage 
                                                      {...props} 
                                                      onMutationAdminWithdraw={(evt)=>onMutationAdminWithdraw(evt)} 
                                                      onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/manage-lotterys" element={<ManageLotterysPage onMutationDatesLottery={(evt)=>onMutationDatesLottery(evt)}  />} />
              <Route path="/manage-lottery" element={<ManageLotteryPage onMutationDateLottery={(evt)=>onMutationDateLottery(evt)}/>} />
              <Route path="/users" element={<UsersPage {...props} />} />
              <Route path="/user" element={<UserPage {...props} />} />
              <Route path="/taxonomy-banks" element={<TaxonomyBanksPage />} />
              <Route path="/taxonomy-bank" element={<TaxonomyBankPage  {...props} onMutationBank={(evt)=>onMutationBank(evt)}/>} />
              <Route path="/dblog" element={<DblogPage  {...props} />} />
              <Route path="/auto-generation-content" element={<AutoGenerationContent  {...props} />} />

              <Route path="/all-deposits" element={<DepositsPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/withdraws" element={<WithdrawsPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
            </Route>
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Routes>
        </div>
      </div>
      {/* Footer */}
      <Footer />
      </div>
    </div>
  )
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

export default connect( mapStateToProps, mapDispatchToProps )(App)