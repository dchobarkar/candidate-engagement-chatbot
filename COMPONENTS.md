# Component Documentation

This document provides detailed documentation for all React components in the Candidate Engagement Chatbot.

## Component Overview

The application uses a component-based architecture with the following main components:

- **ChatInterface**: Main chat interface for conversations
- **CandidateProfile**: Profile display and editing
- **JobInfo**: Job information display
- **MessageBubble**: Individual message display
- **ErrorDisplay**: Error message display
- **LoadingSpinner**: Loading indicator
- **StoreProvider**: Zustand store provider

## ChatInterface

**Location**: `app/components/ChatInterface.tsx`

**Purpose**: Main chat interface component that handles user interactions and displays conversation messages.

### Props

```typescript
interface ChatInterfaceProps {
  className?: string;
  onProfileUpdate?: (profile: any) => void;
  onConversationComplete?: (summary: any) => void;
}
```

### Features

- Message input and sending
- Message display with auto-scroll
- Typing indicators
- Loading states
- Error handling with retry
- Session management
- Real-time profile updates

### Usage

```tsx
<ChatInterface
  className="h-full"
  onProfileUpdate={(profile) => {
    console.log('Profile updated:', profile);
  }}
  onConversationComplete={(summary) => {
    console.log('Conversation completed:', summary);
  }}
/>
```

### State Management

- Uses `useChat` hook for messages and loading state
- Uses `useSession` hook for session management
- Uses `useMessageActions` hook for sending messages

### Performance

- Optimized with `useMemo` for expensive calculations
- Lazy loaded for code splitting
- Memoized message rendering

## CandidateProfile

**Location**: `app/components/CandidateProfile.tsx`

**Purpose**: Displays and allows editing of candidate profile information extracted from conversations.

### Props

```typescript
interface CandidateProfileDisplayProps {
  className?: string;
  showEditMode?: boolean;
  onProfileUpdate?: (profile: Partial<CandidateProfile>) => void;
  onExport?: (profile: CandidateProfile) => void;
}
```

### Features

- Profile overview display
- Skills management
- Experience display
- Education display
- Profile completion percentage
- Edit mode with validation
- Export functionality

### Tabs

1. **Overview**: Personal information and summary
2. **Skills**: Technical skills with levels and confidence
3. **Experience**: Work experience history
4. **Education**: Educational background

### Usage

```tsx
<CandidateProfile
  className="w-full"
  showEditMode={false}
  onProfileUpdate={(profile) => {
    // Handle profile update
  }}
  onExport={(profile) => {
    // Handle export
  }}
/>
```

### Performance

- Memoized with `React.memo`
- Optimized completion calculation with `useMemo`
- Lazy loaded for code splitting

## JobInfo

**Location**: `app/components/JobInfo.tsx`

**Purpose**: Displays detailed job information including requirements, responsibilities, and benefits.

### Props

```typescript
interface JobInfoProps {
  className?: string;
  jobId?: string;
  showBenefits?: boolean;
  showRequirements?: boolean;
  showResponsibilities?: boolean;
  onJobSelect?: (job: JobDescription) => void;
  onApply?: (job: JobDescription) => void;
}
```

### Features

- Job overview
- Requirements display
- Responsibilities list
- Benefits display
- Job type and location
- Salary information
- Apply button

### Usage

```tsx
<JobInfo
  className="h-fit"
  showBenefits={true}
  showRequirements={true}
  showResponsibilities={true}
  onApply={(job) => {
    // Handle job application
  }}
/>
```

## MessageBubble

**Location**: `app/components/MessageBubble.tsx`

**Purpose**: Displays individual chat messages with appropriate styling and status indicators.

### Props

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onRetry?: () => void;
  className?: string;
}
```

### Features

- User and assistant message styling
- Timestamp display
- Status indicators (sending, sent, delivered, read, error)
- Retry functionality for failed messages
- Long message truncation with expand/collapse
- Message type badges

### Usage

```tsx
<MessageBubble
  message={message}
  isOwnMessage={message.role === MessageRole.USER}
  onRetry={message.status === "error" ? handleRetry : undefined}
/>
```

### Performance

- Memoized with `React.memo` and custom comparison
- Optimized content truncation with `useMemo`

## ErrorDisplay

**Location**: `app/components/ErrorDisplay.tsx`

**Purpose**: Displays error messages with appropriate styling and recovery options.

### Props

```typescript
interface ErrorDisplayProps {
  error: string | Error;
  title?: string;
  className?: string;
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  severity?: "error" | "warning" | "info";
  showDetails?: boolean;
}
```

### Features

- Error message display
- Retry button
- Dismiss button
- Severity levels
- Detailed error information
- Network error handling
- Validation error display

### Usage

```tsx
<ErrorDisplay
  error={error}
  title="Application Error"
  message="An error occurred"
  showRetry={true}
  onRetry={() => window.location.reload()}
/>
```

## LoadingSpinner

**Location**: `app/components/LoadingSpinner.tsx`

**Purpose**: Displays a loading spinner with different sizes.

### Props

```typescript
interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}
```

### Usage

```tsx
<LoadingSpinner size="md" />
```

## StoreProvider

**Location**: `app/components/StoreProvider.tsx`

**Purpose**: Provides Zustand store context to the application and initializes session on mount.

### Features

- Store initialization
- Session initialization
- Error handling

### Usage

Wrapped in `app/layout.tsx`:

```tsx
<StoreProvider>
  {children}
</StoreProvider>
```

## Component Communication

### Data Flow

1. **User Input** → ChatInterface → API → Store → Components
2. **Profile Updates** → API → Store → CandidateProfile
3. **Job Context** → Store → JobInfo
4. **Messages** → Store → ChatInterface → MessageBubble

### State Management

All components use Zustand store via custom hooks:
- `useChat()` - Chat messages and state
- `useSession()` - Session management
- `useCandidate()` - Candidate profile
- `useJob()` - Job information

## Best Practices

1. **Memoization**: Use `React.memo` for components that receive stable props
2. **Lazy Loading**: Lazy load heavy components
3. **Error Boundaries**: Wrap components in error boundaries
4. **Type Safety**: Use TypeScript for all props
5. **Accessibility**: Include ARIA labels and keyboard navigation

## Performance Considerations

- Components are optimized with memoization
- Heavy components are lazy loaded
- Expensive calculations use `useMemo`
- Message lists are virtualized (can be added)
- Images are optimized (if added)

---

For more details, see the source code in `app/components/`.

