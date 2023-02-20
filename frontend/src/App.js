import './App.css';
import React, { useEffect, useRef, useCallback} from "react";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import moment from "moment";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash"

import { getHeaders } from "./util"
import { gqlPing, subscriptionMe, querySuppliers, querySupplierById } from "./gqlQuery"
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth"
import LoginPage from "./LoginPage"
import HomePage from "./HomePage";
import DetailPage from "./DetailPage";
import SuppliersPage from "./SuppliersPage";
import SupplierPage from "./SupplierPage";
import SupplierProfilePage from "./SupplierProfilePage";
import MePage from "./MePage"
import DepositsPage from "./DepositsPage"
import WithdrawsPage from "./WithdrawsPage"
import DepositPage from "./DepositPage"
import WithdrawPage from "./WithdrawPage"
import BanksPage from "./BanksPage"
import BankPage from "./BankPage"
import ProfileBankPage from "./ProfileBankPage"
import UsersPage from "./UsersPage"
import UserPage from "./UserPage"
import HistoryTransitionsPage from "./HistoryTransitionsPage"
import BookBuysPage from "./BookBuysPage"
import DateLotterysPage from "./DateLotterysPage"
import DateLotteryPage from "./DateLotteryPage"

const App =(props) =>{
  let client = useApolloClient();
  let location = useLocation();
  let intervalPing = useRef(null);

  let { user, editedUserBalace, editedUserBalaceBook } = props

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
  }, []);

  const ProtectedRoute = ({ user, redirectPath = '/' }) => {
    if (_.isEmpty(user)) {
      return <Navigate to={redirectPath} replace />;
    }
  
    return <Outlet />;
  };

  return (
      <div className="App">
        <div className="container">
          <div className="row">
            <Routes>
              <Route path="/" exact element={<HomePage />} />
              <Route path="/p" element={<DetailPage />} />
              <Route path="/user/login" element={<LoginPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/supplier" element={<SupplierPage />} />
              <Route path="/profile" element={<SupplierProfilePage />}/>
              <Route element={<ProtectedRoute user={user} />}>
                <Route path="/me" element={<MePage />} />
                <Route path="/deposits" element={<DepositsPage />} />
                <Route path="/deposit" element={<DepositPage />} />
                <Route path="/withdraws" element={<WithdrawsPage />} />
                <Route path="/withdraw" element={<WithdrawPage />} />
                <Route path="/banks" element={<BanksPage />} />
                <Route path="/bank" element={<BankPage />} />
                <Route path="/history-transitions" element={<HistoryTransitionsPage />} />
                <Route path="/me+bank" element={<ProfileBankPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/book+buys" element={<BookBuysPage />} />
                <Route path="/date-lotterys" element={<DateLotterysPage />} />
                <Route path="/date-lottery" element={<DateLotteryPage />} />
              </Route>
              <Route path="*" element={<p>There's nothing here: 404!</p>} />
            </Routes>
          </div>
        </div>
      </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user }
};

const mapDispatchToProps = {
  editedUserBalace,
  editedUserBalaceBook
}
export default connect( mapStateToProps, mapDispatchToProps )(App);
