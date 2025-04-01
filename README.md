# Local Media

A SvelteKit-based application for managing your local media library, with support for TV series and movies.

## Features

-   TV Series management and organization with season/episode tracking
-   Local file system integration for media files
-   Media format conversion capabilities
-   Firebase/Firestore integration for metadata storage
-   Movie poster lightbox viewing
-   Responsive web interface built with Svelte 5

## Prerequisites

-   Node.js v18 or higher
-   Local media directory (Z:\ drive)
-   Firebase account for metadata storage
-   FFProbe for media analysis
-   Modern web browser

## Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure Firebase credentials
4. Set up local media directories in `src/lib/server/config/local-directories.ts`

## Configuration

### Firebase Setup

1. Create a Firebase project in the Firebase Console
2. Set up Firestore database with appropriate security rules
3. Configure authentication as needed
4. Download your Firebase Admin SDK service account key (JSON file)
5. Create a `src/lib/private` directory and place your service account key JSON file there
6. Update the import path in `src/lib/server/config/firebase.ts` to match your service account key filename. For example:
    ```typescript
    import ServiceAccountKey from '../../private/your-project-firebase-adminsdk.json' with { type: "json" };
    ```

### Local Media Setup

Configure your media directories in `src/lib/server/config/local-directories.ts`. By default, these are empty strings that need to be set to your local media paths:

```typescript
export const LOCAL_DIRECTORIES = {
    BASE_DIR: "",
    SERIES_DIR: "",
    MOVIES_DIR: "",
} as const;
```

Note: You must configure these paths according to your local media directory structure before using the application.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run check

# Run linting
npm run lint
```

## Project Structure

```
src/
├── lib/
│   ├── actions/      # Custom Svelte actions
│   ├── components/   # Reusable UI components
│   │   ├── headings/
│   │   ├── icons/
│   │   ├── media/   # Media-specific components
│   │   └── ui/      # Common UI components
│   ├── server/      # Server-side logic
│   │   ├── config/  # Application configuration
│   │   ├── db/      # Database services
│   │   └── utils/   # Utility functions
│   └── styles/      # Global styles
└── routes/          # SvelteKit routes
    ├── api/         # API endpoints
    └── series/      # Series management pages
```

## API Endpoints

### Series Management

-   `POST /api/series/convert`

    -   Convert media files to different formats
    -   Supports batch conversion operations
    -   Not implemented!

-   `POST /api/series/refresh`
    -   Refresh series metadata
    -   Update local file system changes

## Models

### Series

```typescript
type Series = {
    id?: string;
    name: string;
    seasons: {
        [key: number]: {
            name: string;
            episodes: {
                [key: number]: {
                    name: string;
                };
            };
        };
    };
};
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

MIT License

## Acknowledgments

-   Built with [SvelteKit](https://kit.svelte.dev/)
-   Firebase for database functionality
-   FFProbe for media analysis
