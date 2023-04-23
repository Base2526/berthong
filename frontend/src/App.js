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
  // Login as LoginIcon
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
  CgProfile as ProfileIcon
} from "react-icons/cg"
import {
  MdOutlineBookmarkAdded as MdOutlineBookmarkAddedIcon
} from "react-icons/md"
import {
  FiLogIn as LoginIcon
} from "react-icons/fi"
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
import _ from "lodash"

import TaxonomyBankPage from "./TaxonomyBankPage";
import TaxonomyBanksPage from "./TaxonomyBanksPage";
import MeBookBuysPage from "./MeBookBuysPage";
import DateLotteryPage from "./DateLotteryPage";
import DateLotterysPage from "./DateLotterysPage";
import DepositPage from "./DepositPage";
import DepositsPage from "./DepositsPage";
import DetailPage from "./pages/detail/Detail";
import HistoryTransitionsPage from "./HistoryTransitionsPage";
import HomePage from "./HomePage";
import AdminHomePage from "./AdminHomePage";
import LoginPage from "./LoginPage";
import MePage from "./MePage";
import BankPage from "./BankPage";
import BanksPage from "./BanksPage";
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth";
import SupplierPage from "./SupplierPage";
import FriendPage from "./FriendPage";
import SuppliersPage from "./SuppliersPage";
import UserPage from "./UserPage";
import UsersPage from "./UsersPage";
import { checkRole, getHeaders, handlerErrorApollo, showToast} from "./util";
import WithdrawPage from "./WithdrawPage";
import WithdrawsPage from "./WithdrawsPage";
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
          mutationSupplier,
          mutationNotification,
          mutationDeposit,
          queryBanks,
          queryBankById,
          queryDeposits,
          queryWithdraws,
          mutationSubscribe,
          queryFriendProfile,
          mutationMe, 
          queryMe,
          mutationDatesLottery, 
          queryDateLotterys, 
          queryDateLotteryById
        } from "./gqlQuery"
          
