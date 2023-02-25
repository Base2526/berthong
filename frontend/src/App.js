import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import moment from "moment";
import React, { useCallback, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

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

import {
  AMDINISTRATOR, AUTHENTICATED, WS_CLOSED, WS_CONNECTED, WS_CONNECTION, WS_SHOULD_RETRY
} from "./constants";

const App =(props) =>{
  const client = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  let intervalPing = useRef(null);

  let { ws, user, editedUserBalace, editedUserBalaceBook } = props

  console.log("ws :", location)

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
      case WS_CONNECTED :{
        return <div />
      }
      case WS_CONNECTION :
      case WS_SHOULD_RETRY: {
        return <div className="ws">server กำลังทำการเชื่อมต่อ <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      }

      case WS_CLOSED:{
        return <div className="ws">server มีปัญหา <button onClick={(evt)=>navigate(0)}>Refresh</button></div>
      }
    }
  }

  return (
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
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user, ws: state.ws }
};

const mapDispatchToProps = {
  editedUserBalace,
  editedUserBalaceBook
}
export default connect( mapStateToProps, mapDispatchToProps )(App);
