# AI-Powered Pitch Deck Generator

A modern web application that leverages AI to create and customize professional pitch decks based on user input and design preferences.

![Pitch Deck Generator](https://picsum.photos/800/400)

## 📋 Features

- **AI-Generated Content**: Create complete pitch decks with tailored content based on questionnaire responses
- **Design Customization**: Personalize your deck with various design styles, color themes, and font choices
- **Slide Management**: Edit, rearrange, and customize individual slides
- **Export Options**: Download your pitch deck as PDF or PowerPoint
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: TailwindCSS for responsive design
- **State Management**: Custom store pattern
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API with structured prompts

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account (for database)
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
project/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── deck/        # Pitch deck related components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Basic UI elements
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env                 # Environment variables
└── README.md            # Project documentation
```

## 🔧 Recent Improvements & Fixes

### UI/UX Enhancements

1. **Slide Viewer Improvements**
   - Added multiple design templates (modern, classic, minimal, bold, creative)
   - Implemented dynamic styling based on user preferences
   - Fixed slide layout and content positioning
   - Added support for custom background images and accent colors

2. **Navigation Controls**
   - Fixed transparent navigation buttons in slide presentation mode
   - Added solid backgrounds to ensure visibility against all slide backgrounds
   - Improved button contrast and visibility with shadow effects

3. **DeckCard Component Refinements**
   - Adjusted action button sizing for better visual balance
   - Fixed button icon visibility issues
   - Implemented explicit background colors to ensure consistent appearance
   - Improved overall visual consistency in the dashboard

4. **Questionnaire Interface**
   - Added design preference collection step
   - Enhanced form controls and validation
   - Improved navigation between questionnaire steps

### Technical Improvements

1. **AI Service Enhancements**
   - Structured AI prompts for consistent and high-quality output
   - Added error handling and fallback content generation
   - Optimized API calls to minimize token usage

2. **Type Definitions**
   - Updated interfaces to include design-related attributes
   - Fixed type errors in component props
   - Ensured type safety throughout the application

3. **Performance Optimizations**
   - Reduced unnecessary re-renders
   - Improved slide rendering performance
   - Enhanced loading states for better user experience

## 📊 Usage Examples

### Creating a New Pitch Deck

1. Click "Create New Deck" from the dashboard
2. Fill out the questionnaire with your business details
3. Select your preferred design style, color theme, and font
4. Review and edit the AI-generated content
5. Export your finished deck as PDF or PowerPoint

### Customizing Slide Design

The application offers five distinct design styles:

- **Modern**: Clean, minimalist with a focus on content
- **Classic**: Traditional, formal presentation style
- **Minimal**: Extremely simple and clean
- **Bold**: High contrast, impactful design
- **Creative**: Unique and visually interesting

## 🔒 Security

- Row Level Security (RLS) policies ensure users can only access their own data
- Authentication tokens are securely stored
- API keys are never exposed to the client

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♀️ Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or feedback, please reach out to [email@example.com](mailto:email@example.com).
