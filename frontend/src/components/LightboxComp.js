import React, { useState, useEffect } from "react";
import Lightbox from "react-image-lightbox";

const LightboxComp =(props) =>{
    const [lightbox, setLightbox] = useState(props?.lightbox);
    useEffect(()=>{ props?.onLightbox(lightbox) }, [lightbox])
    return  <Lightbox
                mainSrc={ lightbox?.images[lightbox.photoIndex]?.url 
                          ? lightbox?.images[lightbox.photoIndex]?.url 
                          : URL.createObjectURL(lightbox.images[lightbox.photoIndex]) }
                nextSrc={lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length]?.url 
                         ? lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length]?.url 
                         : URL.createObjectURL( lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length] ) }
                prevSrc={
                    lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length]?.url 
                    ? lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length]?.url
                    : URL.createObjectURL(lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length])
                }
                onCloseRequest={() => {
                    setLightbox({ ...lightbox, isOpen: false });
                }}
                onMovePrevRequest={() => {
                    setLightbox({
                    ...lightbox,
                    photoIndex:
                        (lightbox.photoIndex + lightbox.images.length - 1) % lightbox.images.length
                    });
                }}
                onMoveNextRequest={() => {
                    setLightbox({
                    ...lightbox,
                    photoIndex: (lightbox.photoIndex + 1) % lightbox.images.length
                    });
                }}/>
}

export default LightboxComp;

