import React, { useState, useMemo } from "react";
import PageviewIcon from '@mui/icons-material/Pageview';
const DetailPanelLeft = (props) =>{
  let { data, onLightbox } = props
  const [photoIndex, setPhotoIndex] = useState(0)
  const [currentImage, setCurrentImage] = useState(data?.files[0])

  return  useMemo(() => {
            return  <div className="ber-bg border col-lg-4 col-md-4 col-sm-12 col-12 mb-3">
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div className="lang-detail" style={{ width: "px" }}>
                          2 ตัว{data?.type === 0 ? "บน" : "ล่าง"}
                        </div>
                        <div className="price-detail" style={{ width: "px" }}>
                          เบอร์ละ {data?.price} บาท
                        </div>
                        <div className="p-3">
                          <div className="icon-view">
                            <PageviewIcon onClick={(evt)=>{

                              console.log("props: ", props)
                              onLightbox({ isOpen: true, photoIndex, images:data?.files })
                            }} />
                          </div>
                          <img src={currentImage.url} style={{width:"100%",borderRadius:"4px"}} alt="picture"/>
                        </div>
                    </div>
                      <div className="row pb-3" style={{ justifyContent: "center" }}>
                        {data?.files?.map((item, index) => (
                          <span
                            className="sideImage col-lg-2 col-md-4 col-sm-2 col-2"
                            onClick={() =>{
                              setPhotoIndex(index)
                              setCurrentImage(item)
                            }}
                            style={{ backgroundImage: `url(${item.url})`,borderRadius:"4px" }}
                          ></span>
                        ))}
                      </div>
                    </div>
          }, [data, currentImage]);
}

export default DetailPanelLeft;