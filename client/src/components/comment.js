import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
	BiUpvote,
	BiSolidUpvote,
} from "react-icons/bi";
import { useNavigate } from "react-router-dom";

export default function Comment({ comment, api }) {
	const [isHoveredUp, setIsHoveredUp] = useState(false);
	const [isClickedUp, setIsClickedUp] = useState(false);
    const [votes, setVotes] = useState(0);
    
	const navigate = useNavigate();

    const buttonStyle = {
		border: "none",
		background: "none",
		cursor: "pointer",
		padding: 0,
		outline: "none",
	};

    useEffect(() => {
        setVotes(comment.votes);
    }, [comment.votes])

	const renderAnsText = (text) => {
		const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
		let lastIndex = 0;
		const parts = [];
		let match;

		while ((match = markdownLinkRegex.exec(text)) !== null) {
			const linkText = match[1];
			const linkUrl = match[2];
			const prefix = text.substring(lastIndex, match.index);

			if (prefix) {
				parts.push(prefix);
			}

			parts.push({ linkText, linkUrl });

			lastIndex = markdownLinkRegex.lastIndex;
		}

		const remainingText = text.substring(lastIndex);
		if (remainingText) {
			parts.push(remainingText);
		}

		return parts.map((part, index) => {
			if (typeof part === "object") {
				return (
					<a key={index} href={part.linkUrl}>
						{part.linkText}
					</a>
				);
			} else {
				return part;
			}
		});
	};	
    
	const UpVoteButton = (props) => {
		const onClick = async (e) => {
			e.preventDefault();

			let token = Cookies.get("token");

			if (token) {
				console.log("Click!");
				setIsClickedUp(true);
				const resp = await api.upvoteComment(comment._id);
                if (resp) {
                    setVotes(resp.votes);
                    console.log(resp);
                    if (resp.message === "Token expired") {
                        navigate("/login");
                    }    
                } else {
                    navigate("/login");
                }
			} else {
				navigate("/login");
			}
		};
		return (
			<button
				style={buttonStyle}
				onMouseEnter={() => setIsHoveredUp(true)}
				onMouseLeave={() => setIsHoveredUp(false)}
				onClick={(e) => onClick(e)}
			>
				{isClickedUp ? (
					<BiSolidUpvote size={32} />
				) : isHoveredUp ? (
					<BiSolidUpvote size={32} />
				) : (
					<BiUpvote size={32} />
				)}
			</button>
		);
	};

	return (
		<div className="comment-header">
			<p className="numViews" id="numViews">
                <UpVoteButton />
				{votes}
			</p>
			<p id="desc" className="desc">{renderAnsText(comment.text)}</p>
			<div className="username-asker">{comment.username}</div>
			<br />
		</div>
	);
}
