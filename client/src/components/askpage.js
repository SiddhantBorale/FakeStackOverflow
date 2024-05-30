import { useState } from 'react';
import '../stylesheets/App.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function AskQuestion({model}) {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [tags, setTags] = useState("");
    const [summary, setSummary] = useState("");

    const [errMsg, setErrMsg] = useState("");

    const navigate = useNavigate();

    const {qid} = useParams();

    const validateTags = (tagsList) => {
        console.log(tagsList);

        if (tagsList.length > 5) {
            return false;
        }

        for (let tag of tagsList) {
            if (tag.length > 20) {
                return false;
            }
        }

        return true;
    }

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

    const formSubmit = async (e) => {
        e.preventDefault();
        let tagsList = tags.split(/(\s+)/).filter( e => e.trim().length > 0);

        if (!validateTags(tagsList)) {
            setErrMsg("Invalid tags!");
            return;
        }

        if (!isValidHyperlink(text)) {
            setErrMsg("Invalid link format!");
            return;
        }

        if (!qid) {
            let resp = await model.addNewQuestion(title, text, tagsList, summary);
            if (resp === "Token expired") {
                navigate("/login");
            }
        } else {
            let resp = await model.updateQuestion(title, text, tagsList, qid, summary);
            if (resp === "Token expired") {
                navigate("/login");
            }            
        }

        navigate("/questions");
    }

    const deleteQuestion = async(e) => {
        e.preventDefault();
        let resp = await model.deleteQuestion(qid);
        console.log(resp);
        navigate(-1);
    }

    return (
        <div className="ask-question-page">
            <form id="ask-question-form" onSubmit={e => formSubmit(e)}>
                <h1>Question Title*</h1>
                <p>Limit to 100 characters or less</p>
                <div className="title">
                    <input
                        id="question-title"
                        className="title-input"
                        type="text"
                        placeholder="title..."
                        required
                        maxLength="100"
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>
                <h1>Question Summary*</h1>
                <p>Max 140 characters</p>
                <div>
                    <textarea
                        id="question-text"
                        className="text-input"
                        placeholder="Enter Text..."
                        required
                        onChange={e => setSummary(e.target.value)}
                        maxLength={140}
                    ></textarea>
                </div>                
                <h1>Question Text*</h1>
                <p>Add details</p>
                <div>
                    <textarea
                        id="question-text"
                        className="text-input"
                        placeholder="Enter Text..."
                        required
                        onChange={e => setText(e.target.value)}
                    ></textarea>
                </div>
                <h1>Tags*</h1>
                <p>Add keywords separated by whitespace.</p>
                <div>
                    <input
                        id="tag-list"
                        className="tag-input"
                        type="text"
                        placeholder="Enter Tags..."
                        required
                        onChange={e => setTags(e.target.value)}
                    />
                </div>
                <div className="post-question">
                    <button className="post-question-button" id="post-question-button" type="submit">
                        Post Question
                    </button>
                    {qid && <button className="post-question-button" id="post-question-button" onClick={(e) => deleteQuestion(e)}>
                        Delete Question
                    </button>    }                
                    <p className='warning'>* indicates mandatory field</p>
                    <p className='warning'>{errMsg}</p>
                </div>
            </form>
        </div>
    );
}