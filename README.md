# Live Polling Platform

A real-time live polling platform built with React, Node.js, and Socket.IO. Create engaging polls with multiple question types and get instant results with beautiful visualizations.

## 🚀 Features

### Admin Panel (Poll Creator)
- ✅ Create different types of questions: MCQ, Word Cloud, Yes/No, Rating scales, Open Text
- ✅ Generate unique poll links to share with audience
- ✅ View real-time results with interactive charts and graphs
- ✅ Export results as CSV
- ✅ QR code generation for easy sharing
- ✅ Live admin dashboard with real-time updates

### Audience Panel (Voters)
- ✅ Access polls via link (no registration required)
- ✅ Submit responses (1 per user/session/device)
- ✅ View live results (if enabled by admin)
- ✅ Mobile-responsive design
- ✅ Real-time vote updates

### Poll Types
- ✅ **Multiple Choice**: Single select with customizable options

- ✅ **Rating Scale**: 1-5 or 1-10 rating systems with average calculations
- ✅ **Yes/No**: Simple binary questions with percentage breakdowns
- ✅ **Open Text**: Collect qualitative feedback and responses

### Additional Features
- ✅ Real-time updates using WebSocket connections
- ✅ Beautiful, modern UI with Tailwind CSS
- ✅ Responsive design for all devices
- ✅ Export functionality (CSV)
- ✅ QR code generation for easy sharing
- ✅ Live results dashboard
- ✅ Poll expiration settings
- ✅ Multiple vote prevention

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **UUID** - Unique identifier generation
- **Moment.js** - Date/time handling

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-polling-platform
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development server**
   ```bash
   # Start both server and client concurrently
   npm run dev
   
   # Or start them separately:
   # Terminal 1: Start server
   npm run server
   
   # Terminal 2: Start client
   npm run client
   ```

4. **Access the application**
   - Main app: http://localhost:3000
   - Server API: http://localhost:5000

## 🎯 Usage

### Creating a Poll

1. Navigate to the home page and click "Create Your First Poll"
2. Fill in the poll title and description
3. Add questions by selecting from different question types:
   - **Multiple Choice**: Add options for participants to choose from
   - **Word Cloud**: Collect text responses
   - **Rating Scale**: Choose between 1-5 or 1-10 scales
   - **Yes/No**: Simple binary questions
   - **Open Text**: Collect qualitative feedback
4. Configure poll settings (show results, allow multiple votes)
5. Click "Create Poll" to generate your poll

### Sharing Your Poll

After creating a poll, you'll receive:
- **Poll Link**: Share this with participants to collect votes
- **Admin Link**: Use this to view real-time results and manage your poll

### Viewing Results

- **Admin Panel**: Access via the admin link to see detailed charts and analytics
- **Live Updates**: Results update in real-time as votes come in
- **Export Data**: Download results as CSV for further analysis

## 📱 API Endpoints

### Polls
- `POST /api/polls` - Create a new poll
- `GET /api/polls/:pollId` - Get poll data
- `POST /api/polls/:pollId/vote` - Submit a vote
- `GET /api/polls/:pollId/results` - Get poll results
- `GET /api/polls/:pollId/export/csv` - Export results as CSV

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
```

### Customization
- Modify `client/tailwind.config.js` to customize the design system
- Update `server/index.js` to add new question types or features
- Customize chart colors in the chart components

## 🚀 Deployment

### Production Build
```bash
# Build the React app
npm run build

# Start production server
npm start
```

### Deployment Options
- **Heroku**: Deploy with the included `Procfile`
- **Vercel**: Deploy the client separately
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Recharts](https://recharts.org/) for beautiful data visualizations
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Socket.IO](https://socket.io/) for real-time functionality
- [Lucide](https://lucide.dev/) for the icon set

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Happy Polling! 🎉** 