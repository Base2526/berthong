import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

// import { usePdf } from '@mikecousins/react-pdf';

import filePdf from "../pdf/sample.pdf";

const HelpPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const [page, setPage] = useState(1);
    const canvasRef = useRef(null);

    return (<div>HelpPage</div>)

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