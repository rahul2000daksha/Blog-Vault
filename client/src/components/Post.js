import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './post.css';
import defaultAvatar from '../images/Default-User-Image.png';


const Post = ({ post, userId, handleDeletePost }) => {
    const navigate = useNavigate();
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [replyContent, setReplyContent] = useState('');
    const [activeReplyForm, setActiveReplyForm] = useState(null);
    const replyFormRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close the active reply form if the click is outside any reply button
            if (!event.target.closest('.reply-button') && !event.target.closest('.reply-form')) {
                setActiveReplyForm(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
                headers: { Authorization: token },
            });
            handleDeletePost(post._id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = () => {
        navigate(`/edit/${post._id}`);
    };

    const handleAddComment = async () => {
        if (!commentContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/posts/${post._id}/comments`,
                { content: commentContent },
                { headers: { Authorization: token } }
            );

            setComments(response.data);
            setCommentContent('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };


    const handleAddReply = async (commentId) => {
        if (!replyContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/replies`,
                { content: replyContent },
                { headers: { Authorization: token } }
            );

            setComments(response.data);
            setReplyContent('');
            setActiveReplyForm(null); // Close the reply form
        } catch (error) {
            console.error('Failed to add reply:', error);
        }
    };



    const profileImageSrc = post.author?.profileImage
        ? `http://localhost:5000${post.author.profileImage}`
        : defaultAvatar;


    return (
        <div className={post.author?._id !== userId ? "post-card" : "realAuthor-post-card"}>
            <div className="post-footer">
                <div className='post-author-div'>
                    <img
                        src={profileImageSrc}
                        alt=""
                        className="author-image"
                    />
                    <small className="post-author">By: {post.author?.username || 'Unknown'}</small>
                </div>

                <div className="post-buttons">
                    {post.author?._id === userId &&
                        <>
                            <button onClick={handleEdit} className="post-edit-btn">Edit</button>
                            <button onClick={handleDelete} className="post-delete-btn">Delete</button>
                        </>
                    }
                </div>



            </div>
            <h2 className="post-title">{post.title}</h2>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />


            <div className='comments-section'>
                <h4>Comments :</h4>
                {comments.map((comment) => (
                    <div key={comment._id} className="comment">
                        <img
                            src={`http://localhost:5000${comment.user?.profileImage}` || defaultAvatar}
                            alt="Commenter"
                            className="comment-avatar"
                        />
                        <div className="comment-details">
                            <strong>{comment.user?.username || 'Anonymous'}</strong>
                            <p>{comment.content}</p>
                            <div className="comment-actions">
                                {userId === comment.user?._id && (
                                    <>
                                        <button>Edit</button>
                                        <button>Delete</button>
                                    </>
                                )}
                                <button onClick={(e) => {
                                    setActiveReplyForm(comment._id);
                                    e.stopPropagation();
                                }}>Reply</button>
                            </div>

                            {/* Reply form for reply to comment */}
                            {activeReplyForm === comment._id && (

                                <div ref={replyFormRef} className="reply-form">
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        value={replyContent}
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
                                        onChange={(e) => setReplyContent(e.target.value)}
                                    />
                                    <button onClick={() => {
                                        handleAddReply(comment._id);

                                    }
                                    }>Update</button>
                                </div>
                            )}


                            {/* Display replies */}
                            {comment.replies?.length > 0 && (
                                <div className="replies-section">
                                    {comment.replies.map((reply) => (
                                        <div key={reply._id} className="reply">
                                            <img
                                                src={`http://localhost:5000${reply.user?.profileImage}` || defaultAvatar}
                                                alt="Replier"
                                                className="reply-avatar"
                                            />
                                            <div className="reply-details">
                                                <strong>{reply.user?.username || 'Anonymous'}</strong>
                                                <p>{reply.content}</p>
                                                <div className="reply-actions">
                                                    {userId === reply.user?._id && (
                                                        <>
                                                            <button>Edit</button>
                                                            <button>Delete</button>
                                                        </>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Comment input */}

                <div className="comment-form">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button onClick={handleAddComment}>Save</button>
                </div>

            </div>


        </div>
    );
};

export default Post;
