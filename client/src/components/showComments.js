import { useEffect, useRef, useState } from "react";
import Comment from "./comment";
import Cookies from "js-cookie";

export default function Comments({model, qid, aid}) {
    const [comments, setComments] = useState([]);
    const [curCmPage, setCurCmPage] = useState(0);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
    const commentRef = useRef();

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

    const postComment = async (e) => {
		e.preventDefault();
		if (!isValidHyperlink(commentRef.current.value)) {
			alert("Invalid Link format!");
		}
        if (qid) {
            const resp = await model.addComment({
                questionID: qid,
                text: commentRef.current.value,
            });
            if (resp) {
                let cms = await model.getCommentsForQuestion(qid);
                console.log("Posted q");
                setComments(cms);
            }
        } else {
            const resp = await model.addComment({
                answerID: aid,
                text: commentRef.current.value,
            });
            if (resp) {
                let cms = await model.getCommentsForAnswer(aid);
                console.log("Posted c");
                setComments(cms);
            }
        }
	};	

    useEffect(() => {
        async function fetchData() {
            let cms;
            if (qid) {
                cms = await model.getCommentsForQuestion(qid);
                setComments(cms);
            } else {
                cms = await model.getCommentsForAnswer(aid);
                setComments(cms);
            }
			await model.optimizeTags();

        }
        fetchData();
        if (Cookies.get("token")) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
    }, [aid, model, qid]);

    const NUM_COMMENTS = 3;

	const printComments = (comments) => {
        console.log("CommentsL: ", comments);
		const startIndex = curCmPage * NUM_COMMENTS;
		const selectedCms = comments.slice(
			startIndex,
			startIndex + NUM_COMMENTS
		);
		return selectedCms.map((comment) => {
			return (
				<Comment key={comment._id} comment={comment} api={model} />
			);
		});
	}; 

	const handlePrev = (e) => {
        e.preventDefault();
        setCurCmPage(
            (prevPage) =>
                (prevPage - 1 + Math.ceil(comments.length / NUM_COMMENTS)) %
                Math.ceil(comments.length / NUM_COMMENTS)
        );
	}

	const handleNext = (e) => {
        e.preventDefault();
        setCurCmPage(
            (prevPage) =>
                (prevPage + 1) % Math.ceil(comments.length / NUM_COMMENTS)
        );
	};    

	return (
		<div>
			<div>
				{isLoggedIn && (
					<textarea
						ref={commentRef}
						className="commentBox"
						name="inpComment"
						rows={5}
						cols={50}
						placeholder="Enter a comment..."
					></textarea>
				)}
				<br />
				<br />
				{isLoggedIn && (
					<button
						className="ask-question-button"
						onClick={(e) => postComment(e)}
					>
						Post!
					</button>
				)}
				<br />
				<br />                
			</div>	            
			{comments.length ? <div id="controls" className="controls">
				<button onClick={e => handlePrev(e)} disabled={curCmPage === 0}>
					Prev
				</button>
				<button onClick={e => handleNext(e)}>Next</button>
			</div> : ""}
			<div>{printComments(comments)}</div>
		</div>
	);
}
