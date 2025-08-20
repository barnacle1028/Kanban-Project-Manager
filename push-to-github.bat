@echo off
echo "🐙 Pushing Kanban App to GitHub..."
echo.

set /p GITHUB_URL="Enter your GitHub repository URL (e.g., https://github.com/username/kanban-pm.git): "

echo "📡 Adding GitHub remote..."
git remote add origin %GITHUB_URL%

echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo.
echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repository is now available at: %GITHUB_URL%"
echo.
echo "📋 Next steps:"
echo "1. Go to vercel.com"
echo "2. Import your GitHub repository"
echo "3. Deploy with these settings:"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Environment Variable: VITE_API_BASE_URL=https://kanbanpm.com/api"
echo.
pause