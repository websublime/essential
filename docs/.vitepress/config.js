import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/forms/',
  title: 'WebSublime Forms',
  description: 'Form model validation',
  themeConfig: {
    nav: [
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Github', link: 'https://github.com/websublime/forms' }
    ],
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/api/': getApiSidebar()
    }
  }
});

function getApiSidebar() {
  return [
    {
      text: 'Home',
      children: [{ text: 'Forms', link: '/api/forms' }]
    }
  ];
}

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is Forms?', link: '/guide/' },
        { text: 'Getting started', link: '/guide/getting-started' },
        { text: 'Form Control', link: '/guide/form-control' },
        { text: 'Form Group', link: '/guide/form-group' },
        { text: 'Form Array', link: '/guide/form-array' }
      ]
    }
  ];
}
