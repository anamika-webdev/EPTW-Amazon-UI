#!/bin/bash

# EPTW Backend - Quick Setup Script
# This script helps you set up the EPTW backend quickly

echo "========================================="
echo "EPTW Backend - Quick Setup"
echo "========================================="
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check npm
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"
echo ""

# Check MySQL
echo "Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL v8 or higher."
    exit 1
fi
MYSQL_VERSION=$(mysql --version)
echo "✅ MySQL found: $MYSQL_VERSION"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your configuration"
else
    echo "⚠️  .env file already exists"
fi
echo ""

# Create directories
echo "Creating required directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p uploads/signatures
mkdir -p uploads/documents
echo "✅ Directories created"
echo ""

# Database setup prompt
echo "========================================="
echo "Database Setup"
echo "========================================="
echo ""
read -p "Do you want to set up the database now? (y/n): " SETUP_DB

if [ "$SETUP_DB" = "y" ] || [ "$SETUP_DB" = "Y" ]; then
    read -p "Enter MySQL username [root]: " DB_USER
    DB_USER=${DB_USER:-root}
    
    read -sp "Enter MySQL password: " DB_PASSWORD
    echo ""
    
    echo "Creating database..."
    mysql -u $DB_USER -p$DB_PASSWORD < /mnt/project/amazon_eptw_db.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
        
        echo "Running OAuth migration..."
        mysql -u $DB_USER -p$DB_PASSWORD < database/migration_oauth.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Migration completed successfully"
        else
            echo "❌ Migration failed"
        fi
    else
        echo "❌ Database creation failed"
    fi
else
    echo "⚠️  Skipping database setup"
    echo "   You can manually run:"
    echo "   mysql -u root -p < /mnt/project/amazon_eptw_db.sql"
    echo "   mysql -u root -p < database/migration_oauth.sql"
fi
echo ""

# Google OAuth setup reminder
echo "========================================="
echo "Google OAuth Setup"
echo "========================================="
echo ""
echo "To enable Google SSO, you need to:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Enable Google+ API"
echo "4. Create OAuth 2.0 credentials"
echo "5. Add redirect URI: http://localhost:3000/api/auth/google/callback"
echo "6. Update .env with your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo ""

# Final instructions
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Set up Google OAuth credentials (if using SSO)"
echo "3. Run 'npm run dev' to start development server"
echo "4. Run 'npm start' to start production server"
echo ""
echo "The server will be available at: http://localhost:3000"
echo "API Documentation: See README.md"
echo ""
echo "Happy coding! 🚀"