# 📚 Librora

**Librora** is a full-stack **MERN Book Review Platform** where users can sign up, log in, add books, and share reviews with ratings.  
Built with **MongoDB, Express, React, and Node.js**, Librora focuses on clean UI, smooth animations, and secure authentication — giving users a seamless reading and reviewing experience.

---

## 🚀 Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Framer Motion (animations)
- Lucide Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt Password Hashing
- MVC Architecture

---

## 🎯 Core Features

✅ **User Authentication** (JWT + bcrypt)  
- Signup & Login with encrypted passwords  
- Protected routes using JWT middleware  

✅ **Book Management**  
- Add, edit, and delete books  
- Paginated list (5 books per page)  
- Only the book creator can modify/delete their books  

✅ **Review System**  
- Add, edit, and delete reviews  
- Ratings (1–5 stars) + review text  
- Dynamic average rating calculation  

✅ **Search & Filters**  
- Search books by title, author, or genre  
- Instant search with smooth loading animations  

✅ **Frontend Integration**  
- Modern, responsive design  
- Context-based auth management  
- Debounced search for smoother UX  

✅ **Bonus Features (Optional)**  
- Profile Page: View user’s books & reviews  
- Charts for rating distribution (Recharts)  
- Dark/Light Mode toggle  
- Deployed via Render (backend) & Vercel (frontend)

---

## 🧩 Folder Structure
 ``` bash
Librora/
├── backend/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── server.js
│ ├── package.json
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── contexts/
│ │ ├── hooks/
│ │ ├── pages/
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── vite-env.d.ts
│ ├── public/
│ ├── package.json
│ ├── tailwind.config.ts
│ ├── vite.config.ts
│ └── tsconfig.json
│
├── .gitignore
├── README.md
└── package.json
```


---

## ⚙️ Setup Instructions

### 🛠 Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas or local MongoDB instance
- npm or yarn

---

### 📦 Backend Setup
```bash
cd backend
npm install
```

## .env
- PORT=5000
- MONGO_URI=your_mongodb_atlas_uri
- JWT_SECRET=your_jwt_secret

## 👨‍💻 Author

## Kunal Bishwal
- 📍 3rd Year Engineering Student – SRM University
- 💼 Aspiring Software Engineer | MERN Developer