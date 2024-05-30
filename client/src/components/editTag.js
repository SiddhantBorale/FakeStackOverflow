
import { useEffect, useState } from 'react';
import '../stylesheets/App.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditTag({model}) {

    const [tags, setTags] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    const {tid} = useParams();

    useEffect(() => {
        async function fetchData() {
            let data = await model.fetchOtherUser(tid);
            console.log("data: ", data)
            if (data.isDup) {
                alert("Cannot edit tag as it is being used by other users");
                navigate(-1);
            }
			await model.optimizeTags();
        }
        fetchData();
    }, [model, navigate, tid])

    const validateTags = (tagsList) => {
        console.log(tagsList);

        if (tagsList.length > 1) {
            return false;
        }

        for (let tag of tagsList) {
            if (tag.length > 20) {
                return false;
            }
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
        let resp = await model.editTag(tid, tags);
        if (resp === "Token expired") {
            navigate("/login");
        }

        navigate(-1);
    }

    const deleteTag = async(e) => {
        e.preventDefault();
        let resp = await model.deleteTag(tid);
        if (resp === "Token expired") {
            navigate("/login");
        }

        navigate(-1);        
    }

    return (
        <div className="ask-question-page">
            <form id="ask-question-form" onSubmit={e => formSubmit(e)}>
                <h1>Tags*</h1>
                <p>Add keywords separated by whitespace.</p>
                <div>
                    <input
                        id="tag-list"
                        className="tag-input"
                        type="text"
                        placeholder="Enter Tag..."
                        required
                        onChange={e => setTags(e.target.value)}
                    />
                </div>
                <div className="post-question">
                    <button className="post-question-button" id="post-question-button" type="submit">
                        Post Tag
                    </button>
                    <button className="post-question-button" id="post-question-button" onClick={(e) => deleteTag(e)}>
                        Delete Tag
                    </button>                    
                    <p className='warning'>* indicates mandatory field</p>
                    <p className='warning'>{errMsg}</p>
                </div>
            </form>
        </div>        
    );
    
}