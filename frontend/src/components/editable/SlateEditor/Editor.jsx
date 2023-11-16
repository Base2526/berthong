import "./Editor.css";
import React, { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { createEditor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, withReact } from "slate-react";
import { useTranslation } from "react-i18next";


import {Link} from 'react-router-dom';

import Toolbar from "./Toolbar/Toolbar";
import { sizeMap, fontFamilyMap } from "./utils/SlateUtilityFunctions.js";

const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;
    case "headingTwo":
      return <h2 {...attributes}>{children}</h2>;
    case "headingThree":
      return <h3 {...attributes}>{children}</h3>;
    case "blockquote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "alignLeft":
      return (
        <div
          style={{ textAlign: "left", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignCenter":
      return (
        <div
          style={{ textAlign: "center", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignRight":
      return (
        <div
          style={{ textAlign: "right", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "orderedList":
      return (
        <ol type="1" {...attributes}>
          {children}
        </ol>
      );
    case "unorderedList":
      return <ul {...attributes}>{children}</ul>;
    case "link":
      return <Link {...props} />;

    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return <td {...attributes}>{children}</td>;
    // case "image":
    //   return <Image {...props} />;
    // case "video":
    //   return <Video {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.bgColor) {
    children = (
      <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
    );
  }
  if (leaf.fontSize) {
    const size = sizeMap[leaf.fontSize];
    children = <span style={{ fontSize: size }}>{children}</span>;
  }
  if (leaf.fontFamily) {
    const family = fontFamilyMap[leaf.fontFamily];
    children = <span style={{ fontFamily: family }}>{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};

const SlateEditor = (props) => {
  const { t } = useTranslation();

  let { onPost, onCancel, onChange, text, edit, parentId } = props;

  const editorRef = useRef()
  if (!editorRef.current) editorRef.current = withHistory(withReact(createEditor()))
  const editor = editorRef.current

  const [value, setValue] = useState(text)
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  const reset = () => {
    editor.children.map(item => {
      Transforms.delete(editor, { at: [0] })
    })

    editor.children = [
      {
          type: "p",
          children: [{ text: "" }]
      }
    ];
  }

  return (
    <Slate
      editor={editor}
      value={value}
      setValue={setValue}
      onChange={(newValue) => {
        onChange(newValue)
      }}>
      <div
        className="editor-wrapper"
        style={{ border: "1px solid #f3f3f3", padding: "0 10px" }}>
        <Editable
          placeholder={t("editable_placeholder")}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </div>
      <Toolbar 
        text={text}
        edit={edit}
        parentId={parentId}
        onPost={()=>{
          onPost()
          reset()
        }} 
        onCancel={()=>{
          onCancel()
          reset()
        }} />
    </Slate>
  );
};
export default SlateEditor;
