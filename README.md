# EcoFriendlyTravelPlanner  
The system should provide the following functions:  
• General module – Register new user account, user login to access the system, manage the sessions  
• Profile Management - view, update user details, delete a user account, update password  

  
Travellers:  
• Eco-Friendly Travel options - Provide a directory of sustainable accommodations, restaurants, transportation options, and travel activities. Users can search the eco-friendly options for a city/town and add the option as favourite.  
• Green Itinerary Plan – Create a travel itinerary plan based on eco-friendly travel suggestions (include the date of visit). Low-impact travel destinations for a city/town can be recommended based on certain criteria (e.g. user interests, budget and weather forecast)  
• Weather Forecast – Show weather forecast for a city (optional: may integrate with existing weather API that offers real-time weather information)  
• Carbon Footprint Calculator - Allow users to calculate the environmental impact of their travel plans. For example, according to the transportation and accommodation options, the system can provide insights into carbon emissions for flights, car travel, and accommodations, offer suggestions to offset emissions, such as carbon credit purchases.  
## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or above — verify with `node -v`
- [Git](https://git-scm.com/) — verify with `git -v`

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/fathihamdan/EcoFriendlyTravelPlanner
cd EcoFriendlyTravelPlanner
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Create the Environment File

Inside the `backend/` folder, create a new file named `.env` and add the following:
```bash
MONGO_URI=your_MongoDB_URI
PORT=5000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
WEATHERAPI_KEY=your_WeatherAPI.com_key
```
> ⚠️ The `.env` file is intentionally excluded from GitHub via `.gitignore` to protect sensitive credentials. You must create this file manually every time you clone the project.

### 4. Start the Backend Server

```bash
node server.js
```

You should see the following output in the terminal:
Server running on port 5000
MongoDB Connected

### 5. Open the App

Open your browser and go to:
http://localhost:5000
