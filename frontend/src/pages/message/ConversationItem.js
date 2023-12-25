import React from "react";
import { useTranslation } from "react-i18next";
import {
    IconButton,
    Menu,
    MenuItem
  } from "@mui/material";

import { HiDotsVertical as HiDotsVerticalIcon } from "react-icons/hi";

const ConversationItem = (props) => {
  const { t } = useTranslation();
  const { onMutationConversation, conversation } = props

  console.log("ConversationItem :", props)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const menuView = () =>{
    return  <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              onClose={()=>handleClose()}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
              <MenuItem onClick={()=> {
                onMutationConversation({ variables: { mode: "DELETE", id: conversation?._id } })
                handleClose()
              }}>{t("delete")}</MenuItem>
            </Menu>
  }

  return (
    <div> 
      {menuView()}
      <IconButton onClick={(e) =>{ handleClick(e) }}> 
        <HiDotsVerticalIcon size={'0.8em'}/> 
      </IconButton>
    </div>
  );
};

export default ConversationItem;