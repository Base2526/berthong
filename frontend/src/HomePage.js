import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import _ from "lodash"

const HomePage = (props) => {
  let history = useHistory();
  const { t } = useTranslation();
  return (<div style={{flex:1}}>
            {
              _.map(["A1","A2","A3","A4","A5","A6","A7","A8","A9"], (val, k)=>{
                return <div 
                        onClick={(evt)=>{
                          history.push({
                            pathname: "/detail",
                            // search: "?id=5",
                            // hash: "#react",
                            state: { id: val }
                          });
                        }} className="home-item">{val}</div>
              })
            }
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return {}
};

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(HomePage);