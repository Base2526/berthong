import { gql } from "@apollo/client";

// query
export const queryPing          = gql`query ping { ping }`;
export const querySuppliers     = gql`query suppliers( $input: SearchInput ) { suppliers( input: $input) }`;
export const querySupplierById  = gql`query supplierById($id: ID!) { supplierById(_id: $id) }`;
// export const queryDepositById   = gql`query depositById($id: ID!) { depositById(_id: $id) }`;
// export const queryWithdrawById  = gql`query withdrawById($id: ID!) { withdrawById(_id: $id) }`;
export const queryUsers         = gql`query users($input: PagingInput ) { users(input: $input) }`;
export const queryUserById      = gql`query userById($id: ID!) { userById(_id: $id) }`;
// export const queryRoles         = gql`query roles { roles }`;
export const queryRoleByIds     = gql`query roleByIds($input: [String]) { roleByIds(input: $input) }`;
export const queryBanks         = gql`query banks{ banks }`;
export const queryBankById      = gql`query bankById($id: ID!) { bankById(_id: $id) }`;
export const queryBookBuyTransitions = gql`query bookBuyTransitions { bookBuyTransitions }`;
export const queryHistoryTransitions = gql`query historyTransitions { historyTransitions }`;
export const queryFriendProfile      = gql`query friendProfile($id: ID!) { friendProfile(_id: $id) }`;
export const queryBuys            = gql`query buys { buys }`;
export const queryNotifications   = gql`query notifications { notifications }`;
export const queryCommentById     = gql`query commentById($id: ID!) { commentById(_id: $id) }`;
export const queryBookmarks       = gql`query bookmarks{ bookmarks }`;
export const querySubscribes      = gql`query subscribes{ subscribes }`;
export const queryDblog           = gql`query dblog{ dblog }`;

// ADMIN
export const queryDateLotterys    = gql`query dateLotterys { dateLotterys }`;
export const queryDateLotteryById = gql`query dateLotteryById($id: ID!) { dateLotteryById(_id: $id) }`;

export const queryAdminHome       = gql`query adminHome { adminHome }`;
export const queryAdminDeposits   = gql`query adminDeposits{ adminDeposits }`;
export const queryAdminWithdraws  = gql`query adminWithdraws{ adminWithdraws }`;

// mutation
export const mutationLogin      = gql`mutation login($input: LoginInput) { login(input: $input) }`;
export const mutationLoginWithSocial = gql`mutation loginWithSocial($input: LoginWithSocialInput) { loginWithSocial(input: $input) }`;
export const mutationRegister   = gql`mutation register($input: RegisterInput) { register(input: $input) }`;
export const mutationMe         = gql`mutation me($input: JSON){ me(input: $input) }`;
// export const mutationMe_bank    = gql`mutation me_bank($input: JSON){ me_bank(input: $input) }`;
// export const mutationMe_profile = gql`mutation me_profile($input: JSON){ me_profile(input: $input) }`;
export const mutationBook       = gql`mutation book($input: BookInput) { book(input: $input) }`;
export const mutationBuy        = gql`mutation buy($id: ID!) { buy(_id: $id) }`;
export const mutationCancelBuyAll        = gql`mutation cancelBuyAll($id: ID!) { cancelBuyAll(_id: $id) }`;
export const mutationSupplier   = gql`mutation supplier($input: SupplierInput) { supplier(input: $input) }`;
export const mutationDeposit    = gql`mutation deposit($input: DepositInput){ deposit(input: $input) }`;
export const mutationWithdraw   = gql`mutation withdraw($input: WithdrawInput){ withdraw(input: $input) }`;
export const mutationBank       = gql`mutation bank($input: BankInput){ bank(input: $input) }`;
export const mutationFollow     = gql`mutation follow($id: ID!) { follow(_id: $id) }`;
export const mutationDatesLottery = gql`mutation datesLottery($input: [Date]){ datesLottery(input: $input) }`;
export const mutationNotification = gql`mutation notification($id: ID!) { notification(_id: $id) }`;
export const mutationComment      = gql`mutation comment($input: JSON) { comment(input: $input) }`;
export const mutationContactUs    = gql`mutation contactUs($input: ContactUsInput) { contactUs(input: $input) }`;
export const mutationSubscribe    = gql`mutation subscribe($id: ID!) { subscribe(_id: $id) }`;

export const mutationAdminDeposit   = gql`mutation adminDeposit($input: JSON){ adminDeposit(input: $input) }`;
export const mutationAdminWithdraw  = gql`mutation adminWithdraw($input: JSON){ adminWithdraw(input: $input) }`;

// subscription 
export const subscriptionMe            = gql`subscription subscriptionMe($sessionId: ID!){ subscriptionMe(sessionId: $sessionId) }`;
export const subscriptionSupplierById  = gql`subscription subscriptionSupplierById($id: ID!){ subscriptionSupplierById(_id: $id) }`;
export const subscriptionSuppliers     = gql`subscription subscriptionSuppliers($supplierIds: String!) { subscriptionSuppliers(supplierIds: $supplierIds) }`;
export const subscriptionAdmin         = gql`subscription subscriptionAdmin($sessionId: ID!){ subscriptionAdmin(sessionId: $sessionId) }`;

export const subscriptionCommentById   = gql`subscription subscriptionCommentById($id:ID!){ subscriptionCommentById(_id:$id) }`;