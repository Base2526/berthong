import React from "react";
import {
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon
} from "@material-ui/icons";

const PostPage = (props) => {
  let { post, displayDelete, type } = props;
  return (
    <div class="col-md-6 col-lg-3 pb-3">
      <div class="card card-custom bg-white border-white border-0">
        <span class={post.type === "bon" ? "bon" : "lang"}>
          <b>{post.type === "bon" ? "บน" : "ล่าง"}</b>
        </span>
        <span class="price">
          <b>{post.price} บาท</b>
        </span>
        <div
          class="card-custom-img"
          style={{
            backgroundImage: `url(${
              post.picture
                ? post.picture
                : "https://images.rawpixel.com/image_600/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0yMS1iYWNrZ3JvdW5kLXRvbmctMDU4LmpwZw.jpg"
            })`
          }}
        ></div>
        <div class="card-custom-avatar">
          <img
            class="img-fluid"
            src={
              post.avatar
                ? post.avatar
                : "https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"
            }
            alt="Avatar"
          />
        </div>
        <div class="card-body" style={{ overflowY: "auto" }}>
          {/* <h4 class="card-title">{post.title}</h4> */}
          <div className="row">
            <div className="col-12 p-2">
              <span class="card-title" style={{ float: "left" }}>
                <b>{post.title}</b>
              </span>
              <h4 class="card-title" style={{ float: "right" }}>
                <BookmarkIcon />
                <MoreVertIcon />
              </h4>
            </div>
          </div>
          <div>
            <p class="card-text">{post.detail}</p>
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

export default PostPage;
