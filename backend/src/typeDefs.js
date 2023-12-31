import { gql } from "apollo-server";

export default gql`
  scalar DATETIME
  scalar Long
  scalar Date
  scalar JSON

  scalar Upload

  type FileX {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  
  type Room {
    _id: ID
    name: String
    summary: String
    description: String
    roomType: String
    maximum_nights: Int
    minimum_nights: Int
    beds: Int
    accommodates: Int
    price: Float
    cleaningFee: Float
  }

  type User {
    _id: ID!
    username: String!
    password: String
    email: String
    displayName: String!
    isActive: Int
    roles: [String]!
    bookmarks: [Bookmark]
    image: [File]
    lastAccess: DATETIME
  }

  type LoginWithSocial{
    _id: ID!
  }

  input UserInput {
    username: String!
    password: String!
    email: String!
    roles: [String]
    isActive: Int
    image: [FileInput]
  }

  input SearchInput{
    PAGE: Int
    LIMIT: Int
    NUMBER: String
    TITLE: String
    DETAIL: String
    PRICE: Int
    CHK_BON: Boolean
    CHK_LAND: Boolean
    CHK_MONEY: Boolean
    CHK_GOLD: Boolean
  }

  input PagingInput{
    OFF_SET: Int!
    LIMIT: Int!
  }

  input LoginInput {
    username: String!
    password: String!
    deviceAgent: String
  }

  input RegisterInput {
    username: String!
    password: String!
    email: String!
    displayName: String
    avatar: FileInput
  }

  enum AuthType {
    GOOGLE
    GITHUB
    FACEBOOK
  }

  input LoginWithSocialInput{
    authType: AuthType!    # 
    data: JSON!            # for github
    deviceAgent: JSON
  }

  type RoomPayLoad {
    status:Boolean
    data:Room
  }
  
  type RoomsPayLoad {
    status:Boolean
    data:[Room]
  }

  type UserPayLoad {
    status:Boolean
    messages:String
    token:String
    executionTime:String
    data:User
  }

  type UsersPayLoad {
    status: Boolean
    executionTime: String
    data: [User]
    total: Int
  }

  type File {
    _id: ID!
    base64: String
    fileName: String
    lastModified: DATETIME
    size: Int
    type: String
  }

  type PostBank {
    _id: ID!
    bankAccountName: String
    bankId: String
  }

  type PostBankBank {
    _id: ID
    name: String!
    description: String
    isPublish: Int
  }
  
  type Post {
    _id: ID!
    title: String!
    nameSubname: String!
    idCard: Long
    amount: Int
    dateTranfer: DATETIME
    description: String!
    tels: [String]
    banks: [PostBank]
    follows: [ID]
    shares:[Share]
    files: [File]
    isPublish: Int
    ownerId: ID!
    createdAt : DATETIME
    updatedAt: DATETIME
  }

  type Role {
    _id: ID
    name: String
    description: String
    isPublish: Int
  }

  type Bank {
    _id: ID!
    name: String!
    description: String
  }

  type BasicContent {
    _id: ID!
    name: String!
    description: String
  }

  type TReport {
    _id: ID!
    name: String!
    description: String
  }

  type Share {
    _id: ID!
    userId: ID!
    postId: ID!
    destination: String
  }

  type Dblog {
    _id: ID!
    level: String
    meta: String
    message: String
    timestamp: String
  }

  type Conversation {
    _id: ID!
    userId: String
    name: String
    lastSenderName: String
    info: String
    avatarSrc: String
    avatarName: String
    status: String
    unreadCnt: Int
    sentTime: DATETIME
    members: [String]
  }

  type Message {
    _id: ID!
    conversationId: String!
    type: String!
    message: String
    sentTime: String
    sender: String!
    senderId: String!
    direction: String
    position: String!
    status: String!
  }

  type Mail {
    _id: ID!
    name: String!
    description: String
    isPublish: Int
  }

  type Socket {
    _id: ID!
    socketId: String!
    description: String
  }

  type Comment{
    status: Boolean
    executionTime: String
    data: [CommentParent]
  }

  type CommentData{
    _id: ID!
    postId: ID!
    data: [CommentParent]
  }

  type Bookmark{
    _id: ID
    userId: ID
    postId: ID
    status: Boolean
  }

  type Follow{
    _id: ID
    userId: ID
    friendId: ID
    status: Boolean
  }

  type Share{
    _id: ID!
    userId: ID!
    postId: ID!
    destination: String
  }

  type Report {
    _id: ID!
    postId: String!
    categoryId: String!
    userId: String!
    description: String
  }

  type PostPayLoad {
    status:Boolean
    executionTime:String
    data:Post
  }
  
  type PostsPayLoad {
    status:Boolean
    executionTime:String
    data:[Post]
    total: Int
  }

  type RolePayLoad {
    status:Boolean
    executionTime:String
    data:Role
  }

  type RolesPayLoad {
    status:Boolean
    executionTime:String
    data:[Role]
  }

  type BankPayLoad {
    status:Boolean
    executionTime:String
    data:Bank
  }

  type BanksPayLoad {
    status:Boolean
    executionTime:String
    data:[Bank]
  }

  type BasicContentPayLoad {
    status:Boolean
    executionTime:String
    data:BasicContent
  }

  type BasicContentsPayLoad {
    status:Boolean
    executionTime:String
    data:[BasicContent]
  }

  type TReportPayLoad {
    status:Boolean
    executionTime:String
    data:TReport
  }

  type TReportListPayLoad {
    status:Boolean
    executionTime:String
    data:[TReport]
  }

  type MailPayLoad {
    status:Boolean
    executionTime:String
    data:Mail
  }

  type MailsPayLoad {
    status:Boolean
    executionTime:String
    data:[Mail]
  }

  type SocketPayLoad {
    status:Boolean
    executionTime:String
    data:Socket
  }

  type SocketsPayLoad {
    status:Boolean
    executionTime:String
    data:[Socket]
  }

  type CommentPayLoad{
    status:Boolean
    executionTime:String
    data:[CommentParent]
  }

  type CommentParent {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
    replies: [Replies]
  }

  type Replies {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
  }

  type CommentsPayLoad{
    status:Boolean
    executionTime:String
    data:[Comment]
    total: Int
  }

  type BookmarksPayLoad{
    status:Boolean
    executionTime:String
    data:[Bookmark]
  }

  type BookmarkPayLoad{
    status:Boolean
    executionTime:String
    data:Bookmark
  }

  type FollowPayLoad{
    status:Boolean
    executionTime:String
    data:Follow
  }

  type FollowsPayLoad{
    status:Boolean
    executionTime:String
    data:[Follow]
  }

  type SharesPayLoad{
    status:Boolean
    executionTime:String
    data:[Share]
  }

  type DblogPayLoad{
    status:Boolean
    executionTime:String
    data:[Dblog]
  }

  type ReportListPayLoad{
    status:Boolean
    executionTime:String
    data:[Report]
  }

  type ConversationsPayLoad {
    status:Boolean
    executionTime:String
    data:[Conversation]
  }

  type MessagePayLoad {
    status:Boolean
    executionTime:String
    data:[Message]
  }

  type Query {
    me: JSON
    checkWalletByUserId(_id: ID): JSON
    ping: JSON
    checkCacheById(_id: ID): JSON
    checkUser: JSON 
    users(input: PagingInput): JSON
    userById(_id: ID): JSON
    roleByIds(input: [String]): JSON
    homes: JSON
    suppliers( input:SearchInput ): JSON
    supplierById(_id: ID!): JSON
    banks: JSON
    bankById(_id: ID!): JSON
    bankByIds(_ids: [ID]!): JSON
    bookBuyTransitions: JSON
    historyTransitions: JSON
    friendProfile(_id: ID): JSON
    buyById(_id: ID): JSON
    buys: JSON
    notifications: JSON
    commentById(_id: ID!): JSON
    bookmarks: JSON
    subscribes: JSON
    dblog: JSON
    dateLotterys: JSON
    dateLotteryById(_id: ID!): JSON
    producers: JSON
    manageLotterys: JSON
    manageLotteryById(_id: ID!): JSON
    deposits( input: JSON ): JSON
    withdraws( input: JSON ): JSON
    adminHome: JSON
    adminBanks: JSON
    adminDeposits: JSON
    adminWithdraws: JSON
    manageSuppliers: JSON

    message(conversationId: ID!, startId: ID): JSON
    conversations: JSON

    contents: JSON
    contentById(_id: ID!): JSON
  }  
  
  input RoomInput {
    name: String
    summary: String
    description: String
    room_type: String
    maximum_nights: Int
    minimum_nights: Int
    beds: Int
    accommodates: Int
    price: Float
    cleaningFee: Float
  }

  input PostInput {
    title: String!
    nameSubname: String!
    idCard: String
    amount: Long!
    dateTranfer: DATETIME
    description: String
    banks: [PostBankInput]
    tels: [String]
    files: [JSON]
    follows: [ID]
    isPublish: Int
    ownerId: ID!
  }

  input PostBankInput {
    bankAccountName: String
    bankId: String
  }

  input PhoneInput {
    phones: [String!]
    description: String
  }

  input RoleInput {
    name: String!
    description: String
    isPublish: Int
  }

  input BInput {
    id: ID
    name: String!
    description: String
    isPublish: Int
  }

  input MailInput {
    name: String!
    description: String
    isPublish: Int
  }

  enum BankModeType {
    NEW
    EDIT
  }

  input BankInput {
    _id: ID
    mode: BankModeType!
    name: String!
    description: String
  }

  input BasicContentInput {
    name: String!
    description: String
  }

  input ReportInput{
    postId: String!
    categoryId: String!
    userId: ID!
    description: String
  }

  input TReportInput {
    name: String!
    description: String
  }

  input ShareInput {
    userId: ID!
    postId: ID!
    destination: String
  }

  input ConversationInput{
    userId: ID!
    friendId: ID!
  }

  input UpdateConversationInput{
    muted: Boolean
    unread: Int
    title: String
    subtitle: String
    alt: String
    avatar: String
  }

  input MessageInput{
    _id: String!
    conversationId: String!
    type: String!
    message: String
    sentTime: DATETIME
    direction: String
    position: String!
    status: String!
    payload: [JSON]
    files: [Upload]
  }

  input FileInput {
    url: String
    filename: String,
    mimetype: String,
    encoding: String,
  }

  input CommentInput {
    postId: ID!
    data: [CommentParentInput]
  }

  input CommentParentInput {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
    notify: Boolean
    replies: [RepliesInput]
  }

  input RepliesInput {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
    notify: Boolean
  }

  input BookmarkInput {
    postId: ID!
    status: Boolean
  }

  input FollowInput {
    userId: ID!
    friendId: ID!
    status: Boolean
  }

  input BookInput{
    id: ID!
    itemId: Long!
  }

  enum SupplierModeType {
    NEW
    EDIT
    DELETE
  }

  input SupplierInput{
    mode: SupplierModeType!
    _id: ID
    title: String
    price: Int
    priceUnit: Int
    description: String
    consolation: String
    number_lotter: Int
    manageLottery: ID
    files: [JSON]
    condition: Int
    category: Int
    type: Int
    buys: [JSON]
    publish: Boolean = false
    test: Boolean = false
    ownerId: ID
  }

  enum WithdrawModeType {
    NEW
    EDIT
    DELETE
  }

  input WithdrawInput{
    bankId: ID!
    balance: Int!
  }

  enum DepositModeType {
    NEW
    EDIT
    DELETE
  }

  input DepositInput{
    balance: String!
    date: DATETIME
    bankId: String!
    file: JSON!
    remark: String
  }

  input MeInput{
    _id: ID
    username: String
    password: String
    email: String
    displayName: String
    banks:[JSON]
    balance: Long
    isActive: Int
    avatar: FileInput
    lastAccess: Date
    isOnline: Boolean
    socialType: String, 
    socialId: String
    socialObject: String
    balanceBook: Int
  }

  enum DatesLotteryModeType {
    NEW
    EDIT
    DELETE
  }

  enum MessageMode {
    NEW
    EDIT
    DELETE
  }

  enum ConversationMode {
    NEW
    EDIT
    DELETE
  }

  input DatesLotteryInput{
    mode: DatesLotteryModeType!
    _id: ID
    title: String!
    date: Date!
    description: String
  }

  input ContactUsInput{
    title: String!
    description: String!
    files: [JSON]
  }

  input SearchInput{
    CHK_BON: Boolean
    CHK_GOLD: Boolean
    CHK_LAND: Boolean
    CHK_MONEY: Boolean
    PAGE: Int
    TITLE: String
  }

  input ManageLotteryInput{
    mode: String!
    _id: ID
    title: String!
    start_date_time: Date!
    end_date_time: Date!
    bon: String
    lang: String
  }

  type Mutation {
    update_me: JSON
    check_db: JSON
    login(input: LoginInput): JSON
    loginWithSocial(input: LoginWithSocialInput): JSON
    loginWithGithub(code: String!): JSON
    register(input: RegisterInput): JSON
    me(input: JSON): JSON
    book(input: BookInput): JSON
    buy(_id: ID!): JSON
    cancelTransition(_id: ID!): JSON
    lottery(input: SupplierInput): JSON    
    deposit(input: DepositInput): JSON
    withdraw(input: WithdrawInput): JSON 
    bank(input: BankInput): JSON 
    follow(_id: ID!): JSON 
    datesLottery(input: [Date]): JSON 
    notification(_id: ID!): JSON 
    comment(input: JSON): JSON
    contactUs(input: ContactUsInput): JSON
    subscribe(_id: ID!): JSON 
    adminDeposit(input: JSON): JSON 
    adminWithdraw(input: JSON): JSON 

    manageLottery(input: ManageLotteryInput): JSON
    forceLogout(input: JSON): JSON

    expireLottery(input: JSON): JSON
    calculateLottery(input: JSON): JSON

    testNodeCacheSave(id: String): JSON
    testNodeCacheGet(id: String): JSON
    testNodeCacheDelete(id: String): JSON

    search(input: SearchInput): JSON

    crypto(input: JSON):JSON

    conversation( mode: ConversationMode!, _id: ID! ): JSON
    message( mode: MessageMode!, input: JSON ): JSON

    content(input: JSON): JSON
    pay(input: JSON): JSON
    lotteryClone(_id: ID!): JSON 
  }

  type Subscription {
    me(userId: ID!): JSON
    subscriptionSupplierById(_id: ID!): JSON
    subscriptionSuppliers(supplierIds: String!): JSON
    subscriptionAdmin(supplierIds: String!): JSON
    subscriptionCommentById(_id: ID!): JSON

    subConversation(userId: ID): JSON
    subMessage(userId: ID!, conversationId: ID!): JSON

    conversations(userId: ID!): JSON
  }

  type PostSubscriptionPayload {
    mutation: String!
    data: Post!
  }

  type CommentSubscriptionPayload {
    mutation: String!
    commentID: String!
    data: [CommentParent]!
  }

  type BookmarkSubscriptionPayload {
    mutation: String!
    data: Bookmark!
  }

  type ShareSubscriptionPayload {
    mutation: String!
    data: Share!
  }

  type ConversationSubscriptionPayload{
    mutation: String!
    data: Conversation!
  }

  type MessageSubscriptionPayload{
    mutation: String!
    data: Message!
  }

  type deleteType {
    ok: Int
  }

  input PostFilter {
    q: String
  }

  type ListMetadata {
    count: Int!
  }
`;
