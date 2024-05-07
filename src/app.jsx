import React, {useEffect, useRef, useState} from "react";
import {FileDrop} from "react-file-drop";
import Progress from "./components/Progress/Progress.jsx";
import yaml from "js-yaml";
import {getSealedSecret} from "@socialgouv/aes-gcm-rsa-oaep";
import FileDownloadButton from "./components/FileDownloadButton";
import publicKey from './resources/certs/public.json'
import "./app.scss";

export default function App() {
    const inputRef = useRef();
    const [filenames, setNames] = useState([]);
    const [sealed, setSealed] = useState("");
    const [uploaded, setUploaded] = useState(false);
    const pemKey = publicKey.active

    const decodeObject = obj => {
        const decodedObj = {};
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                decodedObj[key] = atob(obj[key]);
            }
        }
        return decodedObj;
    };
    const fileHandler = (files) => {
        setUploaded(true)
        const extension = files[0].name.split(".")[1]?.toLowerCase();
        if (extension !== undefined) {
            const fNames = Object.keys(files).map((name) => {
                return {
                    name: files[name].name,
                    icon: files[name].name.split(".")[1]?.toUpperCase().trim()
                };
            });
            const reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onload = async () => {
                const secret = yaml.load(reader.result)
                const sealedSecret = await getSealedSecret({
                    pemKey: pemKey,
                    namespace: secret.metadata.namespace,
                    name: secret.metadata.name,
                    scope: "cluster",
                    values: decodeObject(secret.data),
                })
                setSealed(yaml.dump(sealedSecret))
            };
            setNames((prev) => [fNames].flat());

        } else {
            alert("file type not supported");
        }
    };

    const filePicker = () => {
        inputRef.current.click();
    };
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };
    return (
        <>
            <div className="container">
                <h3>K8S Sealed Secret</h3>

                <div className="progressContainer" style={{display: uploaded ? "" : "none"}}>
                    {filenames &&
                        filenames.map((file, i) => (
                            <Progress key={i} name={file.name} icon={file.icon}/>
                        ))}

                    <FileDownloadButton text={sealed} filename={"sealedSecret.yaml"}/>
                </div>

                <div style={{display: uploaded ? "none" : ""}}>
                    <FileDrop
                        onTargetClick={filePicker} onDrop={(f) => fileHandler(f)}>
                        <p className="placeholder">
                            DROP <span>SECRET</span> HERE <br/> OR <span>BROWSE</span>
                        </p>
                        <input
                            accept=".yml, .yaml"
                            value=""
                            style={{visibility: "hidden", opacity: 0}}
                            ref={inputRef}
                            multiple="multiple"
                            type="file"
                            onChange={(e) => fileHandler(e.target.files)}
                        />
                    </FileDrop>
                </div>

            </div>
        </>
    );
}
