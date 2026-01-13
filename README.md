# Vortex Blog

A modern, full-stack blog application built with Next.js, TypeScript, and Supabase.

## 🚧 Under Development

This project is currently under active development. Features and functionality may change rapidly.

## Features

- User authentication and profiles
- Create and manage blog posts
- Comment system with real-time updates
- Like and save posts
- Follow users
- Admin panel for content management
- Responsive design with dark mode support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (planned)
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Vortex_Blog
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run database migrations:
   ```bash
   # Run the SQL files in the models/ directory in Supabase
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── posts/          # Post pages
│   └── profile/        # User profile pages
├── components/         # Reusable React components
├── lib/                # Utility functions and configurations
├── models/             # Database schemas and migrations
└── public/             # Static assets
```

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Author

Vennilavan Manoharan

## Contributing

This project is under development. Contributions are welcome once the core features are stable.

## License

MIT License
