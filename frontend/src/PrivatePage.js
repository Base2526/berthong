// import "./styles.css";
import React, { useState, useEffect } from "react";
import { Redirect, Link, Switch, Route, useRouteMatch } from "react-router-dom";

// import BankList from "./pages/bankList/BankList";
// import Bank from "./pages/bank/Bank";
// import RoleList from "./pages/roleList/RoleList";
// import Role from "./pages/role/Role";
// import Devel from "./pages/devel/Devel";
// import Notification from "./pages/notification"
// import Message from "./pages/message/MessagePage"
// import BookmarkList from "./pages/bookmarkList/BookmarkList"
// import ReportList from "./pages/reportList/ReportList"
// import TReport from "./pages/taxonomy/tReport/TReport"
// import TReportList from "./pages/taxonomy/tReportList/TReportList"
// import ThemeMailList from "./pages/themeMailList/ThemeMailList";
// import ThemeMail from "./pages/themeMail/ThemeMail";
// import ShareList from "./pages/shareList/ShareList"
// import DblogList from "./pages/dblogList/DblogList"
// import ProductList from "./pages/productList/ProductList";
// import Product from "./pages/product/Product";
// import NewProduct from "./pages/newProduct/NewProduct";
// import PostList from "./pages/postList/PostList";
// import Post from "./pages/post/Post";
// import CommentList from "./pages/commentList/CommentList";
// import Comment from "./pages/comment/Comment";
// import SocketList from "./pages/socketList/SocketList";
// import Socket from "./pages/socket/Socket";
// import UserList from "./pages/userList/UserList";
// import UserNew from "./pages/user/UserNew";
// import UserEdit from "./pages/user/UserEdit";
// import BasicContentList from "./pages/basicContentList/BasicContentList"
// import BasicContent from "./pages/basicContent/BasicContent"
// import Profile from "./pages/profile"
// import Upload from "./pages/test/Upload"
// import Phone from "./pages/phone/Phone"
// import PhoneList from "./pages/phoneList/PhoneList"
// import ContactUs from "./pages/contactUs/ContactUs"
// import ContactUsList from "./pages/contactUs/ContactUsList"
// import LoginPage from "./pages/auth/Login"

// import { isAuth } from "./AuthProvider";

import ProfilePage from "./ProfilePage"
import DepositsPage from "./DepositsPage"
import WithdrawsPage from "./WithdrawsPage"

import DepositPage from "./DepositPage"
import WithdrawPage from "./WithdrawPage"

import BanksPage from "./BanksPage"
import BankPage from "./BankPage"

// import ProfileBanksPage from "./ProfileBanksPage"
import ProfileBankPage from "./ProfileBankPage"

import UsersPage from "./UsersPage"
import UserPage from "./UserPage"


import { connect } from "react-redux";
import _ from "lodash"

const PrivatePage =(props) => {
  let { path, url } = useRouteMatch();
//   console.log("path :", path);


  return !_.isEmpty(props.user)
        ?   <Switch>
                <Route path="/me">
                    <ProfilePage />
                </Route>
                <Route path="/deposits">
                    <DepositsPage />
                </Route>
                <Route path="/deposit">
                    <DepositPage />
                </Route>

                <Route path="/withdraws">
                    <WithdrawsPage />
                </Route>
                <Route path="/withdraw">
                    <WithdrawPage />
                </Route>

                <Route path="/banks">
                    <BanksPage />
                </Route>

                <Route path="/bank">
                    <BankPage />
                </Route>

                {/* <Route path="/me+banks">
                    <ProfileBanksPage />
                </Route> */}

                <Route path="/me+bank">
                    <ProfileBankPage />
                </Route>

                <Route path="/users">
                    <UsersPage />
                </Route>

                <Route path="/user">
                    <UserPage />
                </Route>


                {/*
                <Route path="/user/:id/edit">
                    <UserEdit />
                </Route>
                <Route path="/user/new"> 
                    <UserNew />
                </Route>
                <Route path="/posts">
                    <PostList />
                </Route>
                <Route path="/post/:id/:mode">
                    <Post />
                </Route>
                <Route path="/post/:mode">
                    <Post />
                </Route>
                <Route path="/comments">
                    <CommentList />
                </Route>
                <Route path="/comment/:id/:mode">
                    <Comment />
                </Route>
                <Route path="/comment/:mode">
                    <Comment />
                </Route>
                <Route path="/sockets">
                    <SocketList />
                </Route>
                <Route path="/socket/:id">
                    <Socket />
                </Route>
                <Route path="/devel">
                    <Devel />
                </Route>
                <Route path="/roles">
                    <RoleList />
                </Route>
                <Route path="/role/:id/:mode">
                    <Role />
                </Route>
                <Route path="/role/:mode">
                    <Role />
                </Route>
                <Route path="/banks">
                    <BankList />
                </Route>
                <Route path="/bank/:id/:mode">
                    <Bank />
                </Route>
                <Route path="/bank/:mode">
                    <Bank />
                </Route>
                <Route path="/theme-mails">
                    <ThemeMailList />
                </Route>
                <Route path="/theme-mail/:id/:mode">
                    <ThemeMail />
                </Route>
                <Route path="/theme-mail/:mode">
                    <ThemeMail />
                </Route>
                <Route path="/treport-list">
                    <TReportList />
                </Route>
                <Route path="/treport/:id/:mode">
                    <TReport />
                </Route>
                <Route path="/treport/:mode">
                    <TReport />
                </Route>
                <Route path="/notification">
                    <Notification />
                </Route>
                <Route path="/message">
                    <Message />
                </Route>
                <Route path="/bookmarks">
                    <BookmarkList />
                </Route>
                <Route path="/report">
                    <ReportList />
                </Route>
                <Route path="/shares">
                    <ShareList />
                </Route>
                <Route path="/dblog">
                    <DblogList />
                </Route>
                <Route path="/basic-contents">
                    <BasicContentList />
                </Route>
                <Route path="/basic-content/:id/:mode">
                    <BasicContent />
                </Route>
                <Route path="/basic-content/:mode">
                    <BasicContent />
                </Route>
                <Route path="/upload">
                    <Upload />
                </Route>
                <Route path="/phone/:id/:mode">
                    <Phone />
                </Route>
                <Route path="/phone/:mode">
                    <Phone />
                </Route>
                <Route path="/phones">
                    <PhoneList />
                </Route>
                <Route path="/contact-us/:id/:mode">
                    <ContactUs />
                </Route>
                <Route path="/contact-us/:mode">
                    <ContactUs />
                </Route>
                <Route path="/contact-us-list">
                    <ContactUsList />
                </Route> */}
            </Switch>
        :   <Redirect to="/" />
  
}

const mapStateToProps = (state, ownProps) => {
    return {
      user: state.auth.user,
    }
};

export default connect( mapStateToProps, null )(PrivatePage);
