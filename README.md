# E-Commerce Application

A full-stack e-commerce application built with MERN (MongoDB, Express.js, React, Node.js) stack.

## Project Structure

```
e-comm/
├── backend/           # Backend server code
├── frontend/          # Frontend React application
├── .gitignore         # Git ignore file
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-comm
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   # Create a .env file in the backend directory with required environment variables
   cp .env.example .env  # If available
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file in the frontend directory with required environment variables
   cp .env.example .env  # If available
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm start
   ```

   The application should now be running on `http://localhost:3000`

## Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend
Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
