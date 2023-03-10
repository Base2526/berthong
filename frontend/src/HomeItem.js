import React, { useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import {
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";

import {
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon
} from "@mui/icons-material"
import _ from "lodash"
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from "react-share";

import ItemFollow from "./ItemFollow"

const HomeItem = (props) => {
  const navigate = useNavigate();
  let { index, item, onDialogLogin } = props;
  let { owner, files } = item
  let [openMenu, setOpenMenu] = useState(null);

  const menuView = (item, index) =>{
    return  <Menu
              anchorEl={openMenu && openMenu[index]}
              keepMounted
              open={openMenu && Boolean(openMenu[index])}
              onClose={()=>{ setOpenMenu(null) }}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox"
              }}
            >
              <MenuItem onClose={(e)=>setOpenMenu(null)}>
                <FacebookShareButton
                  url={ window.location.href + "detail/"}
                  quote={item?.title}
                  // hashtag={"#hashtag"}
                  description={item?.description}
                  className="Demo__some-network__share-button"
                  onClick={(e)=>setOpenMenu(null)} >
                  <FacebookIcon size={32} round /> Facebook
                </FacebookShareButton>
              </MenuItem>
              <MenuItem onClose={(e)=>setOpenMenu(null)}>
                <TwitterShareButton
                  title={item?.title}
                  url={ window.location.origin + "/detail/"  }
                  // hashtags={["hashtag1", "hashtag2"]}
                  onClick={(e)=>setOpenMenu(null)} >
                  <TwitterIcon size={32} round />
                  Twitter
                </TwitterShareButton>
              </MenuItem>
              <MenuItem 
                onClick={async(e)=>{
                  let text = window.location.href + "p/?id=" + item._id
                  if ('clipboard' in navigator) {
                    await navigator.clipboard.writeText(text);
                  } else {
                    document.execCommand('copy', true, text);
                  }
                  setOpenMenu(null)
                }}><ContentCopyIcon size={20} round /> Copy link</MenuItem>
              <MenuItem onClick={(e)=>{setOpenMenu(null)}}><BugReportIcon size={20} round />Report</MenuItem>
            </Menu>
  }

  return (
    <div className="col-md-6 col-lg-3 pb-3">
      {menuView(item, index)}
      <div className="card card-custom bg-white border-white border-0">
        <span className={item?.type === "bon" ? "bon" : "lang"}>
          <b>{item?.type === 0 ? "บน" : "ล่าง"}</b>
        </span>
        <span className="price">
          <b>{item?.price} บาท</b>
        </span>
        <div
          className="card-custom-img"
          style={{
            backgroundImage: `url(${
              !_.isEmpty(files)
                ? files[0].url
                : "https://images.rawpixel.com/image_600/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0yMS1iYWNrZ3JvdW5kLXRvbmctMDU4LmpwZw.jpg"
            })`
          }}
        ></div>
        <div 
          className="card-custom-avatar"
          onClick={(e)=>{
            navigate({
              pathname: `/p`,
              search: `?${createSearchParams({ id: item.ownerId})}`
            })
          }}>
          <img
            className="img-fluid"
            src={
              !_.isEmpty(owner?.avatar)
                ? owner?.avatar?.url
                : "https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"
            }
            alt="Avatar"
          />
        </div>
        <div className="card-body" style={{ overflowY: "auto" }}>
          {/* <h4 class="card-title">{post.title}</h4> */}
          <div className="row">
            <div className="col-12 p-2">
              <span 
                className="card-title" 
                style={{ float: "left" }}
                onClick={()=>{
                  navigate({
                  pathname: "/d",
                  search: `?${createSearchParams({ id: item._id})}`,
                  state: { id: item._id }
                })}}>
                <b>{item?.title} - ยอดจอง {  _.filter(item.buys, (buy)=> buy.selected == 0 )?.length }, ขายไปแล้ว { _.filter(item.buys, (buy)=> buy.selected == 1 )?.length } </b>
              </span>
              <h4 className="card-title" 
                style={{ float: "right" }}>
                {/* <IconButton><BookmarkIcon /></IconButton> */}
                <ItemFollow 
                  {...props} 
                  item={item} 
                  onDialogLogin={(e)=>{
                    onDialogLogin(true)
                  }}/>
                <IconButton onClick={(e) => { setOpenMenu({ [index]: e.currentTarget }); }}><MoreVertIcon /></IconButton>
              </h4>
            </div>
          </div>
          <div>
            <p className="card-text"
              onClick={()=>{
                navigate({
                pathname: "/d",
                search: `?${createSearchParams({ id: item._id})}`,
                state: { id: item._id }
              })
            }}>{item?.description}</p>
          </div>
        </div>
        {/* <div>
          <p class="card-text">
            <small class="text-muted">
              <i class="fas fa-eye"></i>
              {post.view}
              <i class="far fa-user"></i>
              {post.createBy}
              <i class="fas fa-calendar-alt"></i>
              {post.createDate}
            </small>
          </p>
        </div> */}
        {/* <div
          class="card-footer"
          style={{ background: "inherit", borderColor: "inherit" }}
        >
          <div className="profile-card-1 p-2 .card-z">
            <a href="#">
              <i class="fab fa-twitter twitter-color"></i>
            </a>
            <a href="#">
              <i class="fab fa-facebook facebook-color"></i>
            </a>
            <a href="#">
              <i class="fab fa-google google-color"></i>
            </a>
            <a href="#">
              <i class="fas fa-link link-color"></i>
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default HomeItem;
