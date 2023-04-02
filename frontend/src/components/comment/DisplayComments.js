import React, { useContext } from 'react'
import InputField from './InputField'
import { ActionContext } from './ActionContext'
import CommentStructure from './CommentStructure'

const DisplayComments = ({ comments }) => {
  const actions = useContext(ActionContext)
  return (
    <div>
      {comments.map((i, index) => (
        <div key={i.comId}>
          {actions.editArr.filter((id) => id === i.comId).length !== 0 ? (
            actions.customInput ? (
              actions.customInput({
                cancellor: i.comId,
                value: i.text,
                handleCancel: actions.handleCancel,
                submit: actions.submit,
                edit: true
              })
            ) : (
              <div className='inputfield-level-1'><InputField cancellor={i.comId} value={i.text} edit /></div>
            )
          ) : (
            <CommentStructure i={i} handleEdit={() => actions.handleAction} />
          )}
          {actions.replies.filter((id) => id === i.comId).length !== 0 &&
            (actions.customInput ? (
              actions.customInput({
                cancellor: i.comId,
                parentId: i.comId,
                submit: actions.submit,
                handleCancel: actions.handleCancel,
                edit: false
              })
            ) : (
              <div className='inputfield-level-2'><InputField cancellor={i.comId} parentId={i.comId} /></div>
            ))}
          <div className={"replySection"}>
            {i.replies &&
              i.replies.map((a, index) => (
                <div key={a.comId}>
                  {actions.editArr.filter((id) => id === a.comId).length !==
                  0 ? (
                    actions.customInput ? (
                      actions.customInput({
                        cancellor: a.comId,
                        value: a.text,
                        handleCancel: actions.handleCancel,
                        edit: true,
                        parentId: i.comId,
                        submit: actions.submit
                      })
                    ) : (
                      <div className='inputfield-level-3'><InputField cancellor={a.comId} value={a.text} edit parentId={i.comId} /></div>
                    )
                  ) : (
                    <CommentStructure
                      i={a}
                      reply
                      parentId={i.comId}
                      handleEdit={() => actions.handleAction}
                    />
                  )}
                  {actions.replies.filter((id) => id === a.comId).length !==
                    0 &&
                    (actions.customInput ? (
                      actions.customInput({
                        cancellor: a.comId,
                        parentId: i.comId,
                        child: true,
                        submit: actions.submit,
                        handleCancel: actions.handleCancel,
                        edit: false
                      })
                    ) : (
                      <div className='inputfield-level-4'><InputField cancellor={a.comId} parentId={i.comId} child /></div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DisplayComments
