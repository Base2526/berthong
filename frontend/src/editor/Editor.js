import React, {useEffect, useState} from "react";
import { CKEditor } from "ckeditor4-react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import LinearProgress from '@mui/material/LinearProgress';

const Editor = ({label, initData, onEditorChange}) => {

  // console.log("editValues : >", initData)
  const [text, setText] = useState(initData)

  useEffect(()=>{
    // console.log("editValues :", text)
    onEditorChange(text)
  }, [text])

  return (
    <div>
      {
         <Box>
            {label ? (
              <Typography variant="overline" display="block" gutterBottom>
                {label}
              </Typography>
            ) : (
              ""
            )}
            <CKEditor 
              label="Descrition" 
              initData={text} 
              onChange={(event)=>{ setText( event.editor.getData() )}} />
          </Box>
      }
    </div>
  );
};

export default Editor;
