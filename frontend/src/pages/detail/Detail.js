import "./detail.css";
import "./seat.css";
import "./wallet.css";

import React, { useState } from "react";
import clsx from "clsx";
import Chip from "@mui/joy/Chip";
import TextField from "@material-ui/core/TextField";
import { Rating, Autocomplete } from "@material-ui/lab";

import PopupCart from "./PopupCart";
import PopupWallet from "./PopupWallet";

const Detail = (props) => {
  const finishBuy = [12, 14, 17];

  const dataDetail = [
    {
      catogory: "money",
      id: "1",
      title: "APPLE iPhone 12 Pro (Gold, 128 GB)",
      rating: "4.5",
      detail:
        "A14 Bionic rockets past every other smartphone chip. The Pro camera system takes low-light photography to the next level — with an even bigger jump on iPhone 12 Pro Max. And Ceramic Shield delivers four times better drop performance. Let’s see what this thing can do.",
      price: "1000",
      image: [
        "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbr37gm57f7.jpeg?q=70",
        "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrnpyygbv9.jpeg?q=70",
        "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrpksqr8zu.jpeg?q=70",
        "https://rukminim1.flixcart.com/image/416/416/kg8avm80/mobile/s/9/w/apple-iphone-12-pro-dummyapplefsn-original-imafwgbrgcctfysm.jpeg?q=70"
      ]
    }
  ];

  const movies = [
    {
      name: "Avenger",
      price: 100,
      occupied: [20, 21, 30, 1, 2, 8],
      finish: [10, 11, 12, 15, 18],
      booking: [9, 22, 24, 44, 45]
    }
  ];

  const seats = Array.from({ length: 10 * 10 }, (_, i) => i);
  const [selectedMovie, setSelectedMovie] = useState(movies[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBuy, setSelectedBuy] = useState([]);
  const [dispImg, setDispImg] = useState(dataDetail[0].image[0]);
  const [isPopupOpened, setPopupOpened] = useState(false);
  const [isPopupOpenedWallet, setPopupOpenedWallet] = useState(false);

  const currencyFormat = (num) => {
    return "$" + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  const changeAutocomplete = (item) => {
    setSelectedSeats(item);
    setSelectedBuy(item);
  };

  const Cinema = ({ movie, selectedSeats, onSelectedSeatsChange }) => {
    const handleSelectedState = (seat) => {
      const isSelected = selectedSeats.includes(seat);

      if (isSelected) {
        onSelectedSeatsChange(
          selectedSeats.filter((selectedSeat) => selectedSeat !== seat)
        );
        setSelectedBuy(
          selectedBuy.filter((selectedSeat) => selectedSeat !== seat)
        );
      } else {
        onSelectedSeatsChange([...selectedSeats, seat]);
        setSelectedBuy([...selectedBuy, seat]);
      }
    };

    return (
      <div className="container-detail">
        {seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat);
          const isOccupied = movie.occupied.includes(seat);
          const isFinish = movie.finish.includes(seat);
          const isBooking = movie.booking.includes(seat);
          // const isJackpot = movie.jackpot.includes(seat);
          return (
            <div>
              <span
                tabIndex="0"
                key={seat}
                className={clsx(
                  "circle",
                  isSelected && "selected",
                  isOccupied && "occupied",
                  isFinish && "finish",
                  isBooking && "booking"
                )}
                onClick={
                  isOccupied || isFinish || isBooking
                    ? null
                    : () => handleSelectedState(seat)
                }
                onKeyPress={
                  isOccupied || isFinish || isBooking
                    ? null
                    : (e) => {
                        if (e.key === "Enter") {
                          handleSelectedState(seat);
                        }
                      }
                }
              >
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

  return (
    <div className="row">
      <PopupCart
        opened={isPopupOpened}
        dataSelect={selectedBuy}
        onClose={() => setPopupOpened(false)}
      />
      <PopupWallet
        opened={isPopupOpenedWallet}
        onClose={() => setPopupOpenedWallet(false)}
      />
      <div className="ber-bg border col-lg-4 col-md-4 col-sm-12 col-12">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="lang-detail" style={{ width: "px" }}>
            2 ตัวบน
          </div>
          <div className="price-detail" style={{ width: "px" }}>
            เบอร์ละ 100 บาท
          </div>
          <header class="masthead">
            <div class="container px-5">
              <div class="row gx-5 align-items-center">
                <div class="col-lg-12 col-12">
                  <div class="masthead-device-mockup">
                    <svg
                      class="circle1"
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="circleGradient"
                          gradientTransform="rotate(45)"
                        >
                          <stop class="gradient-start-color" offset="0%"></stop>
                          <stop class="gradient-end-color" offset="100%"></stop>
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="50"></circle>
                    </svg>
                    <svg
                      class="shape-1 d-sm-block"
                      viewBox="0 0 240.83 240.83"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="-32.54"
                        y="78.39"
                        width="305.92"
                        height="84.05"
                        rx="42.03"
                        transform="translate(120.42 -49.88) rotate(45)"
                      ></rect>
                      <rect
                        x="-32.54"
                        y="78.39"
                        width="305.92"
                        height="84.05"
                        rx="42.03"
                        transform="translate(-49.88 120.42) rotate(-45)"
                      ></rect>
                    </svg>
                    <svg
                      class="shape-2 d-sm-block"
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="50" cy="50" r="50"></circle>
                    </svg>
                    <div class="device-wrapper">
                      <div
                        class="device"
                        data-device="iPhoneX"
                        data-orientation="portrait"
                        data-color="black"
                      >
                        <div class="screen">
                          <div className="productPage__displayImageContainer">
                            <div
                              className="productPage__displayImage"
                              style={{ backgroundImage: `url(${dispImg})` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
        <div className="row pb-3" style={{ justifyContent: "center" }}>
          {dataDetail[0].image.map((item, index) => (
            <span
              className="sideImage col-lg-2 col-md-4 col-sm-2 col-2"
              onClick={() => setDispImg(item)}
              style={{ backgroundImage: `url(${item})` }}
            ></span>
          ))}
        </div>
      </div>
      <div className="ber-bg1 border col-lg-8 col-md-8 col-sm-12 col-12">
        <div className="row pb-2">
          <div className="col-12">
            <div class="header_main">
              <div class="container">
                <div class="pt-2 col-lg-12 col-12 order-lg-12 order-12 text-lg-left text-right">
                  <div class="wishlist_cart d-flex flex-row align-items-center justify-content-evenly">
                    <div
                      class="wishlist box d-flex flex-row align-items-center justify-content-center"
                      style={{ marginRight: "3px" }}
                      onClick={() => setPopupOpenedWallet(true)}
                    >
                      <div class="">
                        <img
                          style={{ width: "50px" }}
                          src={
                            "https://cdn3.iconfinder.com/data/icons/dottie-finance/24/finance_038-piggy_bank-pig-saving-money-128.png"
                          }
                          alt=""
                        />
                      </div>

                      <div class="wishlist_content">
                        <div class="wishlist_text" style={{ color: "#fff" }}>
                          <a href="#">คงเหลือ</a>
                        </div>
                        <Chip
                          variant="outlined"
                          color="success"
                          size="sm"
                          sx={{ pointerEvents: "none" }}
                        >
                          <div class="wishlist_count">$2,000</div>
                        </Chip>
                      </div>
                    </div>
                    <div class="wishlist1 wishlist-new box cart d-flex flex-row align-items-center">
                      <div
                        onClick={() => setPopupOpened(true)}
                        class="cart_container d-flex flex-row align-items-center justify-content-center"
                      >
                        <div class="c_cart">
                          <img
                            style={{ width: "50px" }}
                            src={
                              "https://cdn-icons-png.flaticon.com/512/1250/1250555.png?w=740&t=st=1678529252~exp=1678529852~hmac=5678bfc20393a861854638741bc8c07a4ae07edd75fb52e4ebb91035b8843ec8"
                            }
                            alt=""
                          />
                          <div class="cart_count">
                            <span>{selectedBuy.length}</span>
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
                            sx={{ pointerEvents: "none" }}
                          >
                            <div class="price-red">
                              {currencyFormat(selectedBuy.length * 100)}
                            </div>
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="pt-2 selectBer">
                        <Autocomplete
                          size="small"
                          multiple
                          freeSolo
                          options={selectedBuy.map((option) => option)}
                          onChange={(e, v) => changeAutocomplete(v)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`เลือก/จอง(${selectedBuy.length})`}
                              margin="normal"
                              variant="standard"
                              fullWidth
                            />
                          )}
                          value={selectedBuy.map((option) => option)}
                        />
                      </div>
                    </div>
                    <div class="col-lg-6 col-md-12 col-sm-12 col-12">
                      <div className="pt-2 finishBer">
                        <Autocomplete
                          size="small"
                          multiple
                          freeSolo
                          readOnly
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`ซื้อสำเร็จแล้ว(3)`}
                              margin="normal"
                              variant="standard"
                              fullWidth
                            />
                          )}
                          value={finishBuy.map((option) => option)}
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
            <Cinema
              movie={selectedMovie}
              selectedSeats={selectedSeats}
              onSelectedSeatsChange={(selectedSeats) =>
                setSelectedSeats(selectedSeats)
              }
            />
          </div>
        </div>
        <div className="pt-3"></div>
        <div className="blog-footer"></div>
        <div className="row m-1">
          <div className="col-12">
            <div class="avatar" style={{ textAlign: "left" }}>
              <img
                src={
                  "https://img.myloview.com/stickers/default-avatar-profile-icon-vector-social-media-user-image-700-205124837.jpg"
                }
                alt="Avatar"
              />
              <span className="name-ava f-color-0">Hello World</span>
              <span className="rate">
                <Rating name="half-rating" value={3.5} precision={0.5} />
              </span>
            </div>
          </div>
          <div class="blog-body">
            <div class="blog-title" style={{ textAlign: "left" }}>
              <h3>ถูกรับ เงินสดมูลค่า 1,000 บาท</h3>
            </div>
            <div class="blog-summary" style={{ textAlign: "left" }}>
              <p style={{ margin: "5px" }}>
                Here is an example of a post without a cover image. You don't
                always have to have a cover image. In fact, leaving them out
              </p>
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
                      <a
                        href="#"
                        style={{ backgroundColor: "gold", color: "#000" }}
                      >
                        ทอง
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        style={{ backgroundColor: "blue", color: "#fff" }}
                      >
                        สิ่งของ
                      </a>
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
    </div>
  );
};

export default Detail;
