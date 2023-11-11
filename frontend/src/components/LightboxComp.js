import React, { useState, useEffect } from "react";
import Lightbox from "react-image-lightbox";

const LightboxComp =(props) =>{
    let { datas, onLightbox } = props
    const [lightbox, setLightbox] = useState(datas);
    useEffect(()=>{ onLightbox(lightbox) }, [lightbox])

    return  <Lightbox
                mainSrc={ lightbox?.images[lightbox.photoIndex]?.url 
                          ? `${window.location.origin}/${lightbox?.images[lightbox.photoIndex]?.url}`
                          : URL.createObjectURL(lightbox.images[lightbox.photoIndex]) }
                nextSrc={ lightbox?.images?.length >= 2 
                          ? lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length]?.url 
                            ? `${window.location.origin}/${lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length]?.url}` 
                            : URL.createObjectURL( lightbox?.images[(lightbox.photoIndex + 1) % lightbox.images.length] ) 
                          : undefined
                        }
                prevSrc={ lightbox?.images?.length >= 2 
                          ? lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length]?.url 
                            ? `${window.location.origin}/${lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length]?.url}`
                            : URL.createObjectURL(lightbox?.images[(lightbox.photoIndex + lightbox.images.length - 1) % lightbox?.images?.length])
                          : undefined
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
                }}
                />
}

export default LightboxComp;

