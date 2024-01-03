import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// import { usePdf } from '@mikecousins/react-pdf';

// import filePdf from "../pdf/sample.pdf";

import manual_1 from "../images/manual_1.png";
import manual_2 from "../images/manual_2.png";
import manual_3 from "../images/manual_3.png";
import manual_4 from "../images/manual_4.png";
import manual_5 from "../images/manual_5.png";

const HelpPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const [page, setPage] = useState(1);
    const canvasRef = useRef(null);

    let { onLightbox } = props

    let files = [{id: 0, url :manual_1}, {id: 1, url :manual_2}, {id: 2, url :manual_3}, {id: 3, url :manual_4}, {id: 4, url :manual_5}]
    // 

    return (<div className="user-list-container">   
                <p>ข้อมูลการใช้ระบบ</p>
                <ol>
                    <li key="0" onClick={(evt)=>onLightbox({ isOpen: true, photoIndex: 0, images:files })}>การลงทะเบียนเข้าใช้งานระบบ</li>
                    <li key="1" onClick={(evt)=>onLightbox({ isOpen: true, photoIndex: 0, images:files })}>การฝาก/ถอดเงิน</li>
                </ol>
            </div>)

    // const { pdfDocument, pdfPage } = usePdf({
    //     file: filePdf,
    //     page,
    //     canvasRef,
    // });

    // return (<div>
    //             {!pdfDocument && <span>Loading...</span>}
    //             <canvas ref={canvasRef} />
    //             {Boolean(pdfDocument && pdfDocument.numPages) && (
    //                 <nav>
    //                 <ul className="pager">
    //                     <li className="previous">
    //                     <button disabled={page === 1} onClick={() => setPage(page - 1)}>
    //                         Previous
    //                     </button>
    //                     </li>
    //                     <li className="next">
    //                     <button
    //                         disabled={page === pdfDocument.numPages}
    //                         onClick={() => setPage(page + 1)}
    //                     >
    //                         Next
    //                     </button>
    //                     </li>
    //                 </ul>
    //                 </nav>
    //             )}
    //         </div>)
}
export default HelpPage