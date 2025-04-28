# Skill Sharing Platform

The **Skill Sharing Platform** is a web application that connects individuals eager to learn new skills with those willing to teach. Built with a modern tech stack, it enables users to create profiles, list or browse skills, book sessions, and track learning progress.

## Features
- **User Profiles**: Register and customize profiles to highlight skills offered or sought.
- **Skill Listings**: Post or browse skill sessions with details like description, category, and schedule.
- **Learning Plans & Progress Tracking**: Set learning goals and monitor progress with personalized plans.
- **Authentication**: Secure user login and registration using JWT.
- **Responsive UI**: Access the platform seamlessly on desktop and mobile devices.

## Screenshots
### Homepage
![Screenshot 2025-04-28 094050](https://github.com/user-attachments/assets/c27edb3a-a399-4d17-a74c-fe3e787ee67d)
The homepage showcases available skills and encourages users to sign up or explore.


### Skill Listings
![Screenshot 2025-04-28 094102](https://github.com/user-attachments/assets/caf25401-04f4-45b4-aa21-e88bade9b260)
The booking page lets users view session details and reserve a spot.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/akash-de-alwis/skill-sharing-platform.git
   ```
2. **Frontend Setup** (React):
   - Navigate to the frontend directory:
     ```bash
     cd skill-sharing-platform/frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm start
     ```
3. **Backend Setup** (Spring Boot):
   - Open the backend directory (`skill-sharing-platform/backend`) in an IDE like IntelliJ.
   - Ensure MongoDB is running locally or provide a MongoDB Atlas URI.
   - Configure environment variables in `application.properties`:
     ```properties
     spring.data.mongodb.uri=your-mongodb-uri
     jwt.secret=your-jwt-secret
     ```
   - Build and run the backend:
     ```bash
     ./mvnw spring-boot:run
     ```
4. **Database**:
   - MongoDB is used for data storage. Ensure it’s installed or use a cloud instance.
   - The backend automatically sets up collections for users, skills, and bookings.

## Usage
- **Learners**: Sign up, browse skill listings, book sessions, and track progress via learning plans.
- **Instructors**: Create profiles, list skills, and manage session requests.
- **Developers**: Use the API endpoints (e.g., `/api/skills`, `/api/bookings`) to extend functionality.

## Technologies Used
- **Frontend**: React, Axios, Tailwind CSS
- **Backend**: Java, Spring Boot, Spring Security, JWT
- **Database**: MongoDB
- **Tools**: Maven, IntelliJ IDEA, Git

## Adding Screenshots
To include the screenshots in the `README.md`:
1. Create a `screenshots` folder in the repo’s root:
   ```bash
   mkdir screenshots
   ```
2. Add two images (e.g., `homepage.png`, `booking.png`) to the `screenshots` folder.
3. Commit and push:
   ```bash
   git add screenshots/*
   git commit -m "Add screenshots for README"
   git push origin main
   ```
4. The `README.md` already references these images. If using different filenames, update the paths:
   ```markdown
   ![Homepage](screenshots/your-homepage-image.png)
   ![Booking Page](screenshots/your-booking-image.png)
   ```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request.


## Contact
For support or inquiries:
- Email: akashdealwis@example.com (replace with your contact)
- GitHub Issues: [Create an Issue](https://github.com/akash-de-alwis)

Happy learning and sharing!
