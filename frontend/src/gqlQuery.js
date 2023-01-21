import { gql } from "@apollo/client";

export const gqlPing        = gql`query Ping{ ping }`;
export const gqlSuppliers   = gql`query GetSuppliers { getSuppliers }`;
export const gqlSupplierById= gql`query GetSupplierById($id: ID!) { getSupplierById(_id: $id) }`;

export const gqlLogin       = gql`mutation Login($input: LoginInput) { login(input: $input) }`;
export const gqlBook        = gql`mutation Book($input: BookInput) { book(input: $input) }`;
export const gqlBuys         = gql`mutation Buys($input: BuyInput) { buys(input: $input) }`;

export const gqlSupplier = gql`mutation Supplier($input: SupplierInput) { supplier(input: $input) }`;
