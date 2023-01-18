import BankModel from './BankModel'
import PostModel from './PostModel'
import RoleModel from './RoleModel'
import SocketModel from './SocketModel'
import UserModel from './UserModel'
import CommentModel from './CommentModel'
import MailModel from './MailModel'
import BookmarkModel from './BookmarkModel'
import ReportModel from './ReportModel'

import tReportModel from "./tReportModel"

import ShareModel from "./ShareModel"
import DblogModel from "./DblogModel"

import ConversationModel from "./ConversationModel"

import MessageModel from "./MessageModel"

import BasicContentModel from "./BasicContentModel"

import FollowModel from "./FollowModel"

import SessionModel from "./SessionModel"

import NotificationModel from "./NotificationModel"

import PhoneModel from "./PhoneModel"

module.exports =  {
    Bank:BankModel,
    Post:PostModel,
    Role:RoleModel,
    Socket:SocketModel,
    User:UserModel,
    Comment:CommentModel,
    Mail:MailModel,
    Bookmark:BookmarkModel,
    Report:ReportModel,

    tReport:tReportModel,

    Share:ShareModel,
    Dblog:DblogModel,

    Conversation: ConversationModel,

    Message: MessageModel,

    BasicContent: BasicContentModel,

    Follow: FollowModel,

    Session: SessionModel,

    Notification: NotificationModel,

    Phone: PhoneModel
};