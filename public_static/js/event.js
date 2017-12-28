let loadedComments = 0;
let areCommentsLeft = true;
const loadAmount = 3;

$(() => {

    const spinner = $('#commentSpinner');
    spinner.hide();
    // Id of current Event
    const eventId = $('#event-heading').data('id');
    // Comment Box
    const commentBox = $('#comment-box');
    // Comment Text Area
    const commentTextArea = $('#comment-text');


    // Initially, load the comments from server and add to DOM
    loadComments(commentBox, eventId, spinner);

    // Create new comment
    $('#comment-button').click(() => {
        // If text present
        if (commentTextArea.val().trim() !== "") {
            // Make a new comment
            $.post(`/events/${eventId}/comments`, {
                body: commentTextArea.val().trim()
            })
                .then((comment) => {
                    // Append the new comment to the comments Box
                    appendComment(commentBox, comment);
                })
                .catch((err) => {
                    console.log(err);
                });
            commentTextArea.val('');
        }
    });

    $('#loadComments').click(()=> {
        if(areCommentsLeft){
            spinner.show();
            setTimeout(()=>{
                loadComments(commentBox, eventId, spinner);
            }, 500);
        }
    })


});


// Function to append a single comment to the Comments Box DOM
function appendComment(commentBox, comment) {
    commentBox.append(`
        <!-- Comment -->
        <div data-id="${comment._id}" class="media mb-4">
            <!-- User Avatar -->
            <img class="d-flex mr-3 rounded-circle avatar" src="https://en.opensuse.org/images/0/0b/Icon-user.png" alt="">
            <!-- Comment Body -->
            <div class="media-body">
                <!-- Username -->
                <h5 class="mt-0">
                    ${comment.user.username}
                    <a class="pull-right actions delete-button"><i class="fa fa-trash-o"></i></a>
                    <a class="pull-right actions edit-button"><i class="fa fa-pencil-square-o"></i></a>
                </h5>
                <!-- Body -->
                <div class="comment-text">${comment.body}</div>
                <!-- Reply Button -->
                <a class="reply-button actions">Reply</a>
                <!-- Show Replies Button -->
                <a class="show-replies actions">Show Replies <i class="fa fa-angle-down"></i></a>
                
                <!-- Replies: Initially hidden -->
                <div class="replies">
                    <!-- Replies to be added -->
                </div>
                
                
                <!-- Reply Form: Initially Hidden -->
                <div class="reply-form">
                    <div class="form-group mt-3">
                        <textarea class="form-control comment-text-area" rows="2"></textarea>
                    </div>
                    <button class="btn btn-primary comment-button">Submit</button>
                </div>
            </div>
        </div>        
    `);


    // Load replies on Appending comment
    const replyBox = $(`[data-id="${comment._id}"] .replies`);
    loadReplies(replyBox, comment);

    // --------------------
    //    EVENT LISTENERS
    // --------------------

    // Click on Reply Button of Comment Added
    // Toggle Replies Form
    const replyButton = $(`[data-id="${comment._id}"] .reply-button`);
    replyButton.click((event) => {
        // Toggle the replies form of the comment
        let target = $(event.target);
        $(target.siblings(":last")).toggle();
    });

    // Click on Show Replies Button of current comment
    // Toggle replies of current comment
    const showRepliesButton = $(`[data-id="${comment._id}"] .show-replies`);
    showRepliesButton.click((event) => {
        // Toggle the replies container of the comment
        let target = $(event.target);
        $(target.siblings()[3]).toggle();

        // Update the Text of Button
        if (target.text() === "Show Replies ") {
            target.html('Hide Replies <i class="fa fa-angle-up"></i>');
        }
        else
            target.html('Show Replies <i class="fa fa-angle-down"></i>');
    });


    // Submit button in Reply Form
    const commentButton = $(`[data-id="${comment._id}"] .comment-button`);
    commentButton.click((event) => {
        // Get the Reply text
        let replyTextArea = $(`[data-id="${comment._id}"] .comment-text-area`);
        let reply = replyTextArea.val().trim();
        if (reply !== "") {
            // Make a reply POST Request to server
            $.post('/comments', {
                commentId: comment._id,
                body: reply
            })
                .then((reply) => {
                    // Append the reply to current comment and clear TextArea
                    appendReply(replyBox, reply, comment._id);
                    replyTextArea.val('');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });


    // Edit Button
    const editButton = $(`[data-id="${comment._id}"] .edit-button`);
    editButton.click((event) => {
        // Fetch the text to be updated
        const commentText = $(`[data-id="${comment._id}"] .comment-text`);
        // If the content is not edited yet
        if (editButton.html() === '<i class="fa fa-pencil-square-o"></i>') {
            // Set Comment's Body to be Editable and
            // Show Done button instead of Edit
            commentText.attr('contenteditable', true).focus();
            editButton.html('<i class="fa fa-check"></i>');
        }
        // If the content is new comment's body
        else {
            // Fetch updated text
            const newText = commentText.text().trim();
            // PATCH Request to Server to update the comment
            $.ajax({
                url: `/comments/${comment._id}`,
                type: 'PATCH',
                data: {body: newText}
            })
                .then((data) => {
                    // Change icon back to edit once edited
                    // and set contenteditable to false
                    console.log("Updated Comment: " + data);
                    editButton.html('<i class="fa fa-pencil-square-o"></i>');
                    commentText.attr('contenteditable', false);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });

    // Delete Button
    const deleteButton = $(`[data-id="${comment._id}"] .delete-button`);
    deleteButton.click((event) => {
        // Confirm the delete operation before proceeding further
        let confirmDelete = confirm("Confirm Delete?");
        if (confirmDelete) {
            // Fetch current comment
            const currComment = $(`[data-id="${comment._id}"]`);
            // DELETE Reuqest to Server to Delete the Comment
            $.ajax({
                url: `/comments/${comment._id}`,
                type: 'DELETE'
            })
                .then((comment) => {
                    // Remove the comment from the DOM once successfully deleted from server database
                    console.log("Deleted: " + comment);
                    currComment.remove();
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });
}


// Load comments from Server for Event with eventId
// and update the Comments Box
function loadComments(commentBox, eventId, spinner) {
    // Fetch the comments from Server
    $.get(`/events/${eventId}/comments?skip=${loadedComments}&count=${loadAmount}`).then((comments) => {
        // Append each comment to commentBox
        comments.forEach((comment) => {
            appendComment(commentBox, comment);
        });

        spinner.hide();

        if(comments.length < loadAmount){
            areCommentsLeft = false;
            $('#loadComments').hide();
        }

        loadedComments += comments.length;

    }).catch((err) => {
        console.log(err);
    });
}

// Function to Append a reply to the replyBox
function appendReply(replyBox, reply, commentId) {
    replyBox.append(`
        <div data-id="${reply._id}" class="media mt-4">
            <!-- Avatar -->
            <img class="d-flex mr-3 rounded-circle avatar" src="https://en.opensuse.org/images/0/0b/Icon-user.png" alt="">
            <!-- Reply Body -->
            <div class="media-body">
                <!-- Username -->
                <h5 class="mt-0">
                    ${reply.user.username}
                    <!-- Delete Button -->
                    <a class="pull-right actions delete-reply-button"><i class="fa fa-trash-o"></i></a>
                    <!-- Edit Button -->
                    <a class="pull-right actions edit-reply-button"><i class="fa fa-pencil-square-o"></i></a>
                </h5>
                <!-- Body -->
                <div class="reply-text">${reply.body}</div>
            </div>
        </div>
    `);

    // Edit Button of Reply
    const replyEditButton = $(`[data-id="${reply._id}"] .edit-reply-button`);
    // On editing the Reply Text
    replyEditButton.click((event)=> {
        // Fetch the Reply text to be changed
        const replyText = $(`[data-id="${reply._id}"] .reply-text`);
        if (replyEditButton.html() === '<i class="fa fa-pencil-square-o"></i>') {
            // If its Edit Button, make it editable and change icon
            replyText.attr('contenteditable', true).focus();
            replyEditButton.html('<i class="fa fa-check"></i>');
        }
        else {
            // Fetch updated text
            const newReply = replyText.text().trim();
            // Make Patch Request to server
            $.ajax({
                url: `/comments/${commentId}/replies/${reply._id}`,
                type: 'PATCH',
                data: {body: newReply}
            })
                .then((data) => {
                    // Change button to Edit Button back
                    replyEditButton.html('<i class="fa fa-pencil-square-o"></i>');
                    replyText.attr('contenteditable', false);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    });

    // Delete Button of Reply
    const deleteReplyButton = $(`[data-id="${reply._id}"] .delete-reply-button`);
    deleteReplyButton.click((event)=>{
        // Confirm Delete
        let confirmDelete = confirm("Confirm Delete?");
        if (confirmDelete) {
            // Fetch current Reply
            const currReply = $(`[data-id="${reply._id}"]`);
            // DELETE Request to Server to Delete the Reply
            $.ajax({
                url: `/comments/${commentId}/replies/${reply._id}`,
                type: 'DELETE'
            })
                .then((reply) => {
                    // Remove the Reply from the DOM once successfully deleted from server database
                    console.log("Deleted: " + reply);
                    currReply.remove();
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    })
}


// Function to update the replyBox with the replies passed
// uses appendReply()
function loadReplies(replyBox, comment) {
    replyBox.html('');
    comment.replies.forEach((reply) => {
        appendReply(replyBox, reply, comment._id);
    });
}