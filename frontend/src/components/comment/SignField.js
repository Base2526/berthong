import React, { useContext } from 'react'
import { useTranslation } from "react-i18next";

import { ActionContext } from './ActionContext'

const SignField = ({onSignin}) => {
  const actions = useContext(ActionContext)

  const { t } = useTranslation();

  const handleDivClick = (e) => {
    onSignin(e)
    // if (e.target.name === 'login') {
    //   window.location.href = actions.signinUrl
    // } else if (e.target.name === 'signup') {
    //   window.location.href = actions.signupUrl
    // }
  }

  return (
    <div className={"signBox"}>
      <div className={"signLine"}>{t("login_or_sign_up_to_leave_a_comment")}</div>
      <div>
        <button
          className={"loginBtn"}
          name='login'
          onClick={(e) => handleDivClick(e)}
        >
          {t("login")}
        </button>
        {/* <button
          className={"signBtn"}
          name='signup'
          onClick={(e) => handleDivClick(e)}
        >
          Sign Up
        </button> */}
      </div>
    </div>
  )
}

export default SignField
