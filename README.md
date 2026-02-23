# LeetStats

LeetStats is a modern, React-based web application that allows users to track, compare, and analyze LeetCode statistics across multiple profiles. It is built to serve as a personal dashboard to monitor competition and visualize problem-solving activity over time.

## 🚀 Features

- **Google Authentication:** Securely log in using your Google account via Supabase Auth.
- **Track Multiple Profiles:** Add any public LeetCode handle to attach it to your personal dashboard.
- **Real-time Statistics:** Fetches live data including Total Solved, Difficulty Breakdown (Easy/Medium/Hard), Contest Rating, and Global Ranking.
- **Activity Trends Graph:** A dynamic Line Chart visualizing recent submission activity over the past Days, Weeks, or Months.
- **Comparison Breakdown:** A stacked Bar Chart to easily compare the difficulty of problems solved by different tracked users.
- **Visibility Toggle:** Select specifically which tracked users you want to view on your dashboard at any given time.
- **Persistent Storage:** Your tracked users and dashboard configurations are securely saved in a Supabase PostgreSQL database.

## 🛠 Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Vanilla CSS + Tailwind CSS (via CDN)
- **Charts & Data Visualization:** Recharts
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth 2.0)
- **API Strategy:** GraphQL (fetching from LeetCode via CORS proxies)

## 💻 Running Locally

### Prerequisites
- Node.js installed on your machine
- A Supabase project with Google Authentication configured

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[YOUR_GITHUB_USERNAME]/leetstats-compare.git
   cd leetstats-compare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials if you transition them to environment variables (currently handled inside the app or manually).
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Log into [Vercel](https://vercel.com/) and create a **New Project**.
3. Import your GitHub repository. Vercel will automatically detect the Vite framework.
4. Add any necessary environment variables.
5. Click **Deploy**.
6. **Important:** Ensure you add your new Vercel production URL to your Supabase **Authentication > URL Configuration > Site & Redirect URLs**, as well as your Google Cloud Console OAuth Authorized Redirect URIs.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
