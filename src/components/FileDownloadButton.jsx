import React from 'react';
import {Button} from "@mui/material";

function FileDownloadButton({text, filename}) {
    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // 필요한 경우에만 body에 추가
        element.click();
    };

    return (
        <Button style={{
            marginTop: "1em",
            width: "100%",
            fontFamily: "KakaoOTFBold",
        }} variant="contained" onClick={handleDownload}>Download</Button>
    );
}

export default FileDownloadButton;
