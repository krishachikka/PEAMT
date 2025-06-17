# PEAMT - Proctored Exam Automation and Monitoring Tool

A comprehensive full-stack application built with the MERN stack (MongoDB, Express, React, Node.js) designed for proctored exam automation and monitoring. The project leverages Firebase for authentication and data storage, ensuring a robust and secure system.

## Table of Contents

- [Frontend](#frontend)
- [Backend](#backend)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Frontend

The frontend is developed using React and Vite, providing a responsive and interactive user interface. It integrates with Firebase for authentication and data management.

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/peamt.git
   ```

2. **Navigate to the frontend directory:**

   ```bash
   cd peamt/client
   ```

3. **Install dependencies:**

   ```bash
   npm install @reduxjs/toolkit firebase react react-dom react-dotenv react-redux react-router-dom redux-persist
   ```

4. **Create a `.env` file in the `client` directory and add your environment variables:**

   ```plaintext
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_PRIVATE_DASHBOARD_ID=your_private_dashboard_id
   VITE_DASHBOARD_PASSWORD=your_dashboard_password
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

### Usage

Visit `http://localhost:5173` in your browser to access the application. Ensure the backend server is running for a fully functional experience.

---

## Backend

The backend is constructed with Node.js and Express, offering a RESTful API, authentication, and data management capabilities.

### Setup

1. **Navigate to the root directory:**

   ```bash
   cd peamt
   ```

2. **Install dependencies:**

   ```bash
   npm install @reduxjs/toolkit axios bcryptjs body-parser cookie-parser cors dotenv express jsonwebtoken lenis mongoose nodemon react-redux three
   ```

3. **Create a `.env` file in the root directory and add your environment variables:**

   ```plaintext
   MONGO=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN=your_admin_mongodb_connection_string
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

### Usage

The backend server will be available at `import.meta.env.VITE_BASE_URL` by default. Ensure that it is running to allow communication with the frontend.

---

## Environment Variables

Ensure the following environment variables are set up correctly:

- **Frontend (.env file):**

  - `VITE_FIREBASE_API_KEY`: Firebase API key
  - `VITE_FIREBASE_AUTH_DOMAIN`: Firebase authentication domain
  - `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
  - `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
  - `VITE_FIREBASE_APP_ID`: Firebase app ID
  - `VITE_PRIVATE_DASHBOARD_ID`: Private dashboard ID for access control
  - `VITE_DASHBOARD_PASSWORD`: Password for accessing the private dashboard

- **Backend (.env file):**
  - `MONGO`: MongoDB connection string
  - `JWT_SECRET`: Secret key for JSON Web Token (JWT) authentication
  - `ADMIN`: Admin MongoDB connection string for administrative tasks

## Features

### Frontend

- **User Authentication:** Secure login and registration using Firebase.
- **Responsive Design:** Adaptive layout built with React and TailwindCSS.
- **State Management:** Efficient state management using Redux Toolkit and Redux Persist.
- **Routing:** Dynamic routing with React Router DOM for seamless navigation.

### Backend

- **API Development:** RESTful API endpoints created with Express.
- **Authentication:** Secure authentication with JWT to protect sensitive routes.
- **Data Management:** Storage and retrieval of exam data using MongoDB.
- **Middleware Integration:** Utilizes middleware for body parsing, cookie handling, and Cross-Origin Resource Sharing (CORS).

## API Documentation

For comprehensive API documentation, including endpoints, request formats, and response examples, please refer to [API Documentation](#). This will help you understand how to interact with the backend services.

## Contributing

Contributions are welcome! To contribute:

1. **Fork the repository** to create your own copy.
2. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make your changes** and ensure they adhere to the project’s coding standards.
4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -am 'Add new feature or fix'
   ```
5. **Push to your branch:**
   ```bash
   git push origin feature/your-feature
   ```
6. **Open a Pull Request** on GitHub to propose your changes.

## License

This project is licensed under the ISC License. For detailed information, refer to the [LICENSE](LICENSE) file.

## Contact

For questions or further information, contact the project maintainer via GitHub or the project's support channels. Your feedback and inquiries are highly valued.

npm install jspdf
