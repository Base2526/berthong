import { gql } from "@apollo/client";

// query
export const queryPing          = gql`query ping { ping }`;
export const querySuppliers     = gql`query suppliers( $input: SearchInput ) { suppliers( input: $input) }`;
export const querySupplierById  = gql`query supplierById($id: ID!) { supplierById(_id: $id) }`;
export const queryDeposits      = gql`query deposits { deposits }`;
export const queryDepositById   = gql`query depositById($id: ID!) { depositById(_id: $id) }`;
export const queryWithdraws     = gql`query withdraws { withdraws }`;
export const queryWithdrawById  = gql`query withdrawById($id: ID!) { withdrawById(_id: $id) }`;
export const queryMe            = gql`query me { me }`;
export const queryUsers         = gql`query users($input: PagingInput ) { users(input: $input) }`;
export const queryUserById      = gql`query userById($id: ID!) { userById(_id: $id) }`;
export const queryRoles         = gql`query roles { roles }`;
export const queryRoleByIds     = gql`query roleByIds($input: [String]) { roleByIds(input: $input) }`;
export const queryBanks         = gql`query banks($is_admin: Boolean) { banks(is_admin: $is_admin ) }`;
export const queryBankById      = gql`query bankById($id: ID!) { bankById(_id: $id) }`;
export const queryBookBuyTransitions = gql`query bookBuyTransitions { bookBuyTransitions }`;
export const queryHistoryTransitions = gql`query historyTransitions { historyTransitions }`;
export const queryFriendProfile      = gql`query friendProfile($id: ID!) { friendProfile(_id: $id) }`;
export const queryDateLotterys    = gql`query dateLotterys { dateLotterys }`;
export const queryDateLotteryById = gql`query dateLotteryById($id: ID!) { dateLotteryById(_id: $id) }`;
export const queryBuys            = gql`query buys { buys }`;
export const queryNotifications   = gql`query notifications { notifications }`;
export const queryAdminHome       = gql`query adminHome { adminHome }`;
export const queryCommentById     = gql`query commentById($id: ID!) { commentById(_id: $id) }`;

// mutation
export const mutationLogin      = gql`mutation login($input: LoginInput) { login(input: $input) }`;
export const mutationLoginWithSocial = gql`mutation loginWithSocial($input: LoginWithSocialInput) { loginWithSocial(input: $input) }`;
export const mutationRegister   = gql`mutation register($input: RegisterInput) { register(input: $input) }`;
export const mutationMe         = gql`mutation me($input: MeInput){ me(input: $input) }`;
export const mutationBook       = gql`mutation book($input: BookInput) { book(input: $input) }`;
export const mutationBuy        = gql`mutation buy($id: ID!) { buy(_id: $id) }`;
export const mutationSupplier   = gql`mutation supplier($input: SupplierInput) { supplier(input: $input) }`;
export const mutationDeposit    = gql`mutation deposit($input: DepositInput){ deposit(input: $input) }`;
export const mutationWithdraw   = gql`mutation withdraw($input: WithdrawInput){ withdraw(input: $input) }`;
export const mutationBank       = gql`mutation bank($input: BankInput){ bank(input: $input) }`;
export const mutationFollow     = gql`mutation follow($id: ID!) { follow(_id: $id) }`;
export const mutationDatesLottery = gql`mutation datesLottery($input: [Date]){ datesLottery(input: $input) }`;
export const mutationNotification = gql`mutation notification($id: ID!) { notification(_id: $id) }`;

export const mutationComment    = gql`mutation comment($input: JSON) { comment(input: $input) }`;


// subscription 
export const subscriptionMe            = gql`subscription subscriptionMe($sessionId: ID!){ subscriptionMe(sessionId: $sessionId) }`;
export const subscriptionSupplierById  = gql`subscription subscriptionSupplierById($id: ID!){ subscriptionSupplierById(_id: $id) }`;
export const subscriptionSuppliers     = gql`subscription subscriptionSuppliers($supplierIds: String!) { subscriptionSuppliers(supplierIds: $supplierIds) }`;
export const subscriptionAdmin         = gql`subscription subscriptionAdmin($sessionId: ID!){ subscriptionAdmin(sessionId: $sessionId) }`;

export const subscriptionCommentById   = gql`subscription subscriptionCommentById($id:ID!){ subscriptionCommentById(_id:$id) }`;