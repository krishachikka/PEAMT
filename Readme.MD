<div align="center">

# 🎓 Scorezy – Proctored Exam Automation & Monitoring Tool

**A smart, secure, and scalable MERN-based solution for seamless online exam proctoring, built with Firebase & React.**

</div>

---

## 📌 Overview

**Scorezy** is a robust full-stack web application designed to automate and monitor online exams in real-time. Built with the **MERN stack** and integrated with **Firebase Authentication**, it provides a secure environment for candidates and a dynamic admin interface for invigilators. Scorezy supports live monitoring, dashboard control, authentication, and result tracking—making it ideal for universities, hiring platforms, and training centers.

---

## ⚙️ Features

### 👩‍🎓 For Students

* Secure **Firebase-based login**
* Take exams in a **proctored, monitored** environment
* User-friendly, **responsive UI**
* Get real-time status updates

### 🧑‍💼 For Admins

* Dashboard with **user management** and **submission logs**
* Set exam access via private dashboard credentials
* View student sessions and activity in real-time

### 🔐 Security & Monitoring

* Firebase Authentication for secure sign-ins
* JWT-protected backend routes
* Exam session control using dashboard access keys

---

## 🔧 Tech Stack

| Layer      | Tech                          |
| ---------- | ----------------------------- |
| Frontend   | React.js, Redux Toolkit, Vite |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB                       |
| Auth       | Firebase Authentication       |
| State Mgmt | Redux Toolkit + Redux Persist |
| Others     | Axios, dotenv, bcryptjs, JWT  |

---

## 🚀 Installation Guide

### 📁 Frontend Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/peamt.git
   cd peamt/client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in `client/`:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
   VITE_FIREBASE_APP_ID=app_id
   VITE_PRIVATE_DASHBOARD_ID=your_dashboard_id
   VITE_DASHBOARD_PASSWORD=dashboard_password
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

---

### 🖥️ Backend Setup

1. From the root project folder:

   ```bash
   cd peamt
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root:

   ```env
   MONGO=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN=your_admin_mongodb_connection_string
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

---

## 📄 API Documentation

A complete API documentation will be published soon. It will include:

* Endpoints for auth, user, and exam management
* Sample request and response formats
* Protected routes and token handling

---

## 📝 Additional Tools

* `jspdf`: Generate and download exam results or reports as PDFs

  ```bash
  npm install jspdf
  ```

---

## 🤝 Contributing

We welcome contributions!
To contribute:

1. Fork the repo
2. Create your feature branch:
   `git checkout -b feature/your-feature`
3. Commit changes:
   `git commit -m 'Add feature'`
4. Push branch:
   `git push origin feature/your-feature`
5. Open a Pull Request 🙌

---

## 📜 License

Licensed under the **ISC License**. See the [LICENSE](LICENSE) file for more.

---

## 📬 Contact

For queries or support, feel free to reach out:
📧 **[chikkakrisha@gmail.com](mailto:chikkakrisha@gmail.com)**
