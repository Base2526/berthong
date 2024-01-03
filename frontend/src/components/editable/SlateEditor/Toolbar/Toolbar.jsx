import "./styles.css";
import React, { useEffect, useState, useRef } from "react";
import { useSlate, ReactEditor } from "slate-react";
import { useTranslation } from "react-i18next";
import { Node, Path, Transforms } from "slate";
import { slateToHtml } from 'slate-serializers'

// import Button from "../common/Button";
import Icon from "../common/Icon";
import { toggleMark, isMarkActive } from "../utils/SlateUtilityFunctions.js";
import defaultToolbarGroups from "./toolbarGroups.js";
import _ from "lodash";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from "emoji-picker-react";
import Paper from "@material-ui/core/Paper";


import { Button } from "@material-ui/core";

const Toolbar = (props) => {
  const { t } = useTranslation();

  let editor = useSlate();
  // const isTable = useTable(editor);
  const [toolbarGroups, setToolbarGroups] = useState(defaultToolbarGroups);

  let { onPost, onCancel, edit, parentId, text} = props;


  // useEffect(() => {
  //   let filteredGroups = [...defaultToolbarGroups];
  //   if (isTable) {
  //     filteredGroups = toolbarGroups.map((grp) =>
  //       grp.filter((element) => element.type !== "block")
  //     );
  //     filteredGroups = filteredGroups.filter((elem) => elem.length);
  //   }
  //   setToolbarGroups(filteredGroups);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isTable]);

  // const BlockButton = ({ format }) => {
  //   return (
  //     <Button
  //       active={isBlockActive(editor, format)}
  //       format={format}
  //       onMouseDown={(e) => {
  //         e.preventDefault();
  //         toggleBlock(editor, format);
  //       }}
  //     >
  //       <Icon icon={format} />
  //     </Button>
  //   );
  // };
  const MarkButton = ({ format }) => {
    return (
      <Button
        active={isMarkActive(editor, format)}
        format={format}
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, format);
        }}
      >
        <Icon icon={format} />
      </Button>
    );
  };

  // const Dropdown = ({ format, options }) => {
  //   return (
  //     <select
  //       value={activeMark(editor, format)}
  //       onChange={(e) => changeMarkData(e, format)}
  //     >
  //       {options.map((item, index) => (
  //         <option key={index} value={item.value}>
  //           {item.text}
  //         </option>
  //       ))}
  //     </select>
  //   );
  // };

  // const changeMarkData = (event, format) => {
  //   event.preventDefault();
  //   const value = event.target.value;
  //   addMarkData(editor, { format, value });
  // };

  const pureText = () =>{
    return slateToHtml(text).replace(/(<([^>]+)>)/ig, '')
  }

  // emoji
  const onEmojiClick = (event, emojiObject) => {
    editor.insertText(emojiObject.emoji);
  };
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isOpen) {
      ReactEditor.focus(editor)
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  // emoji

  return (
    <div className="toolbar">
      {toolbarGroups.map((group, index) => (
        <span key={index} className="toolbar-grp">
          {group.map((element) => {
            switch (element.type) {
              // case "block":
              //   return <BlockButton key={element.id} {...element} />;
              case "mark":
                return <MarkButton key={element.id} {...element} />;
              // case "dropdown":
              //   return <Dropdown key={element.id} {...element} />;
              // case "link":
              //   return (
              //     <LinkButton
              //       key={element.id}
              //       active={isBlockActive(editor, "link")}
              //       editor={editor}
              //     />
              //   );
              // case "embed":
              //   return (
              //     <Embed
              //       key={element.id}
              //       format={element.format}
              //       editor={editor}
              //     />
              //   );
              // case "color-picker":
              //   return (
              //     <ColorPicker
              //       key={element.id}
              //       activeMark={activeMark}
              //       format={element.format}
              //       editor={editor}
              //     />
              //   );
              // case "table":
              //   return <Table key={element.id} editor={editor} />;
              // case "inTable":
              //   return isTable ? (
              //     <InTable key={element.id} editor={editor} />
              //   ) : null;
              default:{
                return <button>Invalid Button</button>; 
              }
            }
          })}
        </span>
      ))}
      <div className="toolbar-button">
        <Button onClick={() => setIsOpen(!isOpen)}>
          <EmojiEmotionsIcon style={{color:"#FFC300"}} />
        </Button>
        {isOpen && (
          <div ref={ref} style={{position:"absolute"}}>
            <div className="emoji-panel">
                <Paper elevation={4}>
                  <Picker onEmojiClick={onEmojiClick} />
                </Paper>
            </div>
          </div>
        )}
        {( !_.isEmpty( pureText() ) || parentId) && 
          <Button
            className="p-1 m-1"
            onClick={(evt) => {
              evt.preventDefault();
              onCancel();
            }}
            variant="contained" color="secondary"
          >
            {t("cancel")}
          </Button>
        }
          <Button
            className="p-1 m-1"
            disabled={ _.isEmpty(pureText()) ? true : false }
            variant="contained" 
            color="primary"
            onClick={(evt) => {
              evt.preventDefault();
              onPost();            
            }}
          >
            {t("posts")}
          </Button>
      </div>
    </div>
  );
};

export default Toolbar;
