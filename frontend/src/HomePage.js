import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

const HomePage = (props) => {
  let history = useHistory();
  const { t } = useTranslation();
  return (<div style={{flex:1}}>
            <div>HomePage</div>
            <a className="App-link" href="/about">About page</a>
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return {}
};

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(HomePage);