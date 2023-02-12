import { gql } from "@apollo/client";

// query
export const gqlPing        = gql`query Ping{ ping }`;
// export const queryHomes     = gql`query homes { homes }`;
export const querySuppliers = gql`query suppliers { suppliers }`;
export const querySupplierById= gql`query supplierById($id: ID!) { supplierById(_id: $id) }`;

export const queryDeposits   = gql`query deposits { deposits }`;
export const queryDepositById= gql`query depositById($id: ID!) { depositById(_id: $id) }`;
export const queryWithdraws  = gql`query withdraws { withdraws }`;
export const queryWithdrawById= gql`query withdrawById($id: ID!) { withdrawById(_id: $id) }`;

export const queryMe          = gql`query me { me }`;
export const queryUsers       = gql`query users { users }`; // userById
export const queryUserById    = gql`query userById($id: ID!) { userById(_id: $id) }`;

export const queryRoles       = gql`query roles { roles }`;

export const queryBanks       = gql`query banks { banks }`;
export const queryBankById    = gql`query bankById($id: ID!) { bankById(_id: $id) }`;

export const queryBankAdmin  = gql`query bankAdmin { bankAdmin }`;

export const queryBalanceById = gql`query balanceById($id: ID!) { balanceById(_id: $id) }`;

export const queryBookBuyTransitions = gql`query bookBuyTransitions { bookBuyTransitions }`;

export const queryHistoryTransitions = gql`query historyTransitions { historyTransitions }`;

export const querySupplierProfile = gql`query supplierProfile($id: ID!) { supplierProfile(_id: $id) }`;

export const queryDateLotterys    = gql`query dateLotterys { dateLotterys }`;

export const queryDateLotteryById = gql`query dateLotteryById($id: ID!) { dateLotteryById(_id: $id) }`;

export const queryBuys            = gql`query buys { buys }`;


// mutation
export const mutationLogin      = gql`mutation login($input: LoginInput) { login(input: $input) }`;
export const mutationLoginWithSocial = gql`mutation loginWithSocial($input: LoginWithSocialInput) { loginWithSocial(input: $input) }`;
export const mutationMe         = gql`mutation me($input: MeInput){ me(input: $input) }`;
export const gqlBook            = gql`mutation book($input: BookInput) { book(input: $input) }`;
export const gqlBuy             = gql`mutation buy($id: ID!) { buy(_id: $id) }`;
export const gqlSupplier        = gql`mutation supplier($input: SupplierInput) { supplier(input: $input) }`;

export const mutationDeposit    = gql`mutation deposit($input: DepositInput){ deposit(input: $input) }`;
export const mutationWithdraw   = gql`mutation withdraw($input: WithdrawInput){ withdraw(input: $input) }`;

export const mutationBank       = gql`mutation bank($input: BankInput){ bank(input: $input) }`;
export const mutationFollow     = gql`mutation follow($id: ID!) { follow(_id: $id) }`;

export const mutationDateLottery = gql`mutation dateLottery($input: DateLotteryInput){ dateLottery(input: $input) }`;

// subscription 
export const subscriptionMe            = gql`subscription subscriptionMe($sessionId: ID!){ subscriptionMe(sessionId: $sessionId) }`;
export const subscriptionSupplierById  = gql`subscription subscriptionSupplierById( $supplierById: ID! ){ subscriptionSupplierById(supplierById: $supplierById) }`;
export const subscriptionSuppliers     = gql`subscription subscriptionSuppliers( $supplierIds: String ) { subscriptionSuppliers(supplierIds: $supplierIds) }`;