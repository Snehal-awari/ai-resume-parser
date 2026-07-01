Title : AI Resume Parser

An advanced AI-powered full-stack application designed to automate the recruitment workflow by parsing unstructured PDF resumes into structured, searchable data records.
Using Google Gemini 2.5 Flash with strict JSON schema enforcement, the platform extracts key candidate information, supports semantic search, Excel export, duplicate detection, and AI-based job matching scorecards.

---------------------------------------------------------
🚀 Key Features

🤖 AI-Powered Structured Parsing
Extracts structured data from resumes including Name, Email, Phone, Social Profiles (LinkedIn, GitHub), Education, Projects, Skills, and Summary using Gemini AI.

🔁 Fail-Safe Parser Architecture
Automatically switches to a regex-based fallback parser during API failures, quota limits, or network issues.

🚫 Duplicate Detection System
Prevents duplicate entries using Email, Phone number, and SHA-256 document hash validation.

🎯 AI Job Matching Engine
Matches candidate profiles with job descriptions and generates:
Compatibility score
Matching & missing skills
AI-based recommendations

📊 Advanced Candidate Database
Searchable and filterable candidate management system with detailed profile view.

📁 Excel Export System
Generates formatted .xlsx files using Apache POI with structured candidate data.

📈 Analytics Dashboard
Visual insights into uploads, skill distribution, and system performance.

🔐 Role-Based Access Control (RBAC)
Secure authentication using Spring Security + JWT with separate Admin & HR roles.

🧾 Audit & Recovery System
Local admin logs and recycle bin support for restoring deleted records.

------------------------------------------------------
🛠️ Tech Stack
Backend

Java 21
Spring Boot 3.3.0
Spring Security (JWT)
Spring Data JPA (Hibernate)
MySQL 8+
Apache PDFBox
Apache POI
Lombok
Jackson
JJWT

Frontend

React 18 (Vite)
Material UI (MUI)
React Router DOM
Axios
Recharts
AI Integration
Google Gemini 2.5 Flash API
JSON Schema-based structured output


------------------------------------------------------
## 📁 System Architecture

Frontend (React App)
        |
        | HTTP Requests (Axios + JWT Token)
        v
Backend (Spring Boot REST API)
        |
        |-----------------------------|
        |                             |
Service Layer               Security Layer (JWT Auth)
        |
        v
Business Logic Layer
        |
        |-----------------------------|
        |                             |
PDF Parser (Apache PDFBox)   Excel Generator (Apache POI)
        |
        v
AI Processing Layer
(Google Gemini 2.5 Flash API - JSON structured output)
        |
        v
Repository Layer (Spring Data JPA)
        |
        v
Database (MySQL - resume_parser_db)


------------------------------------------------------
🔧 Installation & Setup
Prerequisites
Java 21+
Node.js 18+
MySQL 8+
Gemini API Key

1. Database Setup
CREATE DATABASE resume_parser_db;

2. Backend Setup
cd backend
mvn clean package -DskipTests
java -jar target/resume-parser-backend-0.0.1-SNAPSHOT.jar

Set environment variable:

export GEMINI_API_KEY="your-api-key"

3. Frontend Setup
cd frontend
npm install
npm run dev


----------------------------------------------------------
💡 Usage
1. Authentication
Register and login to get JWT token
2. Upload Resume
Upload PDF resumes for AI parsing
3. AI Matching
Compare candidates with job descriptions
4. Export Data
Export structured data to Excel
5. Admin Control
Manage users, logs, and deleted records

------------------------------------------------------
🔗 Repository & Live Demo
GitHub Repo: https://github.com/Snehal-awari/ai-resume-parser.git
Live: https://ai-resume-parser-olive.vercel.app/login

------------------------------------------------------
👨‍💻 Author
Snehal Awari
GitHub: https://github.com/Snehal-awari

------------------------------------------------------
⭐ Final Note
This project demonstrates AI integration, full-stack development, and production-level system design for recruitment automation.
