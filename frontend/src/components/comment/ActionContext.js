import React, { createContext, useEffect, useState } from 'react'
import uuid from 'react-uuid'
import moment from "moment";

export const ActionContext = createContext()
export const ActionProvider = ({
  children,
  currentUser,
  setComment,
  comments,
  signinUrl,
  signupUrl,
  customInput
}) => {
  const [replies, setReplies] = useState([])
  const [user, setUser] = useState()
  const [editArr, setEdit] = useState([])

  useEffect(() => {
    if (currentUser) {
      setUser(true)
    } else {
      setUser(false)
    }
  })

  const handleAction = (id, edit) => {
    edit ? setEdit([...editArr, id]) : setReplies([...replies, id])
  }
  
  const handleCancel = (id, edit) => {
    if (edit) {
      let list = [...editArr]
      let newList = list.filter((i) => i !== id)
      setEdit(newList)
    } else if (!edit) {
      let list = [...replies]
      let newList = list.filter((i) => i !== id)
      setReplies(newList)
    }
  }

  const onSubmit = (text, parentId, child) => {
    if (text.length > 0) {
      if (!parentId && !child) {
        setComment([
          ...comments,
          {
            userId: currentUser.userId,
            comId: uuid(),
            // avatarUrl: currentUser.avatarUrl,
            // fullName: currentUser.name,
            created: moment().valueOf(), 
            updated: moment().valueOf(),
            text: text,
            notify: true
          }
        ])
      } else if (parentId && child) {
        let newList = [...comments]
        let index = newList.findIndex((x) => x.comId === parentId)
        newList[index].replies.push({
          userId: currentUser.userId,
          comId: uuid(),
          // avatarUrl: currentUser.avatarUrl,
          // fullName: currentUser.name,
          created: moment().valueOf(), 
          updated: moment().valueOf(),
          text: text,
          notify: true
        })
        setComment(newList)
      } else if (parentId && !child) {
        let newList = [...comments]
        let index = newList.findIndex((x) => x.comId === parentId)
        let newReplies =
          newList[index].replies === undefined
            ? []
            : [...newList[index].replies]
        newReplies.push({
          userId: currentUser.userId,
          comId: uuid(),
          // avatarUrl: currentUser.avatarUrl,
          // fullName: currentUser.name,
          created: moment().valueOf(), 
          updated: moment().valueOf(),
          text: text,
          notify: true
        })
        // newList[index].replies = newReplies
        // setComment(newList)

        newList[index] = {...newList[index], replies: newReplies}
        setComment(newList)
      }
    }
  }

  const editText = (id, text, parentId) => {
    if (parentId === undefined) {
      let newList = [...comments]
      let index = newList.findIndex((x) => x.comId === id)
      // newList[index].text = text
      // setComment(newList)

      newList[index] = {...newList[index], text: text, notify: true, updated: moment().valueOf()}
      setComment(newList)
    } else if (parentId !== undefined) {
      let newList = [...comments]
      let index = newList.findIndex((x) => x.comId === parentId)
      let replyIndex = newList[index].replies.findIndex((i) => i.comId === id)

      console.log("newList :", newList)

      newList[index].replies[replyIndex].text = text
      newList[index].replies[replyIndex].notify = true
      newList[index].replies[replyIndex].updated = moment().valueOf()

      /*
      console.log("newList : ", newList)

      let newReplies = [...newList[index].replies]

      let newObject = {...newReplies[replyIndex]}

      newObject.text = text
      newObject.notify = true
      newObject.updated = moment().valueOf()

      newReplies = [...newReplies, ]
      console.log("newObject : ", newObject)
      */
      setComment(newList)
    }
  }

  const deleteText = (id, parentId) => {
    if (parentId === undefined) {
      let newList = [...comments]
      let filter = newList.filter((x) => x.comId !== id)
      setComment(filter)
    } else if (parentId !== undefined) {
      let newList = [...comments]
      let index = newList.findIndex((x) => x.comId === parentId)
      let filter = newList[index].replies.filter((x) => x.comId !== id)
      // newList[index].replies = filter
      // setComment(newList)

      newList[index] = {...newList[index], replies: filter}
      setComment(newList)
    }
  }

  const submit = (cancellor, text, parentId, edit, setText, child) => {
    if (edit) {
      editText(cancellor, text, parentId)
      handleCancel(cancellor, edit)
      setText('')
    } else {
      onSubmit(text, parentId, child)
      handleCancel(cancellor)
      setText('')
    }
  }

  return (
    <ActionContext.Provider
      value={{
        onSubmit: onSubmit,
        // userImg: currentUser && currentUser.avatarUrl,
        userId: currentUser && currentUser.userId,
        handleAction: handleAction,
        handleCancel: handleCancel,
        replies: replies,
        setReplies: setReplies,
        editArr: editArr,
        onEdit: editText,
        onDelete: deleteText,
        signinUrl: signinUrl,
        signupUrl: signupUrl,
        user: user,
        customInput: customInput,
        submit: submit
      }}
    >
      {children}
    </ActionContext.Provider>
  )
}
