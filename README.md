# Blueritt Frontend Application

A modern React application built with TypeScript, Vite, and Tailwind CSS. This project includes features for product scanning, dashboard analytics, subscription management, and user authentication.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 6.0+
- **Styling**: Tailwind CSS, Sass/SCSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Data Fetching**: TanStack React Query, Axios
- **UI Components**: Material-UI, Headless UI, Radix UI
- **Charts**: ApexCharts
- **Form Handling**: Formik with Yup validation
- **Authentication**: JWT with Google reCAPTCHA
- **Error Tracking**: Sentry

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reverce-fe-new-theme
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The application uses different environment files for different environments. You'll need to set up the appropriate environment variables:

#### Environment Files

- **`.env`** - Local development environment
- **`.env.staging`** - Staging environment
- **`.env.production`** - Production environment

#### Required Environment Variables

Copy one of the existing environment files and update the values:

```bash
# For local development
cp .env.example .env
```

**Environment Variables:**

```bash
# Google reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Encryption key for data security
VITE_ENCRYPTION_KEY=your_32_character_encryption_key

# API Base URL
VITE_API_URL=http://localhost:8000  # Local development
# VITE_API_URL=https://staging-api.blueritt.com  # Staging
# VITE_API_URL=https://api.blueritt.com  # Production
```

#### Environment Setup Guide

1. **For Local Development:**
   - Use `.env` file
   - Set `VITE_API_URL` to your local backend server (typically `http://localhost:8000`)

2. **For Staging:**
   - Use `.env.staging` file
   - Points to staging API server

3. **For Production:**
   - Use `.env.production` file
   - Points to production API server

### 4. Build Styles (First Time Setup)

Compile the SCSS files to CSS:

```bash
npm run postcss
```

Or for ongoing development with file watching:

```bash
npm run sass
```

## 🏃‍♂️ Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `https://localhost:5173` (note: uses HTTPS with basic SSL)

### Building for Production

1. **Generate version information:**
   ```bash
   npm run generate-version
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Preview the production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── @spk/                   # SPK component library
│   ├── dashboards/         # Dashboard components
│   ├── tables/             # Table components
│   └── uielements/         # UI element components
├── api/                    # API service functions
├── assets/                 # Static assets (images, styles, icons)
├── components/             # Reusable React components
├── container/              # Page container components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── layouts/                # Layout components
├── pages/                  # Page components
├── redux/                  # Redux store and slices
├── routing/                # Routing configuration
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🎨 Styling

### Sass/SCSS Development

The project uses Sass for styling with Tailwind CSS. The main style files are located in:

- `src/assets/scss/style.scss` - Main stylesheet
- `src/assets/scss/_variables.scss` - SCSS variables
- `src/assets/scss/_icons.scss` - Icon definitions

### Available Style Commands

```bash
# Compile SCSS to CSS with PostCSS processing
npm run postcss

# Watch and compile SCSS files
npm run sass

# Compile SCSS with compressed output
npm run sass-min
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Compile styles
npm run postcss

# Watch and compile Sass
npm run sass

# Generate version file
npm run generate-version
```

## 🌐 Environment-Specific Builds

To build for different environments:

```bash
# Development build (uses .env)
npm run dev

# Staging build (ensure .env.staging is configured)
npm run build

# Production build (ensure .env.production is configured)
npm run build
```

## 🔐 Security Considerations

- All environment variables are prefixed with `VITE_` to be exposed to the client
- Sensitive data should never be stored in environment variables that start with `VITE_`
- The encryption key is used for client-side data encryption
- reCAPTCHA integration helps prevent bot attacks

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with style errors:**
   ```bash
   npm run postcss
   ```

2. **Module not found errors:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment variables not loading:**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server after changing `.env` files

4. **SSL certificate issues in development:**
   - The project uses `@vitejs/plugin-basic-ssl` for HTTPS in development
   - Accept the self-signed certificate in your browser

## 📦 Deployment

### Cloudflare Pages (Automated)

The project uses Cloudflare Pages for automatic deployment with the `build.sh` script:

- **Production**: Automatically deploys when pushing to `master` branch
- **Staging**: Automatically deploys when pushing to `dev` branch

The `build.sh` script handles environment-specific builds:
- `dev` branch → Production build (`--mode production`)
- Other branches → Staging build (`--mode staging`)

**No additional steps required** - just push your changes to the appropriate branch:

```bash
# For production deployment
git push origin master

# For staging deployment  
git push origin dev
```

### Manual Deployment (Alternative)

If you need to deploy manually to another hosting provider:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider
