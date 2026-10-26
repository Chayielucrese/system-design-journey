import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "System Design Journey",
  description: "My 12-week system design journey, learning in public.",
  base: '/system-design-journey/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Framework', link: '/framework' }
    ],

    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'The answer framework', link: '/framework' }
        ]
      },
      {
        text: 'Weeks',
        items: [
          { text: 'Week 1: Setup', link: '/week-01-setup' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Chayielucrese/system-design-journey' }
    ]
  }
})