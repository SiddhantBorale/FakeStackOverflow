
import { useState } from 'react';
import '../stylesheets/App.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function PostAnswer({model}) {
    const [ans, setAns] = useState("");
    const [warn, setWarn] = useState("");
    const {qid, aid} = useParams();
    const navigate = useNavigate();

    const isValidHyperlink = (text) => {
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const match = markdownLinkRegex.exec(text);
        
        if (!match) {
            return true;
        }
    
        const linkUrl = match[2];
      
        if (!linkUrl.startsWith("http://") && !linkUrl.startsWith("https://")) {
            return false;
        }
      
        return true;
    }

    const addAns = async(e) => {
        e.preventDefault();
        if (isValidHyperlink(ans) === false) {
            setWarn("The text contains an invalid link");
            return;
        }
        console.log("Qid: ", qid);
        if (qid) {
            let resp = await model.createNewAns(ans, qid);
            console.log("resp: ", resp)
            if (resp === "Token expired") {
                navigate("/login");
            }
        } else {
            let resp = await model.editAns(ans, aid);
            console.log("resp: ", resp)
            if (resp === "Token expired") {
                navigate("/login");
            }            
        }
        if (window.history?.length && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    }

    const deleteAnswer = async(e) => {
        e.preventDefault();
        let resp = await model.deleteAnswer(aid);
        console.log(resp);
        navigate(-1);
    }

    return (
        <div className="ask-ans-page">
            <form id="ask-ans-page" onSubmit={e => addAns(e)}>
                <h1>Answer Text*</h1>
                <div>
                    <input id="anstext" required className="text-input" type="text" placeholder="Enter Text..." onChange={e => setAns(e.target.value)}></input>
                </div>
                <div className="post-question">
                    <button id="btnsubmit" type="submit" className="post-question-button">Post Answer</button>
                    {!qid ? <button id="btnsubmit" className="post-question-button" onClick={(e) => deleteAnswer(e)}>Delete Answer</button> : ""}
                    <p>* indicates mandatory field</p>
                    <p>{warn}</p>
                </div>
            </form>
        </div>
    );
}



