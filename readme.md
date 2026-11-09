# Natours

A tour booking web application built with Node.js, Express.js, and MongoDB.

## Features

- Browse and explore available tours.
- View detailed tour information.
- User signup and login.
- JWT authentication and authorization.
- Password reset functionality.
- User profile management.
- Update profile information and upload profile photos.
- Interactive maps using Mapbox.
- Secure RESTful API.
- Role-based access control.

## Built With

- **Node.js** – JavaScript runtime.
- **Express.js** – Backend web framework.
- **MongoDB** – NoSQL database.
- **Mongoose** – MongoDB object modeling.
- **Pug** – Template engine.
- **JWT** – Authentication.
- **Multer & Sharp** – Image uploading and processing.
- **Mapbox** – Interactive maps.
- **Helmet & bcrypt** – Security.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mobadrr/natours.git
   ```

2. Navigate to the project directory:

   ```bash
   cd natours
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `config.env` file and add the required environment variables.

5. Start the development server:

   ```bash
   npx cross-env NODE_ENV=development node --watch server.js
   ```

6. Visit `http://localhost:3000`.

## Environment Variables

Configure the following variables in your `config.env` file:

- `PORT`
- `DATABASE`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_COOKIE_EXPIRES_IN`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_FROM`
- `MAPBOX_TOKEN`

## Author

**Mohamed Ibrahim Mohamed Badr**

- GitHub
