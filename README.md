# EcoFriendlyTravelPlanner  
# Setup and Run Instructions

## 📁 Folder Structure

```text
EcoFriendlyTravelPlanner/
├── assets/            → Images used across the site
├── backend/           → Express + MongoDB API server
└──project-root/      → Frontend UI (HTML, CSS, JS)
🛠️ Installation & Setup Steps
1. Set Up Environment Variables
Navigate to the backend/ folder and create a new file named .env. Add the following configuration text inside it:

Code snippet
MONGO_URI=your_MongoDB_URI
PORT=5000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
WEATHERAPI_KEY=your_weatherAPI.com_ket
2. Install Backend Dependencies
Open your terminal, navigate into the backend folder, and install the required packages:

Bash
cd backend
npm install
3. Seed the Database
Populate your MongoDB database collections with the 51 eco-friendly destination documents:

Bash
node seeder.js
💡 You will see a Data Inserted confirmation message in the terminal once it successfully finishes.

4. Start the Backend Server
Launch the local development environment using nodemon:

Bash
npm run dev
💡 The console will log Server running on port 5000 and MongoDB Connected when online.

5. Open the Web Application
The backend server serves your native frontend assets automatically. Open your preferred desktop browser and navigate to:

http://localhost:5000/register.html
