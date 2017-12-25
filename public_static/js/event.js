$(() => {
    // Id of current Event
    const eventId = $('#event-heading').data('id');
    // Comment Box
    const commentBox = $('#comment-box');
    // Comment Text Area
    const commentTextArea = $('#comment-text');


    // Initially, load the comments from server and add to DOM
    loadComments(commentBox, eventId);

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
                <h5 class="mt-0">${comment.user.username}</h5>
                <!-- Body -->
                <div>${comment.body}</div>
                <!-- Reply Button -->
                <a class="reply-button">Reply</a>
                <!-- Show Replies Button -->
                <a class="show-replies">Show Replies <i class="fa fa-angle-down"></i></a>
                
                <!-- Replies: Initially hidden -->
                <div class="replies">
                    <!-- Replies to be added -->
                </div>
                
                
                <!-- Reply Form: Initially Hidden -->
                <div class="reply-form">
                    <div class="form-group mt-3">
                        <textarea class="form-control comment-text" rows="2"></textarea>
                    </div>
                    <button class="btn btn-primary comment-button">Submit</button>
                </div>
            </div>
        </div>        
    `);


    // Load replies on Appending comment
    const replyBox = $(`[data-id="${comment._id}"] .replies`);
    loadReplies(replyBox, comment.replies);

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
        let replyTextArea = $(`[data-id="${comment._id}"] .comment-text`);
        let reply = replyTextArea.val().trim();
        if (reply !== "") {
            // Make a reply POST Request to server
            $.post('/comments', {
                commentId: comment._id,
                body: reply
            })
            .then((reply)=>{

                // Append the reply to current comment and clear TextArea
                appendReply(replyBox, reply);
                replyTextArea.val('');
            })
            .catch((err)=>{
                console.log(err);
            })
        }
    });
}


// Load comments from Server for Event with eventId
// and update the Comments Box
function loadComments(commentBox, eventId) {
    commentBox.html('');
    // Fetch the comments from Server
    $.get(`/events/${eventId}/comments`).then((comments) => {
        // Append each comment to commentBox
        comments.forEach((comment) => {
            appendComment(commentBox, comment);
        });

    }).catch((err) => {
        console.log(err);
    });
}

// Function to Append a reply to the replyBox
function appendReply(replyBox, reply) {
    replyBox.append(`
        <div class="media mt-4">
            <!-- Avatar -->
            <img class="d-flex mr-3 rounded-circle avatar" src="https://en.opensuse.org/images/0/0b/Icon-user.png" alt="">
            <!-- Reply Body -->
            <div class="media-body">
                <!-- Username -->
                <h5 class="mt-0">${reply.user.username}</h5>
                <!-- Body -->
                <div>${reply.body}</div>
            </div>
        </div>
    `);
}


// Function to update the replyBox with the replies passed
// uses appendReply()
function loadReplies(replyBox, replies) {
    replyBox.html('');
    replies.forEach((reply)=>{
        appendReply(replyBox, reply);
    })
}