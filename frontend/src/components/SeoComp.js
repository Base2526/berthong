import React from "react";
import { Helmet } from 'react-helmet-async';

const SeoComp = (props) => {
    const { title, description, type, name, image_url } = props

    let { REACT_APP_SITE_TITLE } = process.env

    return (
        <Helmet>
            <title>{`${REACT_APP_SITE_TITLE} | ${title}`}</title>
            <meta name="description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={`${REACT_APP_SITE_TITLE} | ${title}`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image_url} />
            <meta property="og:image:height" content="360" />
            <meta property="og:image:width" content="480" />

            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={`${REACT_APP_SITE_TITLE} | ${title}`} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

/*
<title>My Page Title</title>
<link as="image" rel="preload" href="https://i.ytimg.com/vi/E0APXrppsP4/hqdefault.jpg" fetchpriority="high"></link>
<link rel="image_src" href="https://picsum.photos/100"></link>
<meta name="description" content="This is a description of my page" />
<meta name="keywords" content="react, meta tags, seo" />
<meta name="author" content="Your Name" />
<meta property="og:title" content="My Page Title" />
<meta property="og:description" content="This is a description of my page" />
<meta property="og:image" content="https://i.ytimg.com/vi/E0APXrppsP4/hqdefault.jpg" />
<meta property="og:image:height" content="360" />
<meta property="og:image:width" content="480" />
<meta property="og:url" content="https://theberthong.store/d?id=652ccee4ba6ed400083ae463" />
<meta name="twitter:title" content="XXX-My Page Title" />
<meta name="twitter:description" content="This is a description of my page" />
<meta name="twitter:image" content="https://i.ytimg.com/vi/E0APXrppsP4/hqdefault.jpg" />
<meta name="twitter:card" content="summary_large_image" />
*/

export default SeoComp;