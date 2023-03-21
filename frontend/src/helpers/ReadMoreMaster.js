import React, {useState, useCallback, useEffect} from 'react';
import truncate from "truncate-html";
import { IconButton, Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

// refer : https://stackoverflow.com/questions/71472309/read-show-more-or-less-of-html-content-or-normal-text-using-single-reusable-reac
const ReadMoreMaster = (props) => {
    let {byWords,parentClass, readLess, readMore, length, ellipsis, spaceBefore, label} = props;
    const [showMore, setShowMore] = useState(false);
    const { t } = useTranslation();

    truncate.setup({
        byWords: !!byWords,
        ellipsis: ellipsis ? ellipsis : '',
    })

    const [state, setState] = useState({
        showRealData: false,
        realData: props.children,
        truncatedData: truncate(props.children, length ? length : 2)
    });

    const handleShowData = useCallback(() => {
        setState(prevState => ({
            ...prevState,
            showRealData: !prevState.showRealData
        }));
    }, [setState]);

    useEffect(() => {
        if(byWords && props.children) {
            const textDetails = props.children.replace(/<[^>]+>/g, '');
            const arr = textDetails.split(" ");
            if(arr.length > length) {
                setShowMore(true);
            }
        }
    }, [byWords])

    return (
        <div className={parentClass}>
            <Typography variant="subtitle2" color="textSecondary"> {label ? label+ " :" : ""} </Typography>
            <div
                className="show-more-text"
                dangerouslySetInnerHTML={{
                    __html: `${
                        !state.showRealData ? state.truncatedData : state.realData
                    }`
                }}
            />

            {spaceBefore === false ? '' : ' '}

            {
                showMore &&
                <a href={void (0)} className="read-more" onClick={handleShowData}>
                   {!state.showRealData ? readMore ? readMore : t("see_more") : readLess ? '' : ''}
                    {/* {!state.showRealData ? readMore ? readMore : 'Read More' : readLess ? readLess : 'Read Less'} */}
                </a>
            }
        </div>
    );
};

export default ReadMoreMaster;