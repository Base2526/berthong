import React from "react";
import _ from "lodash"

const SkeletonComp =(props) =>{

    return  <div className="row">
            {
                _.map(Array(4), (date, index)=> 
                    <div className="col-md-6 col-lg-3 pb-3">
                        <div
                            key={index}
                            className="skeleton card-custom card"
                            style={{ width: "100%" }}>
                            <p className="image"></p>
                            <p className="line"></p>
                            <p className="line"></p>
                            <p className="line"></p>
                            <p className="line"></p>
                            <p className="line"></p>
                        </div>
                    </div>
                )
            }
            </div>
}

export default SkeletonComp;