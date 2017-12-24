$(() => {
    // Id of current Event
    const eventId = $('#event-heading').data('id');
    // Comment Box
    const commentBox = $('#comment-box');
    // Comment Text Area
    const commentTextArea = $('#comment-text');


    // Initially, load the comments from server and add to DOM
    $.get(`/events/${eventId}/comments`).then((comments) => {
        commentBox.html('');
        comments.forEach((comment) => {
            appendComment(commentBox, comment);
        });

    }).catch((err) => {
        console.log(err);
    });

    // Create new comment
    $('#comment-button').click(() => {
        // If text present
        if(commentTextArea.val().trim() !== ""){
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
function appendComment(commentBox, comment){
    commentBox.append(`
        <div class="media mb-4">
            <img class="d-flex mr-3 rounded-circle" src="http://placehold.it/50x50" alt="">
            <div class="media-body">
                <h5 class="mt-0">${comment.user.username}</h5>
                ${comment.body}
            </div>
        </div>
    `);
}