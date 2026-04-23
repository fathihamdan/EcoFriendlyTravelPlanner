//Definition of views
const itineraryPageView = document.getElementById('itinerary-list-section'); //listings
const itineraryFormView = document.getElementById('itinerary-form-section'); //detail forms
const itineraryResultView = document.getElementById('itinerary-result-section'); //result page

//Button definition
const BackBtn = document.getElementById('back-btn');
const CreateItineraryBtn = document.getElementById('btn-show-form');
const SaveItineraryBtn = document.getElementById('btn-save-itinerary');
const GenerateItineraryBtn = document.getElementById('btn-generate-itinerary');
const ShowFormFirstBtn = document.getElementById('btn-show-form-first');    

function showItineraryResult() {
    itineraryResultView.classList.remove('d-none');
        itineraryPageView.classList.add('d-none');
}

function showItineraryForm() {
    itineraryPageView.classList.add('d-none');
    itineraryFormView.classList.remove('d-none');
}

function goBack(){
    itineraryFormView.classList.add('d-none');
    itineraryPageView.classList.remove('d-none');
}

function saveItinerary() {
    alert('Itinerary saved successfully!');
    itineraryPageView.classList.remove('d-none');
    itineraryFormView.classList.add('d-none');
    itineraryResultView.classList.add('d-none');
}

//Event listeners
CreateItineraryBtn.addEventListener('click', showItineraryForm);
ShowFormFirstBtn.addEventListener('click', showItineraryForm);
BackBtn.addEventListener('click', goBack);
GenerateItineraryBtn.addEventListener('click', showItineraryResult);
SaveItineraryBtn.addEventListener('click', saveItinerary);