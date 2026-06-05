
export type AuthorsConfig = {
  name: string
  url: string
}
export type ThemeColor = {
  media: string
  color: string
}
export type SiteConfig = {
  name: string
  tagLine?: string
  description?: string
  url: string
  authors: AuthorsConfig[]
  socialLinks?: {
    [key: string]: string | undefined
  }
  creator: string
  themeColors?: string | ThemeColor[]
  defaultNextTheme?: string
  icons: {
    icon: string
    shortcut?: string
    apple?: string
  }
}
