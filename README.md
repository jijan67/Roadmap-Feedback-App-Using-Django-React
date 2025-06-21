# Roadmap Feedback App

**Author:** Jijanur Rahman

---

## Project Overview

The Roadmap Feedback App is a full stack web application that allows users to view, upvote, and comment on product roadmap features. It is designed for transparency, community engagement, and easy feedback collection.

---

## Feature Design

### Thought Process
- **Authentication:** Users register and log in using their email and password for a secure and user-friendly experience. Email-based login avoids username collisions and is more intuitive.
- **Roadmap Listing:** Features are displayed with sorting options (Latest, Most Popular, Status). Sorting by popularity uses upvote counts to highlight community interest.
- **Upvoting:** Each user can upvote a feature only once, ensuring fair feedback and preventing spam.
- **Commenting:** Supports nested (threaded) comments up to two levels for clear discussions. Users can add, edit, delete, and reply to comments, with instant UI updates for a smooth experience.
- **Profile Management:** Users can view their profile and see their comments, supporting transparency and personal engagement.
- **Trade-offs:** Real-time updates (e.g., websockets) were not implemented to keep the stack simple and maintainable. Instead, the UI fetches fresh data after each action.

---

## Architecture Decisions

### Backend
- **Framework:** Django + Django REST Framework (DRF)
  - **Why:** Django provides a robust, secure, and scalable backend. DRF makes it easy to build RESTful APIs, handle authentication, and serialize data.
  - **Scalability:** Django’s ORM and DRF’s viewsets make it easy to add new features and endpoints.
  - **Maintainability:** Clear separation of models, serializers, and views (MVC pattern) keeps the codebase organized.

### Frontend
- **Library:** React
  - **Why:** React’s component-based architecture allows for modular, reusable UI elements. State management with hooks (useState, useEffect) keeps the UI responsive and maintainable.
  - **Scalability:** Adding new pages or components (e.g., Profile, RoadmapCard, CommentSection) is straightforward.
  - **Maintainability:** React’s declarative style and one-way data flow make it easy to debug and extend.

### API Design
- **RESTful:** All endpoints follow REST conventions (e.g., `/api/roadmap/`, `/api/roadmap/<id>/comments/`), making the API predictable and easy to consume.

---

## Code Style

- **Modular Components:** Each UI feature (Navbar, RoadmapCard, CommentSection, etc.) is a separate React component, improving reusability and clarity.
- **Naming Conventions:** CamelCase for React components and functions, snake_case for Python variables and functions, following community standards.
- **Patterns:**
  - **MVC (Backend):** Models for data, serializers for data transformation, views for business logic.
  - **RESTful API:** Clear separation of concerns, stateless endpoints, and proper use of HTTP methods (GET, POST, PUT, DELETE).
- **Readability & Extensibility:** Consistent code style, clear function and variable names, and inline comments where needed. This makes onboarding new developers easier and supports future feature additions.

---

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.x
- Django and Django REST Framework

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server at [http://localhost:3000](http://localhost:3000).

### Backend Setup
1. Navigate to the `backend/roadmap_project` directory.
2. Create a virtual environment and activate it.
3. Run `pip install -r requirements.txt` to install dependencies.
4. Run `python manage.py migrate` to apply migrations.
5. Run `python manage.py runserver` to start the backend server at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Usage
- Register a new account using your email and password.
- Log in to view, upvote, and comment on roadmap features.
- Use the sort options to view the latest, most popular, or features by status.
- Click on a feature to view and participate in the discussion.
- Manage your profile and see your comment history.

---

## License
This project is for educational and demonstration purposes.
