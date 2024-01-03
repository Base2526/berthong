import React, { useState, useMemo } from "react";
import PageviewIcon from '@mui/icons-material/Pageview';
const DetailPanelLeft = (props) =>{
  let { data, onLightbox } = props
  const [photoIndex, setPhotoIndex] = useState(0)
  const [currentImage, setCurrentImage] = useState(data?.files[0])

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

  return  useMemo(() => {
            return  <div className="ber-bg border col-lg-4 col-md-4 col-sm-12 col-12 mb-3">
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div className="lang-detail" style={{ width: "px" }}>
                          {data?.number_lotter === 1 ? "3" : "2"} ตัว{data?.type === 0 ? "บน" : data?.type === 1 ? "ล่าง" : "บน/ล่าง"}
                        </div>
                        <div className="price-detail" style={{ width: "px" }}>
                          เบอร์ละ {data?.priceUnit}{/* {length} */ } บาท
                        </div>
                        <div className="p-3">
                          <div className="icon-view">
                            <PageviewIcon onClick={(evt)=> onLightbox({ isOpen: true, photoIndex, images:data?.files }) } />
                          </div>
                          <img src={`${window.location.origin}/${currentImage?.url}`} style={{width:"100%",borderRadius:"4px"}} alt="picture"/>
                        </div>
                    </div>
                      <div className="row pb-3" style={{ justifyContent: "center" }}>
                        {data?.files?.map((item, index) => (
                          // 
                          <span
                            className="sideImage col-lg-2 col-md-4 col-sm-2 col-2"
                            onClick={() =>{
                              setPhotoIndex(index)
                              setCurrentImage(item)
                            }}
                            style={{ backgroundImage: `url(${window.location.origin}/${item.url})`,borderRadius:"4px" }}
                          ></span>
                        ))}
                      </div>
                    </div>
          }, [data, currentImage]);
}

export default DetailPanelLeft;