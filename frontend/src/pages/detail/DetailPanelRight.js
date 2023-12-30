import React, { useMemo } from "react";
import clsx from "clsx";
import Chip from "@mui/joy/Chip";
import { Rating, Autocomplete } from "@material-ui/lab";
import _ from "lodash"
import { createSearchParams, useNavigate } from "react-router-dom";
import {
  IconButton,
} from "@mui/material";
import {
  Share as ShareIcon,
  CurrencyExchangeOutlined as CurrencyExchangeOutlinedIcon,
  AddShoppingCartOutlined as AddShoppingCartOutlinedIcon
} from "@mui/icons-material"
import {
  Slider,
  Typography,
  TextField
} from "@material-ui/core";
import {
  MdOutlineBookmarkAdd as MdOutlineBookmarkAddIcon,
  MdOutlineBookmarkAdded as MdOutlineBookmarkAddedIcon
} from "react-icons/md"
import moment from "moment";
import { useTranslation } from "react-i18next";

import { numberCurrency, minTwoDigits, sellView, bookView } from "../../util"
import CommentComp from "../../components/CommentComp"

// const numberLotterys = Array.from({ length: 1000 }, (_, i) => i);

const DetailPanel = (props) => {
  let { user, data, onMutationBook} = props

  let length = 100
  if(data?.number_lotter){
    switch(data?.number_lotter){
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

  

  let numberLotterys = Array.from({ length }, (_, i) => i);
  return  useMemo(() => {
            return  <div className="container-detail">
                      {numberLotterys.map((seat) => {

                        const isSelected  = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && _.isEqual( buy?.userId,  user?._id));  //selectedSeats.includes(seat);
                        
                        // กรณีรายการซื้อไม่ใช่ current login
                        const isOccupied  = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && !_.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 1)); //movies.occupied?.includes(seat);
                        const isFinish    = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && _.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 1));  //movies.finish?.includes(seat);
                        const isBooking   = _.find(data?.buys, (buy)=> _.isEqual(buy?.itemId, seat) && !_.isEqual( buy?.userId,  user?._id) && _.isEqual( buy?.selected, 0));//movies.booking?.includes(seat);
                        return (
                          <div>
                            <span
                              tabIndex="0"
                              key={seat} // 
                              className={clsx("circle", 
                                              isSelected && "selected", 
                                              isOccupied && "occupied",  
                                              isFinish && "finish",  
                                              isBooking && "booking",  
                                            
                                              (isSelected || isOccupied || isFinish || isBooking ) || data?.expire && "expire" )}
                              onClick={(evt) => isOccupied || isFinish || isBooking ? null : onMutationBook({ variables: { input: { id: data?._id, itemId: seat } } }) } 
                              onKeyDown={(evt) => isOccupied || isFinish || isBooking ? null : (evt.key === "Enter" ?  onMutationBook({ variables: { input: { id: data?._id, itemId: seat } } }) : null) }>
                              {/* {" "} */}
                              {/* {isSelected ? <span className="booking-font">จองแล้ว</span> : ""} */}
                              {isBooking ? <span className="booking-font">ติดจอง</span> : ""}
                              {isOccupied ? <span className="booking-font">ขายแล้ว</span> : ""}

                              { isFinish ? <span className="booking-font">ซื้อสำเร็จ</span> :  isSelected ? <span className="booking-font">จองแล้ว</span> : ""}

                              { !(isSelected || isOccupied || isFinish || isBooking ) && data?.expire ?  <span className="booking-font">หมดอายุ</span> : "" }
                              {/* {seat <= 9 ? "0" + seat : seat} */}
                              {minTwoDigits(seat, length.toString().length )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
          }, [data]);
};

const DetailPanelRight = (props) =>{
  let { t } = useTranslation();

  let { user, 
        data, 
        onMutationBook, 
        onFollow, 
        onPopupWallet, 
        onPopupShopping,
        onMenu,
        onMutationComment } = props

  let navigate = useNavigate();
  console.log('DetailPanelRight :', data)

  let length = 100
  if(data?.number_lotter){
    switch(data?.number_lotter){
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

  let selecteds =  _.filter(data?.buys, (buy)=>_.isEqual(buy?.userId, user?._id) && _.isEqual(buy?.selected, 0) )
  let buys      =  _.filter(data?.buys, (buy)=>_.isEqual(buy?.userId, user?._id) && _.isEqual(buy?.selected, 1) )

  const marks = [
    {
      value: data?.condition,
      label: `***ข้อกำหนด : คืนโพยเมื่อยอดซื้อไม่ถึง ${data?.condition} เบอร์`,
    },
  ];
  
  const valuetext = (value, index) => {
    return `${value}°C`;
  }

  return  <div className="ber-bg1 border col-lg-8 col-md-8 col-sm-12 col-12 mb-3" style={{paddingBottom:"1rem"}}>
            <div className="row" style={{textAlign:"right"}}>
              <h4 className="card-title" style={{ float: "right" }}>
                <IconButton onClick={(e) => onFollow({ variables: { id: data?._id } }) }> 
                  { 
                    _.isEmpty(_.find(data?.follows, (f)=>f?.userId == user?._id)) 
                    ? <MdOutlineBookmarkAddIcon /> 
                    : <MdOutlineBookmarkAddedIcon style={{ color: "blue" }} /> 
                  }
                </IconButton>
                <IconButton onClick={(e) =>onMenu(e.currentTarget)}><ShareIcon /></IconButton>
              </h4>
            </div>
            {
              _.isEmpty(user)
              ? ""
              : <>
                  <div className="row pb-2">
                    <div className="col-12">
                      <div class="header_main">
                        <div class="container">
                          <div class="col-lg-12 col-12 order-lg-12 order-12 text-lg-left text-right">
                          <div className="row">
                              <div className="col-lg-6 col-12 wishlist_cart d-flex flex-row align-items-center justify-content-evenly">
                                <div className="row box wishlist bg-wallet p-2" onClick={() => onPopupWallet(true)}>
                                  <div className="col-6 bag text-center">
                                    คลิกเพื่อเติมเงิน<br />
                                    <CurrencyExchangeOutlinedIcon size={70}/>
                                  </div>
                                  <div className="col-6 money-p text-center"> 
                                    <div className="row">
                                      <Chip
                                        variant="outlined"
                                        color="success"
                                        size="sm"
                                        sx={{ pointerEvents: "none" }}>
                                        <div class="wishlist_count text-center">{ !user?.balance ? numberCurrency(0) : numberCurrency( user?.balance )}</div>
                                      </Chip>
                                    </div>
                                    <div className="row pt-1">
                                      <Chip
                                          variant="outlined"
                                          color="warning"
                                          size="sm"
                                          sx={{ pointerEvents: "none" }}>
                                          <div class="price-jong text-center">-{numberCurrency(user?.balanceBook ? user.balanceBook : 0)}</div>
                                        </Chip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-6 col-12 wishlist_cart d-flex flex-row align-items-center justify-content-evenly">
                                <div className="row box wishlist bg-buy p-2" onClick={() => onPopupShopping(true)}>
                                  <div className="col-6 bag text-center">
                                    คลิกเพื่อซื้อ<br />
                                    <div class="c_cart text-center">
                                    <AddShoppingCartOutlinedIcon size="5em"/>
                                    <div class="cart_count">
                                      <span>{selecteds.length}</span>
                                    </div>
                                  </div>
                                  </div>
                                  <div className="col-6 money-p text-center">   
                                    <Chip
                                        variant="outlined"
                                        color="warning"
                                        size="sm"
                                        sx={{ pointerEvents: "none" }}>
                                        <div class="price-red text-center">{numberCurrency(selecteds.length * data.priceUnit)}</div>
                                      </Chip>
                                    </div>
                                </div>
                              </div>
                          </div>
                            {/* 
                            <div class="wishlist_cart d-flex flex-row align-items-center justify-content-evenly">
                              <div
                                class="wishlist box d-flex flex-row align-items-center justify-content-center"
                                style={{ marginRight: "3px" }}
                                onClick={() => onPopupWallet(true)}>
                                <CurrencyExchangeOutlinedIcon size="5em"/>
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
                            </div> 
                            */}
                            <div class="row">
                              <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="pt-2 selectBer">
                                  <Autocomplete
                                    disabled={data?.expire ? true : false}
                                    size="small"
                                    open={false}
                                    multiple
                                    freeSolo
                                    disableClearable
                                    options={selecteds.map((option) => option.itemId)}
                                    getOptionLabel={(option) => option.toString()}
                                    onChange={(e, v) =>{
                                      let itemIds = _.map(selecteds, (selected)=>minTwoDigits(selected.itemId, length.toString().length ))
                                      _.map(_.difference(itemIds, v), (itemId)=>{
                                        onMutationBook({ variables: { input: { id: data?._id, itemId: parseInt(itemId) } } })
                                      })
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
                                    value={selecteds.map((option) => minTwoDigits(option.itemId, length.toString().length ) )}
                                  />
                                </div>
                              </div>
                              <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                                <div className="pt-2 finishBer">
                                  <Autocomplete
                                    disabled={data?.expire ? true : false}
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
                  {/* <div className="blog-footer"></div> */}
                </>
            }
           
            <div style={{paddingLeft: "1rem",paddingRight:"1rem"}}>
              <div style={{ textAlign: "left", color: "#aaa", fontSize: "12px" }}>หมายเหตุ : กรุณาชำระเงินภายใน 1 วัน เพราะการจองจะถูกยกเลิก</div>
              <Typography id="discrete-slider-always" gutterBottom>ซื้อไปแล้ว { sellView(data) } เบอร์ , จอง { bookView(data) } เบอร์ </Typography>
              <div className="pt-4">     
                <Slider
                  track={false}
                  aria-labelledby="track-false-range-slider"
                  getAriaValueText={valuetext}
                  defaultValue={[ bookView(data), sellView(data), data?.condition ]}
                  value={[ bookView(data), sellView(data), data?.condition ]}
                  valueLabelDisplay="on"
                  marks={marks}
                  valueLabelFormat={value => <div>{value}</div>}
                  disabled
                  ThumbComponent={(props) => {
                    // console.log("props.style :", props.style)
                    if (props["data-index"] == 0) {
                      props.style.backgroundColor = "gray";
                    } else if (props["data-index"] == 1) {
                      props.style.backgroundColor = "red";
                    }else if (props["data-index"] == 2) {
                      props.style.backgroundColor = "green";
                    }
                    return <span {...props} />;
                  }}
                  />
              </div>
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
                    src={data?.owner?.avatar?.url != null ? `${window.location.origin}/${data?.owner?.avatar?.url}` :"https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"}
                    alt="Avatar"
                  />
                  <span className="name-ava f-color-0" onClick={()=>{
                    navigate({
                      pathname: `/p`,
                      search: `?${createSearchParams({ id: data.ownerId })}`
                    })
                  }}>{data?.owner?.displayName}</span>
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
                    <li>{data?.manageLottery?.title}</li>
                    {data?.consolation ? <li>{data?.consolation}</li> : <></>} {/*รางวัลปลอบใจ เงินสด 200 บาท*/}
                    {/* <li>เบอร์ละ {data?.priceUnit} บาท</li> */}
                    {/* <li>ลุ้นรางวัล 2 ตัวล่าง</li> */}
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
              <CommentComp 
                {...props} 
                id={data?._id} 
                onMutationComment={(input)=> onMutationComment({ variables: { input }}) }/>
            </div>
          </div>
}

export default DetailPanelRight;