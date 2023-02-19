import React, { useState, useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash"

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

const PrivatePage =(props) => {
//   let { path, url } = useRouteMatch();

  return !_.isEmpty(props.user)
        ?   <Routes>
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
            </Routes>
        : <Route path="*" element={<Navigate to="/" replace />} />
}

const mapStateToProps = (state, ownProps) => {
    return {
      user: state.auth.user,
    }
};

export default connect( mapStateToProps, null )(PrivatePage);