import * as Constants from "./constants"
import { update_profile as updateProfile, logout } from "./redux/actions/auth";

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
      backgroundColor: "#5F73DF",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "blue"
      }
    },
    "&$selected:hover": {
      backgroundColor: "#5F73DF",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "blue"
      }
    },
    "&:hover": {
      backgroundColor: "#EBECF4",
      color: "black",
      "& .MuiListItemIcon-root": {
        color: "blue"
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
  let [openMenuProfile, setOpenMenuProfile] = useState(null);
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openDialogLogout, setOpenDialogLogout] = useState(false);
  const [openDialogDeleteBank, setOpenDialogDeleteBank] = useState({ open: false, id: 0});
  const [dialogLogin, setDialogLogin] = useState(false);
  const [lightbox, setLightbox]       = useState({ isOpen: false, photoIndex: 0, images: [] });
  let [notifications, setNotifications] =useState([])
  let [search, setSearch] = useState(Constants.INIT_SEARCH)
  let { ws, user, updateProfile, editedUserBalace, editedUserBalaceBook, logout } = props

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
            showToast("info", `Bookmark`)
            break
          }
  
          case "UNFOLLOW":{
            showToast("info", `Un-Bookmark`)
            break
          }
        }

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
      }
    },
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (error) => {
      return handlerErrorApollo( props, error )
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
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationBuy, resultMutationBuy] = useMutation(mutationBuy,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {buy}}) => {
      let { status, data } = buy

      console.log("")
         
      // ////////// update cache queryUserById ///////////
      // let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: data._id}});
      // if(querySupplierByIdValue){
      //   cache.writeQuery({
      //     query: querySupplierById,
      //     data: { supplierById: {...querySupplierByIdValue.supplierById, data} },
      //     variables: {id: data._id}
      //   });
      // }
      // ////////// update cache queryUserById ///////////    

      // ////////// update cache querySuppliers ///////////
      // let suppliersValue = cache.readQuery({ query: querySuppliers });
      // if(!_.isNull(suppliersValue)){
      //   console.log("suppliersValue :", suppliersValue)
      // }
      // ////////// update cache querySuppliers ///////////
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

  const [onMutationComment, resultMutationComment] = useMutation(mutationComment,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {comment}}) => {
      let { status, commentId, data } = comment

      console.log("comment > update :", comment)

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
    onError: (error) => {
      return handlerErrorApollo( props, error ) 
    }
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
    update: (cache, {data:{login}}) => {
      let {status, data, sessionId} = login
      if(status){
        localStorage.setItem('token', sessionId)

        updateProfile(data)
        // onComplete()

        setDialogLogin(false);
      }
    },
    onCompleted(data) {
      console.log("onCompleted :", data)

      window.location.reload();
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationLoginWithSocial, resultMutationLoginWithSocial] = useMutation(mutationLoginWithSocial, 
    {
      update: (cache, {data: {loginWithSocial}}) => {

        // console.log("loginWithSocial :", loginWithSocial)
        // const data1 = cache.readQuery({ query: gqlBanks });

        let {status, data, sessionId} = loginWithSocial

        if(status){
          localStorage.setItem('token', sessionId)

          // onComplete(data)

          setDialogLogin(false);
        }

        // let newBanks = {...data1.banks}
        // let newData  = _.map(newBanks.data, bank=>bank._id == updateBank._id ? updateBank : bank)

        // newBanks = {...newBanks, data: newData}
        // cache.writeQuery({
        //   query: gqlBanks,
        //   data: { banks: newBanks },
        // });
      },
      onCompleted(data) {
        // history.push("/");
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

      if(status){
        switch(mode){
          case "delete":{
            let data1 = cache.readQuery({ query: queryWithdraws });
            let dataFilter =_.filter(data1.withdraws.data, (item)=>data._id != item._id)

            cache.writeQuery({
              query: queryWithdraws,
              data: { withdraws: {...data1.withdraws, data: dataFilter} }
            });

            // handleClose()
            break;
          }
        }
      }
    },
    onCompleted(data) {
      // history.goBack()
    },
    onError(error){
      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationBank, resultMutationBankValues] = useMutation(mutationBank
    , {
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

  const [onMutationSupplier, resultSupplier] = useMutation(mutationSupplier, {
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
        console.log(error)
    }
  });

  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {deposit}}) => {
      let { data, mode, status } = deposit
      if(status){
        switch(mode){
          // case "new":{
          //   const queryDepositsValue = cache.readQuery({ query: queryDeposits });
          //   if(!_.isNull(queryDepositsValue)){
          //     let newData = [...queryDepositsValue.deposits.data, data];

          //     cache.writeQuery({
          //       query: queryDeposits,
          //       data: { deposits: {...queryDepositsValue.deposits, data: newData} }
          //     });
          //   }
          //   break;
          // }

          case "edit":{
            let queryDepositsValue = cache.readQuery({ query: queryDeposits });
            if(!_.isNull(queryDepositsValue)){
              let newData = _.map(queryDepositsValue.deposits.data, (item)=> item._id == data._id ? data : item ) 

              if(deposit.data.status == "approved" || deposit.data.status == "reject"){
                newData = _.filter(queryDepositsValue.deposits.data, (item)=> item._id != data._id ) 
              }

              cache.writeQuery({
                query: queryDeposits,
                data: { deposits: {...queryDepositsValue.deposits, data: newData} }
              });
            }
            break;
          }
        }
      }
    },
    onCompleted(data) {
      if(_.isEqual(checkRole(user) , Constants.AMDINISTRATOR)){
        navigate(-1);
      }else {
        showToast("success", "ได้รับเรื่องแล้ว กำลังดำเนินการ")
        navigate("/");
      }
    },
    onError(error){
      console.log("onError :", error?.message)
      showToast("error", error?.message)
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
    update: (cache, {data:{ me }}) => {
      let { status, data } = me
      if(status){
        updateProfile(data)
      }

      // if(me.status){
      //   const queryMeValue = cache.readQuery({ query: queryMe });
      //   if(!_.isNull(queryMeValue)){
      //     cache.writeQuery({
      //       query: queryMe,
      //       data: { me: {...queryMeValue.me, data: me.data} }
      //     });
      //   }
      // }
    },
    onCompleted(data) {
      let {type, mode} = data?.me
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
    },
    onError(error){
      console.log("onError :", error)
    }
  });

  // const [onMutationMe_bank, resultonMutationMe_bank] = useMutation(mutationMe_bank, {
  //   context: { headers: getHeaders(location) },
  //   update: (cache, {data: {me_bank}}) => {
  //     let { status, data } = me_bank
  //     if(status){
  //       updateProfile(data)
  //     }
  //   },
  //   onCompleted(data) {
  //     if(data?.me_bank?.mode === "new"){
  //       showToast("success", `Add bank success`)
  //       navigate(-1)
  //     }else{
  //       showToast("success", `Delete bank success`)
  //       setOpenDialogDeleteBank({ open: false, id: ""})  
  //     } 
  //   },
  //   onError(error){
  //     return handlerErrorApollo( props, error )
  //   }
  // });

  // const [onMutationMe_profile, resultonMutationMe_profile] = useMutation(mutationMe_profile, {
  //   context: { headers: getHeaders(location) },
  //   update: (cache, {data: {me_profile}}) => {
  //     let { status, data } = me_profile
  //     if(status){
  //       updateProfile(data)
  //     }
  //   },
  //   onCompleted(data) {
  //     showToast("success", `Update profile success`)
  //   },
  //   onError(error){
  //     return handlerErrorApollo( props, error )
  //   }
  // });

  const [onMutationDateLottery, resultMutationDateLotteryValues] = useMutation(mutationDatesLottery
    , {
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

  useEffect(()=>{
    console.log("search :", search)
  }, [search])

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
                // {id: 7, title:"บัญชีธนาคาร", icon: <AccountBalanceWalletIcon size="1.5em" />, path: "/banks"},
                {id: 8, title:"Logout", icon: <LogoutIcon size="1.5em"/>, path: "/logout"}]
      }
      case Constants.AUTHENTICATED:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"รายการ จอง-ซื้อ", icon: <AssistantIcon />, path: "/book-buy"},
                {id: 2, title:"แจ้งฝากเงิน", icon: <AdjustIcon />, path: "/deposit"},
                {id: 3, title:"แจ้งถอนเงิน", icon: <AlternateEmailIcon />, path: "/withdraw"},
                {id: 4, title:"ประวัติการ ฝาก-ถอน", icon: <AiOutlineHistory size="1.5em" />, path: "/history-transitions"},
                // {id: 5, title:"บัญชีธนาคาร", icon: <AccountBalanceWalletIcon size="1.5em" />, path: "/bank"},
                // {id: 6, title:"ติดต่อเรา", icon: <GrContactInfoIcon size="1.5em" />, path: "/contact-us"},
                {id: 7, title:"Logout", icon: <LogoutIcon  size="1.5em"/>, path: "/logout"}]
      }
      default:{
        return [{id: 0, title:"หน้าหลัก", icon: <HomeIcon size="1.5em" />, path: "/"},
                {id: 1, title:"ติดต่อเรา", icon: <GrContactInfoIcon size="1.5em" />, path: "/contact-us"},
                {id: 2, title:"Login", icon: <LoginIcon size="1.5em"  />, path: "/login"}]
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

  return (
    <div className="App">
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
            onComplete={async(data)=>{
              setDialogLogin(false);
              
            }}
            onClose={() => {
              setDialogLogin(false);
            }}
            onMutationLogin={(evt)=>onMutationLogin(evt)}
            onMutationLoginWithSocial={(evt)=>onMutationLoginWithSocial(evt)}/>
      }
      {
        openDialogDeleteBank.open
        && <DialogDeleteBankComp 
            {...props} 
            // open={openDialogDeleteBank.open} 
            data={ openDialogDeleteBank }
            onDelete={(evt)=>{
              onMutationMe({ variables: { input: { type: "bank", mode: "delete", data: evt } } })
            }}
            onClose={()=>setOpenDialogDeleteBank({ open: false, id: ""})}/>
      }

{/* 
  // DialogDeleteBankComp
  const [openDialogDeleteBank, setOpenDialogDeleteBank] = useState(false);
*/}

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
                  <Typography variant="h6" noWrap onClick={()=>navigate("/")}><div className="fnt">{ REACT_APP_SITE_TITLE }</div></Typography>
                  {
                    !_.isEmpty(user) && checkRole(user) === Constants.AUTHENTICATED 
                    ? <Stack direction={"row"} spacing={2} alignItems="center">
                        <IconButton 
                          size={'small'}
                          onClick={()=> navigate("/notifications") }>
                          <Badge badgeContent={_.map(notifications, i=>i.unread).length} color="primary">
                            <MdCircleNotificationsIcon color={ _.isEqual(location?.pathname, "/notifications") ? "red" : "white" }  size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton 
                          size={'small'}
                          onClick={()=> navigate("/book-buy")}>
                          <Badge badgeContent={user?.inTheCarts ? user?.inTheCarts?.length : 0} color="primary">
                            <FiShoppingCart color={ _.isEqual(location?.pathname, "/book-buy") ? "red" : "white" } size="1.2em"/>
                          </Badge>
                        </IconButton>
                        <IconButton 
                          size={'small'}
                          onClick={()=> navigate("/bookmarks")}>
                          <MdOutlineBookmarkAddedIcon color={ _.isEqual(location?.pathname, "/bookmarks") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton 
                          size={'small'}
                          onClick={()=> navigate("/subscribes")}>
                          <SlUserFollowing color={ _.isEqual(location?.pathname, "/subscribes") ? "red" : "white" } size="1.2em"/>
                        </IconButton>
                        <IconButton 
                          size={'small'}
                          onClick={(evt)=> setOpenMenuProfile(evt.currentTarget) }>
                          <Avatar 
                            src={ !_.isEmpty(user?.avatar) ? user?.avatar?.url : "" }
                            alt="profile"
                          />
                        </IconButton>
                      </Stack>
                    : <Stack direction={"row"} spacing={2} alignItems="center">
                         <IconButton 
                          size={'small'}
                          onClick={()=>{ setDialogLogin(true) }}>
                          <LoginIcon color="white" size="1.2em"/>
                        </IconButton>
                      </Stack>
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
              <Typography variant="caption" display="block" gutterBottom><div className="text-center p-1">© 2023 BERTHONG LLC</div></Typography>
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
                                                onMutationFollow={(evt)=>onMutationFollow(evt)} />} />
            <Route path="/d" element={<DetailPage 
                                        {...props}
                                        onLogin={()=>setDialogLogin(true)} 
                                        onLightbox={(evt)=>setLightbox(evt)} 
                                        onMutationFollow={(evt)=>onMutationFollow(evt)}
                                        onMutationBook={(evt)=>onMutationBook(evt)}
                                        onMutationBuy={(evt)=>{
                                          console.log("onMutationBuy :", evt)
                                        }}
                                        onMutationComment={(evt)=>onMutationComment(evt)}/>} />
            <Route path="/user/login" element={<LoginPage {...props} />} />
            <Route path="/suppliers" element={<SuppliersPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
            <Route path="/supplier" element={<SupplierPage {...props} onMutationSupplier={(evt)=>onMutationSupplier(evt)} />} />
            <Route path="/p" element={<FriendPage 
                                        {...props} 
                                        onLogin={()=>setDialogLogin(true)}
                                        onLightbox={(value)=>setLightbox(value)} 
                                        onMutationSubscribe={(evt)=>{ onMutationSubscribe(evt) }} />}/>
            <Route path="/login-with-line" element={<LoginWithLine />}  />
            <Route path="/contact-us" element={<ContactUsPage onMutationContactUs={(evt)=>onMutationContactUs(evt)} />}  />
            <Route element={<ProtectedAuthenticatedRoute user={user} />}>
              <Route path="/me" element={<MePage 
                                          {...props} 
                                          onDialogDeleteBank={(id)=>setOpenDialogDeleteBank({open: true, id})} 
                                          onMutationMe={(evt)=>onMutationMe(evt)}
                                          onLightbox={(evt)=>setLightbox(evt)} />} />
              <Route path="/deposit" element={<DepositPage {...props} onMutationDeposit={(evt)=>onMutationContactUs(evt)} />} />
              <Route path="/withdraw" element={<WithdrawPage {...props} />} />
              <Route path="/history-transitions" {...props} element={<HistoryTransitionsPage {...props} />} />
              <Route path="/bank" element={<BankPage {...props} onMutationMe={(evt)=>onMutationMe(evt)} />} />
              <Route path="/banks" element={<BanksPage {...props} />} />
              <Route path="/book-buy" element={<MeBookBuysPage {...props} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/notifications" element={<NotificationsPage {...props} onMutationNotification={(evt)=>onMutationNotification(evt)} />} />
              <Route path="/bookmarks" element={<BookMarksPage {...props} onMutationFollow={(evt)=>onMutationFollow(evt) } />} />
              <Route path="/subscribes" element={<SubscribesPage {...props} onMutationSubscribe={(evt)=>onMutationSubscribe(evt)} />} />
            </Route>
            <Route element={<ProtectedAdministratorRoute user={user} />}>
              <Route path="/deposits" element={<DepositsPage {...props} onLightbox={(value)=>setLightbox(value)} onMutationDeposit={(evt)=>onMutationDeposit(evt)} />} />
              <Route path="/withdraws" element={<WithdrawsPage {...props} onMutationWithdraw={(evt)=>onMutationWithdraw(evt)} onLightbox={(value)=>setLightbox(value)} />} />
              <Route path="/date-lotterys" element={<DateLotterysPage onMutationDatesLottery={(evt)=>onMutationDatesLottery(evt)}  />} />
              <Route path="/date-lottery" element={<DateLotteryPage onMutationDateLottery={(evt)=>onMutationDateLottery(evt)}/>} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/taxonomy-banks" element={<TaxonomyBanksPage />} />
              <Route path="/taxonomy-bank" element={<TaxonomyBankPage  {...props} onMutationBank={(evt)=>onMutationBank(evt)}/>} />
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

export default connect( mapStateToProps, mapDispatchToProps )(App)