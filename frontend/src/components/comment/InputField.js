import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { slateToHtml, htmlToSlate } from 'slate-serializers'

import { ActionContext } from "./ActionContext";
import Editor from "../editable/SlateEditor/Editor";
import _ from "lodash";

const InputField = (props) => {
  let { cancellor, parentId, child, value, edit, main } = props
  const { t } = useTranslation();
  const actions = useContext(ActionContext);
  const [text, setText] = useState(value);

  const handleChange = (e) => {
    setText(slateToHtml(e))
  };

  return (
    <form className="form">    
      <div className="editor">
        <Editor 
          edit={edit}
          cancellor={cancellor}
          text={_.isEmpty(text)  ? htmlToSlate("<p></p>") : htmlToSlate(text)}
          parentId={parentId}
          setText={setText}
          onChange={handleChange}
          onPost={()=>{
            edit 
            ? actions.submit(cancellor, text, parentId, true, setText)
            : actions.submit(cancellor, text, parentId, false, setText);
          }}
          onCancel={()=>{
            edit
            ? actions.handleCancel(cancellor, edit)
            : actions.handleCancel(cancellor)
          }}/>
      </div>
    </form>
  );
};

export default InputField;
