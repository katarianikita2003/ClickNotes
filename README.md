# ClickNotes - Educational Note Sharing Platform

A full-stack web application for sharing educational notes and study materials among students.

## Features

- **User Authentication**: Register, login, and manage user accounts
- **Note Upload**: Upload study materials in various formats (PDF, DOC, DOCX, TXT, PPT, PPTX)
- **Note Download**: Download notes uploaded by other users
- **Search Functionality**: Search notes by title, subject, content, or tags
- **Like System**: Like notes to show appreciation
- **View Tracking**: Track how many times a note has been viewed
- **Related Notes**: Suggest related notes based on subject and class
- **User Dashboard**: View uploaded and downloaded notes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clicknotes.git
   cd clicknotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGODB_URI=mongodb://localhost:27017/clicknotes
     JWT_SECRET=your_super_secret_key_here
     PORT=5000
     CLIENT_URL=http://localhost:3000
     ```

4. **Create necessary directories**
   ```bash
   mkdir -p backend/uploads
   ```

5. **Start MongoDB**
   ```bash
   # On Windows
   mongod

   # On macOS/Linux
   sudo mongod
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

7. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## Project Structure

```
ClickNotes/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── main.js
│   ├── img/
│   └── [HTML files]
├── package.json
├── .env
└── README.md
```

## Usage

### For Students

1. **Register**: Create an account with your details
2. **Login**: Use your username and password to login
3. **Browse Notes**: View latest uploads on the home page
4. **Search**: Use the search bar to find specific notes
5. **Download**: Click on any note to view details and download
6. **Upload**: Share your own notes with the community

### For Uploaders

1. **Login Required**: You must be logged in to upload notes
2. **Upload Process**:
   - Click on "Upload" in the navigation
   - Fill in the topic name, class, and other details
   - Select your file (PDF, DOC, etc.)
   - Submit the form

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get all notes (with pagination)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes/upload` - Upload new note (auth required)
- `GET /api/notes/:id/download` - Download note (auth required)
- `POST /api/notes/:id/like` - Like/unlike note (auth required)
- `GET /api/notes/search` - Search notes

### Users
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/notes` - Get user's uploaded notes (auth required)
- `GET /api/users/downloads` - Get user's downloaded notes (auth required)
- `PUT /api/users/profile` - Update user profile (auth required)

## Security Features

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies for token storage
- Input validation and sanitization
- File type validation for uploads
- Protected routes requiring authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Created by Nikita Saini - B.Tech student at NIT Kurukshetra

## Support

For support, email support@clicknotes.com or raise an issue in the GitHub repository.

## Future Enhancements

- Email verification for new users
- SMS OTP verification
- Admin panel for content moderation
- Rating system for notes
- Comments and discussions on notes
- Categories and advanced filtering
- Real-time notifications
- Mobile app development