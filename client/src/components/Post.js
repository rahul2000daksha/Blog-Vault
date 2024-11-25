import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Form, useNavigate } from 'react-router-dom';
import './post.css';
import defaultAvatar from '../images/Default-User-Image.png';


const Post = ({ post, userId, handleDeletePost }) => {
    const navigate = useNavigate();
    const [commentContent, setCommentContent] = useState('');
    const [commentFiles, setCommentFiles] = useState([]);
    const [comments, setComments] = useState(post.comments || []);
    const [replyContent, setReplyContent] = useState('');
    const [replyFiles, setReplyFiles] = useState([]);
    const [activeReplyForm, setActiveReplyForm] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [updatedCommentContent, setUpdatedCommentContent] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [updatedReplyContent, setUpdatedReplyContent] = useState('');
    const replyFormRef = useRef(null);
    const fileInputRef = useRef(null);



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
        if (!commentContent.trim() && commentFiles.length === 0) return;

        const formData = new FormData();
        formData.append('content', commentContent);
        Array.from(commentFiles).forEach((file) => formData.append('files', file));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/posts/${post._id}/comments`,
                formData,
                {
                    headers: { Authorization: token },
                    'Content-Type': 'multipart/form-data',
                }
            );

            setComments(response.data);
            setCommentContent('');
            setCommentFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!updatedCommentContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/posts/${post._id}/comments/${commentId}`,
                { content: updatedCommentContent },
                { headers: { Authorization: token } }
            );

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId ? { ...comment, content: response.data.content } : comment
                )
            );

            setEditingCommentId(null); // Exit editing mode
            setUpdatedCommentContent('');
        } catch (error) {
            console.error('Failed to edit comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${post._id}/comments/${commentId}`, {
                headers: { Authorization: token },
            });

            setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };


    const handleAddReply = async (commentId) => {
        if (!replyContent.trim() && replyFiles === 0) return;
        const formData = new FormData();
        formData.append('content', replyContent);
        Array.from(replyFiles).forEach((file) => formData.append('files', file));


        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/replies`,
                formData,
                {
                    headers: { Authorization: token },
                    'Content-Type': 'multipart/form-data',
                }
            );

            setComments(response.data);
            setReplyContent('');
            setActiveReplyForm(null); // Close the reply form
            setReplyFiles([]);
        } catch (error) {
            console.error('Failed to add reply:', error);
        }
    };

    const handleEditReply = async (commentId, replyId) => {
        if (!updatedReplyContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/replies/${replyId}`,
                { content: updatedReplyContent },
                { headers: { Authorization: token } }
            );

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId
                        ? {
                            ...comment,
                            replies: comment.replies.map((reply) =>
                                reply._id === replyId ? { ...reply, content: response.data.content } : reply
                            ),
                        }
                        : comment
                )
            );

            setEditingReplyId(null);
            setUpdatedReplyContent('');
        } catch (error) {
            console.error('Failed to edit reply:', error);
        }
    };
    const handleDeleteReply = async (commentId, replyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/replies/${replyId}`,
                { headers: { Authorization: token } }
            );

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId
                        ? { ...comment, replies: comment.replies.filter((reply) => reply._id !== replyId) }
                        : comment
                )
            );
        } catch (error) {
            console.error('Failed to delete reply:', error);
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
                            <strong className='comment-username'>{comment.user?.username || 'Anonymous'}</strong>
                            {editingCommentId === comment._id ? (
                                <div className='comment-details-edit'>
                                    <input
                                        type="text"
                                        value={updatedCommentContent}
                                        onChange={(e) => setUpdatedCommentContent(e.target.value)}
                                        placeholder="Edit your comment"
                                    />
                                    <button onClick={() => handleEditComment(comment._id)}>Save</button>
                                    <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <p className='comment-content'>{comment.content}</p>
                            )}
                            {comment.files?.length > 0 && (
                                <div className="comment-files">
                                    {comment.files.map((file) => (
                                        <a key={file.url} href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                                            {file.filename}
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div className="comment-actions">
                                {userId === comment.user?._id && (
                                    <>
                                        <button onClick={() => {
                                            setEditingCommentId(comment._id);
                                            setUpdatedCommentContent(comment.content);
                                        }}>Edit</button>
                                        <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
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
                                    <input
                                        type="file"
                                        multiple

                                        onChange={(e) => setReplyFiles(e.target.files)}
                                    />
                                    <button onClick={() => {
                                        handleAddReply(comment._id);

                                    }
                                    }>Reply</button>
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
                                                <strong className='reply-username'>{reply.user?.username || 'Anonymous'}</strong>
                                                {editingReplyId === reply._id ? (
                                                    <div className='reply-details-edit'>
                                                        <input
                                                            type="text"
                                                            value={updatedReplyContent}
                                                            onChange={(e) => setUpdatedReplyContent(e.target.value)}
                                                            placeholder="Edit your reply"
                                                        />
                                                        <button onClick={() => handleEditReply(comment._id, reply._id)}>Save</button>
                                                        <button onClick={() => setEditingReplyId(null)}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <p className='reply-content'>{reply.content}</p>
                                                )}
                                                
                                                {reply?.files?.length > 0 && (
                                                    <div className="reply-files">
                                                        {reply.files.map((file) => (
                                                            
                                                            <a key={file.url} href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                                                                {file.filename}
                                                                
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="reply-actions">
                                                    {userId === reply.user?._id && (
                                                        <>
                                                            <button onClick={() => {
                                                                setEditingReplyId(reply._id);
                                                                setUpdatedReplyContent(reply.content);
                                                            }}>Edit</button>
                                                            <button onClick={() => handleDeleteReply(comment._id, reply._id)}>Delete</button>
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
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => setCommentFiles(e.target.files)}
                    />
                    <button onClick={handleAddComment}>Send</button>
                </div>

            </div>


        </div>
    );
};

export default Post;
