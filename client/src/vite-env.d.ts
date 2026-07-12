/// <reference types="vite/client" />

// Allow importing image files with spaces in filenames
declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

// Specific declarations for files with spaces (if needed)
declare module '@/assets/*' {
  const value: string;
  export default value;
}
