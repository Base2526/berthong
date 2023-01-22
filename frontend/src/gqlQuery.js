import { gql } from "@apollo/client";

// query
export const gqlPing        = gql`query Ping{ ping }`;
export const gqlSuppliers   = gql`query GetSuppliers { getSuppliers }`;
export const gqlSupplierById= gql`query GetSupplierById($id: ID!) { getSupplierById(_id: $id) }`;

// mutation
export const gqlLogin       = gql`mutation Login($input: LoginInput) { login(input: $input) }`;
export const gqlBook        = gql`mutation Book($input: BookInput) { book(input: $input) }`;
export const gqlBuys        = gql`mutation Buys($input: BuyInput) { buys(input: $input) }`;
export const gqlSupplier    = gql`mutation Supplier($input: SupplierInput) { supplier(input: $input) }`;

// subscription 
export const subscriptionSupplierById  = gql`subscription SubscriptionSupplierById( $supplierById: ID! ){ subscriptionSupplierById(supplierById: $supplierById) }`;
export const subscriptionSuppliers     = gql`subscription SubscriptionSuppliers( $supplierIds: String ) { subscriptionSuppliers(supplierIds: $supplierIds) }`;