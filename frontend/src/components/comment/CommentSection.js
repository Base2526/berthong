import React, { useEffect, useState } from 'react'
import _ from "lodash";

import DisplayComments from './DisplayComments'
import { ActionProvider } from './ActionContext'
import SignField from './SignField'
import Input from './Input'

export const CommentSection = (props) => {
  const {
    commentsArray,
    currentUser,
    setComment,
    signinUrl,
    signupUrl,
    customInput,
    onSignin
  } = props

  const [comments, setComments] = useState(commentsArray)
  
  useEffect(() => {
    setComments(commentsArray)
  }, [commentsArray])

  return (
    <ActionProvider
      currentUser={currentUser}
      setComment={setComment}
      comments={comments}
      signinUrl={signinUrl}
      signupUrl={signupUrl}
      customInput={customInput}
    >
      <div className={"section"}>
        <div className={"inputBox"}>
          {signupUrl && !currentUser ? <SignField  onSignin={onSignin} /> : <Input />}
        </div>
        { 
          _.isEmpty(comments) 
          ? <></> 
          : <div className={"displayComments"}>
              <DisplayComments 
                {...props} 
                comments={comments} />
            </div>
        }
      </div>
    </ActionProvider>
  )
}
