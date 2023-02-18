import React from "react";
import { Route, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash"

const PrivateRoute = ({ user,  children, ...rest }) => {
    
    return (
        <Route
        {...rest}
        render={({ location }) =>
            {
            return  !_.isEmpty(user)
                    ? children
                    : /* <Redirect
                        to={{
                            pathname: "/",
                            state: { from: location }
                        }}/>*/
                      <Route path="*" element={<Navigate to="/" replace />} />
            }
        }/>
    );
}

const mapStateToProps = (state, ownProps) => {
    return { user: state.auth.user }
};
  
export default connect( mapStateToProps, null )(PrivateRoute);
