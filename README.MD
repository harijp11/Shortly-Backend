# Authenticated URL Shortener - Backend

This is the backend for the authenticated URL shortener project. It provides secure user authentication (JWT-based) and protected URL shortening APIs.

## 📦 Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB (via Mongoose)
- JWT for authentication
- bcrypt for password hashing

## 🔐 Features

- User registration, login, logout
- Secure password storage using bcrypt
- JWT-based authentication and protected routes
- Authenticated users can shorten URLs
- Retrieve full URLs from shortened links

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB running locally or MongoDB Atlas connection URI

### Installation

```bash
git clone https://github.com/yourusername/url-shortener-backend.git
cd url-shortener-backend
npm install
