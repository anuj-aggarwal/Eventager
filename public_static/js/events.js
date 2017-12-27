$(()=>{

    const eventsContainer = $('#events-container');
    loadAndAppendEvents(eventsContainer);

    const loadBtn = $('#load-btn');
    loadBtn.click(()=>{
        // loadAndAppendEvents(eventsContainer);
    })

});


// Function to Load Events from the Server
// and append them to Events Container in DOM
// use: appendEvent
function loadAndAppendEvents(eventsContainer) {
    // Fetch Events from the Server
    $.get('/events')
    .then((events)=>{
        // Append each event to the events container
        events.forEach((event)=>{
            appendEvent(eventsContainer, event);
        })
    })
    .catch((err)=>{
        console.log(err);
    });
}

// Function to append a single Event Card to events Container in the DOM
function appendEvent(eventsContainer, event) {
    eventsContainer.append(`
        <div class="card event-card mb-3">
            <div class="card-body">
                <div class="media">
                    <img class="d-flex mr-5 event-img" src="http://placehold.it/200x200" alt="">
                    <div class="media-body">
                        <h5 class="event-name">${event.name}</h5>
                        <div class="event-description">
                            <div class="datetime"><i class="fa fa-clock-o"></i> ${event.dateTime}</div>
                            <div class="venue"><i class="fa fa-map-marker"></i> ${event.venue}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `)
}