let loadedEventsCount = 0;  // Events loaded till now
let areEventsLeft = true;  // Are we done fetching all events available?
let areFetchingEvents = false;
const loadAmount = 3; // Events to load at a time

$(()=>{
    // Spinner to be shown while loading events
    const spinner = $('#loader');
    spinner.hide(); // Initially hidden

    // Events Container to hold all events
    const eventsContainer = $('#events-container');
    // Load the events in beginning
    loadAndAppendEvents(eventsContainer, spinner);

    // When User reaches end of Page
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() === $(document).height() && areEventsLeft &&!areFetchingEvents) {
            areFetchingEvents = true;
            // Show spinner
            spinner.show();
            // Load the events( Delay of 500ms to improve UI)
            setTimeout(()=>{
                loadAndAppendEvents(eventsContainer, spinner);
            }, 500);
        }
    });
});


// Function to Load Events from the Server
// and append them to Events Container in DOM
// use: appendEvent
function loadAndAppendEvents(eventsContainer, spinner) {
    // Fetch Events from the Server
    $.get(`/api/events${window.location.search}&skip=${loadedEventsCount}&count=${loadAmount}&`)
    .then((events)=>{
        // Append each event to the events container
        events.forEach((event)=>{
            appendEvent(eventsContainer, event);
        });

        // Hide the Spinner
        spinner.hide();

        // Are we done loading all events available?
        if(events.length < loadAmount)
            areEventsLeft = false;   // No more events left to load

        // Update the count of events loaded till now
        loadedEventsCount += events.length;

        areFetchingEvents = false;
    })
    .catch((err)=>{
        console.log(err);
    });
}

// Function to append a single Event Card to events Container in the DOM
function appendEvent(eventsContainer, event) {
    eventsContainer.append(`
        <a href="/events/${event._id}">
            <div class="card event-card mb-3">
                <div class="card-body">
                    <div class="media">
                        <img class="d-flex mr-5 event-img" src="${ event.imageUrl || "http://placehold.it/200x200" }" alt="">
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
        </a>    
    `)
}