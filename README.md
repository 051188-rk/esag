<div align="center">
  <img src="https://raw.githubusercontent.com/051188-rk/esag/main/frontend/public/esag-paper.png" alt="ESAG Logo" width="200"/>
  
  # ESAG - Modern E-commerce Platform
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-16.x-brightgreen)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.x-61dafb)](https://reactjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248)](https://www.mongodb.com/)

  A full-featured e-commerce platform built with MERN stack (MongoDB, Express.js, React, Node.js)
</div>

## ✨ Features

- 🛍️ Product catalog with categories and filters
- 🛒 Shopping cart with persistent storage
- 🔐 User authentication & authorization
- 💳 Secure payment integration (test mode)
- 📦 Order management system
- 📱 Responsive design for all devices
- ⚡ Optimized performance with React Query
- 🔍 Advanced search functionality
- ⭐ Product reviews and ratings
- 📦 Order tracking system

## 🏗️ Project Structure

```
esag/
├── backend/                       # Backend server (Node.js + Express)
│   ├── config/                   # Configuration files
│   │   └── db.js                 # Database connection
│   ├── controllers/              # Route controllers
│   │   ├── authController.js     # Authentication logic
│   │   ├── cartController.js     # Cart operations
│   │   ├── orderController.js    # Order management
│   │   └── productController.js  # Product operations
│   ├── middleware/               # Express middleware
│   │   └── auth.js               # Authentication middleware
│   ├── models/                   # Mongoose models
│   │   ├── Cart.js               # Cart model
│   │   ├── Order.js              # Order model
│   │   ├── Product.js            # Product model
│   │   └── User.js               # User model
│   ├── routes/                   # API routes
│   │   ├── auth.js               # Auth routes
│   │   ├── cart.js               # Cart routes
│   │   ├── orders.js             # Order routes
│   │   └── products.js           # Product routes
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json              # Backend dependencies
│
├── frontend/                     # Frontend React application
│   ├── public/                   # Static files
│   │   ├── index.html            # Main HTML file
│   │   └── esag-paper.png        # Application logo
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Cart/            # Cart related components
│   │   │   ├── Common/          # Shared components
│   │   │   ├── Home/            # Homepage components
│   │   │   ├── Layout/          # Layout components
│   │   │   └── Products/        # Product related components
│   │   ├── context/             # React context providers
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── App.jsx              # Main App component
│   │   └── index.js             # Application entry point
│   ├── .env                     # Frontend environment variables
│   └── package.json             # Frontend dependencies
│
├── .gitignore                   # Git ignore file
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- MongoDB (v5.0 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/esag.git
   cd esag
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend` directory with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/esag
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

   Create a `.env` file in the `frontend` directory with:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   NODE_ENV=development
   ```

### Running the Application

1. **Start MongoDB**
   Ensure MongoDB is running locally or update the `MONGODB_URI` in the backend `.env` file.

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm start
   ```
   The application will open in your default browser at `http://localhost:3000`

## 🔧 Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start the development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app

## 📝 Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### Frontend (`.env`)
```
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

## 📚 API Documentation

API documentation is available at `http://localhost:5000/api-docs` when the backend server is running.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [React Query](https://react-query.tanstack.com/)
- And all other amazing open-source projects used in this project.
