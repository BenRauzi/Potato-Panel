import React from 'react';
import Helmet from 'react-helmet';

const TitleComponent = ({ title }) => (
    <Helmet>
        <title>{title ? `ArmA Studios | ${title}` : "ArmA Studios"}</title>
    </Helmet>
)

export default TitleComponent;