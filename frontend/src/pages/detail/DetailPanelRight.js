import React, { useState } from "react";
import clsx from "clsx";
import Chip from "@mui/joy/Chip";
import TextField from "@material-ui/core/TextField";
import { Rating, Autocomplete } from "@material-ui/lab";
import { MdOutlineSavings } from "react-icons/md"
import { HiOutlineShoppingBag } from "react-icons/hi"
import _ from "lodash"
import {
  IconButton,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon,
  Bookmark as BookmarkIcon
} from "@mui/icons-material"
import {
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";

import { numberCurrency, minTwoDigits } from "../../util"

const numberLotterys = Array.from({ length: 10 * 10 }, (_, i) => i);

const DetailPanel = (props) => {
  let { user, data, onSelected} = props
  return (
    <div className="container-detail">
      {numberLotterys.map((seat) => {

        const isSelected  = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && _.isEqual( buy?.userId,  user?._id));//selectedSeats.includes(seat);
        const isOccupied  = _.find(data?.buys, (buy)=> !_.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 1));;//movies.occupied?.includes(seat);
        const isFinish    = _.find(data?.buys, (buy)=> _.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 1));//movies.finish?.includes(seat);
        const isBooking   = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && !_.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 0));//movies.booking?.includes(seat);
        return (
          <div>
            <span
              tabIndex="0"
              key={seat}
              className={clsx("circle", isSelected && "selected", isOccupied && "occupied", isFinish && "finish",  isBooking && "booking" )}
              onClick={(evt) => isOccupied || isFinish || isBooking ? null : onSelected(evt, seat) }
              onKeyDown={(evt) => isOccupied || isFinish || isBooking ? null : (evt.key === "Enter" ?  onSelected(evt, seat) : null) }>
              {" "}
              {isBooking ? <span className="booking-font">ติดจอง</span> : ""}
              {seat <= 9 ? "0" + seat : seat}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DetailPanelRight = (props) =>{
  let { user, 
        data, 
        owner, 
        onSelected, 
        onFollow, 
        onPopupWallet, 
        onPopupShopping,
        onMenu } = props

  let selecteds =  _.filter(data?.buys, (buy)=>_.isEqual(buy?.userId, user?._id) && _.isEqual(buy?.selected, 0) )
  let buys      =  _.filter(data?.buys, (buy)=>_.isEqual(buy?.userId, user?._id) && _.isEqual(buy?.selected, 1) )

  return  <div className="ber-bg1 border col-lg-8 col-md-8 col-sm-12 col-12">
            <div className="row pb-2">
              <div className="col-12">
                <div class="header_main">
                  <div class="container">
                    <div class="pt-2 col-lg-12 col-12 order-lg-12 order-12 text-lg-left text-right">
                      <div class="wishlist_cart d-flex flex-row align-items-center justify-content-evenly">
                        <div
                          class="wishlist box d-flex flex-row align-items-center justify-content-center"
                          style={{ marginRight: "3px" }}
                          onClick={() => onPopupWallet(true)}>
                          <MdOutlineSavings size="5em"/>
                          <div class="wishlist_content">
                            <div class="wishlist_text" style={{ color: "#fff" }}>
                              <a href="#">คงเหลือ</a>
                            </div>
                            <Chip
                              variant="outlined"
                              color="success"
                              size="sm"
                              sx={{ pointerEvents: "none" }}>
                              <div class="wishlist_count">{ !user?.balance ? numberCurrency(0) : numberCurrency(user?.balance)}</div>
                            </Chip>
                          </div>
                        </div>
                        <div class="wishlist1 wishlist-new box cart d-flex flex-row align-items-center">
                          <div
                            onClick={() => onPopupShopping(true)}
                            class="cart_container d-flex flex-row align-items-center justify-content-center"
                          >
                            <div class="c_cart">
                              <HiOutlineShoppingBag size="5em"/>
                              <div class="cart_count">
                                <span>{selecteds.length}</span>
                              </div>
                            </div>
                            <div class="cart_content">
                              <div class="cart_text">
                                <a href="#">คลิกซื้อ</a>
                              </div>
                              <Chip
                                variant="outlined"
                                color="warning"
                                size="sm"
                                sx={{ pointerEvents: "none" }}>
                                <div class="price-red">{numberCurrency(selecteds.length * data.price)}</div>
                              </Chip>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="card-title" style={{ float: "right" }}>
                            <IconButton onClick={(e) => onFollow({ variables: { id: data?._id } }) }> 
                              <BookmarkIcon style={{ color : !_.isEmpty(_.find(data?.follows, (f)=>f?.userId == user?._id)) ? "blue" : "" }} />
                            </IconButton>
                            <IconButton onClick={(e) =>onMenu(e.currentTarget)}><MoreVertIcon /></IconButton>
                          </h4>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                          <div className="pt-2 selectBer">
                            <Autocomplete
                              size="small"
                              open={false}
                              multiple
                              freeSolo
                              disableClearable
                              options={selecteds.map((option) => option.itemId)}
                              getOptionLabel={(option) => option.toString()}
                              onChange={(e, v) =>{
                                let itemIds = _.map(selecteds, (selected)=>minTwoDigits(selected.itemId))
                                _.map(_.difference(itemIds, v), (itemId)=>onSelected(e, itemId))
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={`เลือก/จอง(${selecteds?.length})`}
                                  margin="normal"
                                  variant="standard"
                                  fullWidth
                                />
                              )}
                              value={selecteds.map((option) => minTwoDigits(option.itemId))}
                            />
                          </div>
                        </div>
                        <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                          <div className="pt-2 finishBer">
                            <Autocomplete
                              size="small"
                              open={false}
                              multiple
                              freeSolo
                              readOnly
                              disableClearable
                              getOptionLabel={(option) => option.toString()}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={`ซื้อสำเร็จแล้ว(${buys?.length})`}
                                  margin="normal"
                                  variant="standard"
                                  fullWidth
                                />
                              )}
                              value={buys.map((option) => option.itemId)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="blog-footer"></div>
            <div style={{ textAlign: "left", color: "#aaa", fontSize: "12px" }}>
              หมายเหตุ : กรุณาชำระเงินภายใน 2 นาที เพราะการจองจะถูกยกเลิก
            </div>
            <div className="ber pt-3">
              <div className="row">
                <DetailPanel {...props} />
              </div>
            </div>
            <div className="pt-3"></div>
            <div className="blog-footer"></div>
            <div className="row m-1">
              <div className="col-12">
                <div class="avatar" style={{ textAlign: "left" }}>
                  <img
                    src={owner?.avatar?.url}
                    alt="Avatar"
                  />
                  <span className="name-ava f-color-0">{owner.displayName}</span>
                  <span className="rate">
                    <Rating name="half-rating" value={3.5} precision={0.5} />
                  </span>
                </div>
              </div>
              <div class="blog-body">
                <div class="blog-title" style={{ textAlign: "left" }}>
                  <h3>{data?.title}</h3>
                </div>
                <div class="blog-summary" style={{ textAlign: "left" }}>
                  <p style={{ margin: "5px" }}>{data?.description}</p>
                  <div className="p-1" style={{ fontSize: "12px" }}>
                    <li>งวดประจำวันที่ 01 มีนาคม 2566</li>
                    <li>รางวัลปลอบใจ เงินสด 200 บาท</li>
                    <li>เบอร์ละ 100 บาท</li>
                    <li>ลุ้นรางวัล 2 ตัวล่าง</li>
                  </div>
                </div>
                <div className="row pt-2">
                  <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                    <div class="blog-tags">
                      <ul>
                        <li>
                          <a href="#" style={{ backgroundColor: "gold", color: "#000" }}>ทอง</a>
                        </li>
                        <li>
                          <a href="#" style={{ backgroundColor: "blue", color: "#fff" }}>สิ่งของ</a>
                        </li>
                        <li>
                          <a href="#">อื่นๆ</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-12 col-12 p-2"></div>
                </div>
              </div>
            </div>
          </div>
}

export default DetailPanelRight;