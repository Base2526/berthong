import { ApolloError } from 'apollo-server-errors';

import {SUCCESS, ERROR, FORCE_LOGOUT, DATA_NOT_FOUND} from "../constants"

// export class MyError extends ApolloError {

//   // constructor(){

//   // }
//   constructor(message) {
//     super(message, 'MY_ERROR_CODE');

//     Object.defineProperty(this, 'name', { value: 'MyError' });
//   }
// }

// throw new MyError('My error message')

export default class AppError extends ApolloError {
  constructor(code, message) {
    super(message, code);

    Object.defineProperty(this, 'name', { value: 'NotFoundError-xxx' });
  }
}