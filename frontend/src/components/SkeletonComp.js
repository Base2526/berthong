import React, {useMemo, useState} from "react";
import _ from "lodash"

const SkeletonComp =(props) =>{
    const [data, setData] = useState(Array.from({ length: 4 }, (_, i) => i))
    return  useMemo(() => {
                return  <div className="row">
                        {
                            _.map(data, (value, index)=> 
                                <div className="col-md-6 col-lg-3 pb-3" key={index}>
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
            }, [data]);
}

export default SkeletonComp;