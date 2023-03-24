import React, { useState, useEffect } from "react";
const DetailPanelLeft = (props) =>{
  let { data } = props
  const [currentImage, setCurrentImage] = useState(data?.files[0]);

  return  <div className="ber-bg border col-lg-4 col-md-4 col-sm-12 col-12">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="lang-detail" style={{ width: "px" }}>
                2 ตัว{data?.type === 0 ? "บน" : "ล่าง"}
              </div>
              <div className="price-detail" style={{ width: "px" }}>
                เบอร์ละ {data?.price} บาท
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
                            data-color="black">
                            <div class="screen">
                              <div className="productPage__displayImageContainer">
                                <div className="productPage__displayImage" style={{ backgroundImage: `url(${currentImage.url})` }} ></div>
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
              {data.files.map((item, index) => (
                <span
                  className="sideImage col-lg-2 col-md-4 col-sm-2 col-2"
                  onClick={() => setCurrentImage(item)}
                  style={{ backgroundImage: `url(${item.url})` }}
                ></span>
              ))}
            </div>
          </div>
}

export default DetailPanelLeft;