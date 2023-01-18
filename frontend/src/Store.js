import { createContext, useState } from "react";
import {
  userRows,
  products,
  posts,
  comments,
  sockets,
  roles,
  banks
} from "./data";

const initialUsersState = userRows;
const initialProductsState = products;
const initialPostsState = posts;
const initialCommentsState = comments;
const initialSocketsState = sockets;
const initialRolesState = roles;
const initialBanksState = banks;

export const UserContext = createContext();
export const ProductContext = createContext();
export const PostContext = createContext();
export const CommentContext = createContext();
export const SocketContext = createContext();
export const RoleContext = createContext();
export const BankContext = createContext();

function Store({ children }) {
  const [userState, setUserState] = useState(initialUsersState);
  const [productState, setProductState] = useState(initialProductsState);
  const [postState, setPostState] = useState(initialPostsState);
  const [commentState, setCommentState] = useState(initialCommentsState);
  const [socketState, setSocketState] = useState(initialSocketsState);
  const [roleState, setRoleState] = useState(initialRolesState);
  const [bankState, setBankState] = useState(initialBanksState);

  return (
    <UserContext.Provider value={[userState, setUserState]}>
      <ProductContext.Provider value={[productState, setProductState]}>
        <PostContext.Provider value={[postState, setPostState]}>
          <CommentContext.Provider value={[commentState, setCommentState]}>
            <SocketContext.Provider value={[socketState, setSocketState]}>
              <RoleContext.Provider value={[roleState, setRoleState]}>
                <BankContext.Provider value={[bankState, setBankState]}>
                  {children}
                </BankContext.Provider>
              </RoleContext.Provider>
            </SocketContext.Provider>
          </CommentContext.Provider>
        </PostContext.Provider>
      </ProductContext.Provider>
    </UserContext.Provider>
  );
}

export default Store;
