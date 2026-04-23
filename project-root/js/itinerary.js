//Definition of views
const itineraryPageView = document.getElementById('itinerary-list-section'); //listings
const itineraryFirstListCard = document.getElementById('firstListCard'); //first list card
const itineraryListCardContainer = document.getElementById('itineraryListCardContainer'); //list card container
const itineraryFormView = document.getElementById('itinerary-form-section'); //detail forms
const itineraryResultView = document.getElementById('itinerary-result-section'); //result page

//Button definition
const BackBtn = document.getElementById('back-btn');
const CreateItineraryBtn = document.getElementById('btn-show-form');
const SaveItineraryBtn = document.getElementById('btn-save-itinerary');
const GenerateItineraryBtn = document.getElementById('btn-generate-itinerary');
const ShowFormFirstBtn = document.getElementById('btn-show-form-first');    

itinCount = 0; //for counting the number of itineraries created, for database use
hasItinerary = false; //for checking if there is any itinerary created, for database use

function showItineraryResult() {
    itineraryResultView.classList.remove('d-none');
}

function showItineraryForm() {
    itineraryPageView.classList.add('d-none');
    itineraryFormView.classList.remove('d-none');
}

function goBack(){
    if (!hasItinerary) {
        itineraryFirstListCard.classList.remove('d-none');
    }
    itineraryFormView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
}

function saveItinerary() {
    //into database, itinerary count +1
    itinCount++;
    console.log(`Itinerary count: ${itinCount}`); //for testing purposes
    hasItinerary = true;

    alert('Itinerary saved successfully!');
    itineraryFirstListCard.classList.add('d-none');
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
    itineraryListCard.classList.remove('d-none');


}

//Event listeners
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
SaveItineraryBtn.addEventListener('click', saveItinerary);