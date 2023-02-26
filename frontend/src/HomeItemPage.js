import React from "react";
import {
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon
} from "@material-ui/icons";

import {
  IconButton
} from "@mui/material";

const HomeItemPage = (props) => {
  let { item, displayDelete, type } = props;

  return (
    <div className="col-md-6 col-lg-3 pb-3">
      <div className="card card-custom bg-white border-white border-0">
        <span className={item?.type === "bon" ? "bon" : "lang"}>
          <b>{item?.type === "bon" ? "บน" : "ล่าง"}</b>
        </span>
        <span className="price">
          <b>{item?.price} บาท</b>
        </span>
        <div
          className="card-custom-img"
          style={{
            backgroundImage: `url(${
              item?.picture
                ? item?.picture
                : "https://images.rawpixel.com/image_600/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0yMS1iYWNrZ3JvdW5kLXRvbmctMDU4LmpwZw.jpg"
            })`
          }}
        ></div>
        <div className="card-custom-avatar">
          <img
            className="img-fluid"
            src={
              item?.avatar
                ? item?.avatar
                : "https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"
            }
            alt="Avatar"
          />
        </div>
        <div className="card-body" style={{ overflowY: "auto" }}>
          {/* <h4 class="card-title">{post.title}</h4> */}
          <div className="row">
            <div className="col-12 p-2">
              <span class="card-title" style={{ float: "left" }}>
                <b>{item?.title}</b>
              </span>
              <h4 className="card-title" style={{ float: "right" }}>
                <IconButton><BookmarkIcon /></IconButton>
                <IconButton><MoreVertIcon /></IconButton>
              </h4>
            </div>
          </div>
          <div>
            <p className="card-text">{item?.description}</p>
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

export default HomeItemPage;
