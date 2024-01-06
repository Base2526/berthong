import React, { useState, useMemo } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import {
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import _ from "lodash"
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from "react-share";
import {
  MdOutlineBookmarkAdd as MdOutlineBookmarkAddIcon,
  MdOutlineBookmarkAdded as MdOutlineBookmarkAddedIcon
} from "react-icons/md"
import { AiOutlineShareAlt  } from "react-icons/ai"
import { TbClipboardCopy as AiOutlineCopy } from "react-icons/tb";

import CommentItem from "./CommentItem"
 
const HomeItem = (props) => {
  let navigate = useNavigate();
  let { user, index, item, onMutationFollow } = props;
  let [openMenu, setOpenMenu] = useState(null);

  let isFollow = _.find(item?.follows, (f)=>f?.userId == user?._id)

  let length = 100
  if(item?.number_lotter){
    switch(item?.number_lotter){
      case 1: {
        length = 1000
        break
      }
      default: 
      {
        length = 100
        break
      }
    }
  }

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
                  <TwitterIcon size={32} round /> Twitter
                </TwitterShareButton>
              </MenuItem>
              <MenuItem 
                onClick={async(e)=>{
                  let text = window.location.href + "d?id=" + item._id
                  if ('clipboard' in navigator) {
                    await navigator.clipboard.writeText(text);
                  } else {
                    document.execCommand('copy', true, text);
                  }
                  setOpenMenu(null)
                }}><AiOutlineCopy size={28} round /> Copy link</MenuItem>
              {/* <MenuItem onClick={(e)=>{setOpenMenu(null)}}><BugReportIcon size={20} round />Report</MenuItem> */}
            </Menu>
  }
  

  return  useMemo(() => {
            return (
              <div className="col-md-6 col-lg-3 pb-3">
                {menuView(item, index)}
                <div className="card card-custom bg-white border-white border-0">

                  {/*   */}
                  {/* <span className={item?.type === "bon" ? "bon" : "lang"}> */}
                  <span className={item?.type === 0 ? "bon" : item?.type === 1 ? "lang" : "bon-lang"}> 
                    <b>{item?.type === 0 ? "บน" : item?.type === 1 ? "ล่าง" : "บน/ล่าง"}</b>
                  </span>
                  <span className="price">
                    <b>{item?.priceUnit}{/* / {length} */ } บาท</b>
                  </span>
                  <div
                    className="card-custom-img"
                    style={{
                      backgroundImage: `url(${
                        !_.isEmpty(item?.files)
                          ? `${window.location.origin}/${item?.files[0].url}`
                          : "https://images.rawpixel.com/image_600/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0yMS1iYWNrZ3JvdW5kLXRvbmctMDU4LmpwZw.jpg"
                      })`
                    }}
                  ></div>
                  <div 
                    className="card-custom-avatar"
                  >
                    <img
                      className="img-fluid"
                      onClick={(e)=>{
                        _.isEqual(user?._id, item?.ownerId)
                        ? navigate("/me")
                        : navigate({ pathname: `/p`, search: `?${createSearchParams({ id: item.ownerId })}` })
                      }}
                      src={
                        !_.isEmpty(item?.owner?.avatar)
                          ? `${window.location.origin}/${item?.owner?.avatar?.url}`
                          : "https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"
                      }
                      alt="Avatar"
                    />
                    <h4 className="card-title icon-card-share" style={{ float: "right" }}>
                        {/* <IconButton onClick={()=>{
                            navigate({
                            pathname: "/d",
                            search: `?${createSearchParams({ id: item._id})}`,
                            state: { id: item._id }
                          })
                        }}> 
                          <Badge badgeContent={10} color="primary">
                            <AiOutlineComment />
                          </Badge>
                        </IconButton> */}
                        <CommentItem item={item}/>
                        <IconButton onClick={(e) =>onMutationFollow({ variables: { id: item._id } })}> 
                          { _.isEmpty(isFollow) ? <MdOutlineBookmarkAddIcon /> : <MdOutlineBookmarkAddedIcon style={{ color: "blue" }} /> }
                        </IconButton>
                        <IconButton onClick={(e) => { setOpenMenu({ [index]: e.currentTarget }); }}><AiOutlineShareAlt /></IconButton>
                    </h4>
                    <div className="row text-jong">
                      <div className="font12">ยอดจอง {  _.filter(item.buys, (buy)=> buy.selected == 0 )?.length }, ขายไปแล้ว { _.filter(item.buys, (buy)=> buy.selected == 1 )?.length }</div>
                    </div>
                  </div>
                  <div className="card-body" style={{ overflowY: "auto" }}>
                    <div className="row">
                      <div className="col-12 p-2 pb-0 text-center">
                        <span 
                          className="card-title" 
                          style={{ float: "left" }}
                          onClick={()=>{
                            navigate({
                              pathname: "/d",
                              search: `?${createSearchParams({ id: item._id})}`,
                              state: { id: item._id }
                            })
                          }}>
                          <b>{item?.title}</b>
                        </span>
                        {/* <h4 className="card-title" 
                          style={{ float: "right" }}>
                          <IconButton onClick={(e) =>onMutationFollow({ variables: { id: item._id } })}> 
                            <BookmarkIcon style={{ color : !_.isEmpty(isFollow) ? "blue" : "" }} />
                          </IconButton>
                          <IconButton onClick={(e) => { setOpenMenu({ [index]: e.currentTarget }); }}><MoreVertIcon /></IconButton>
                        </h4> */}
                      </div>
                    </div>
                    <div className="row">
                      <div>
                        <p className="card-text font12"
                          onClick={()=>{
                            navigate({
                            pathname: "/d",
                            search: `?${createSearchParams({ id: item._id})}`,
                            state: { id: item._id }
                          })
                        }}>{item?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }, [item, openMenu]);
}

export default HomeItem;
