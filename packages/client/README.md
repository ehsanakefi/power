# Power CRM Client Application

Frontend application for the Power Distribution Company CRM system, built with Next.js, TypeScript, and Material-UI.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **Material-UI (MUI)** for consistent UI components
- **RTL Support** for Persian/Arabic text
- **Zustand** for state management
- **React Query** for data fetching and caching
- **Axios** for API communication
- **Styled Components** for additional styling
- **Atomic Design** component architecture

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- Running backend server (packages/server)

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable UI components (Atomic Design)
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Component combinations
│   ├── organisms/         # Complex UI sections
│   └── templates/         # Page layouts
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication hook
├── lib/                   # Utilities and configurations
│   ├── api.ts             # Axios API client
│   └── queryClient.tsx    # React Query configuration
├── store/                 # Zustand state management
│   └── authStore.ts       # Authentication store
├── theme/                 # MUI theme configuration
│   ├── theme.ts           # Theme definition
│   └── ThemeRegistry.tsx  # Theme provider component
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🎨 Design System

### Theme Configuration

The application uses a custom MUI theme with:
- **RTL Support** for Persian text
- **Custom color palette** for Power CRM branding
- **Consistent spacing** and typography
- **Persian font** (Vazirmatn) integration

### Component Architecture

Following **Atomic Design** principles:

- **Atoms**: Basic UI elements (Button, Input, Typography)
- **Molecules**: Component combinations (SearchBar, FormField)
- **Organisms**: Complex sections (Header, TicketList, UserTable)
- **Templates**: Page layouts
- **Pages**: Complete pages with data fetching

## 🔐 Authentication

The app uses JWT-based authentication with:

- **Phone number login** (SMS verification)
- **Automatic token refresh**
- **Protected routes**
- **Role-based access control**

### User Roles

- **CLIENT**: Regular customers
- **EMPLOYEE**: Staff members
- **MANAGER**: Department managers
- **ADMIN**: System administrators

## 📊 State Management

### Zustand Stores

- **AuthStore**: User authentication and profile
- **TicketStore**: Ticket management (future)
- **UIStore**: UI state and preferences (future)

### React Query

Used for:
- **Server state management**
- **Caching and synchronization**
- **Background updates**
- **Error handling**

## 🌐 API Integration

### API Client

Configured Axios instance with:
- **Base URL** configuration
- **Request/response interceptors**
- **Automatic token attachment**
- **Error handling**

### Available Endpoints

- `POST /auth/login` - Phone-based login
- `POST /auth/verify` - SMS verification
- `GET /auth/profile` - User profile
- `GET /tickets` - Tickets list
- `POST /tickets` - Create ticket
- `PUT /tickets/:id/status` - Update status

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoint system**: xs, sm, md, lg, xl
- **Flexible grid** layout
- **Touch-friendly** interface

## 🌍 Internationalization

- **RTL Support** for Persian/Arabic
- **Persian font** integration
- **Number localization**
- **Date formatting**

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - TypeScript type checking

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_ENABLE_DEVTOOLS` - Enable React Query devtools

## 🔧 Configuration

### TypeScript

- **Strict mode** enabled
- **Path mapping** configured
- **Import aliases** for clean imports

### ESLint

- **Next.js recommended** rules
- **TypeScript support**
- **Custom rules** for code quality

## 🎭 Styling

### CSS-in-JS

Using **Emotion** with MUI:
- **Theme provider** integration
- **Styled components** support
- **Dynamic styling** based on props

### Global Styles

- **CSS custom properties** for theming
- **Utility classes** for common patterns
- **RTL-aware** styles

## 📈 Performance

- **Code splitting** with Next.js
- **Image optimization**
- **Bundle analysis**
- **Lazy loading** for components

## 🛡️ Security

- **XSS protection** with proper sanitization
- **CSRF protection** with tokens
- **Secure storage** for sensitive data
- **Environment variable** validation

## 🧪 Testing (Future)

Plans for testing implementation:
- **Unit tests** with Jest
- **Component tests** with React Testing Library
- **E2E tests** with Playwright
- **Visual regression** testing

## 📦 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

1. Configure production API URL
2. Set up proper CORS settings
3. Configure CDN for static assets
4. Set up monitoring and analytics

## 🔄 Integration with Backend

The client communicates with the Express.js backend:

- **Authentication** flow
- **Real-time updates** (future WebSocket integration)
- **File uploads** (future implementation)
- **Error handling** and user feedback

## 📚 Documentation

- **Component Storybook** (future)
- **API documentation** integration
- **User guides** and tutorials
- **Developer documentation**

## 🤝 Contributing

1. Follow **Atomic Design** principles
2. Use **TypeScript** for all components
3. Follow **ESLint** rules
4. Write **meaningful commit** messages
5. Test components thoroughly

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Power Distribution Company**