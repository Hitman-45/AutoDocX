import { themes as prismThemes } from 'prism-react-renderer';
import dotenv from 'dotenv';

dotenv.config();


const siteTitle = process.env.SITE_TITLE || 'My Docs';
const siteTagline = process.env.SITE_TAGLINE || 'Documentation made easy';
const formattedSiteTitle = siteTitle.toLowerCase().replace(/\s+/g, '-');
const siteUrl = process.env.SITE_URL || `https://VenkatKaushal.github.io`;
const baseUrl = process.env.BASE_URL || '/';
const organizationName = process.env.ORG_NAME || 'your-org';
const projectName = process.env.PROJECT_NAME || 'my-docs';
const githubUrl = process.env.GITHUB_URL || `https://github.com/${organizationName}/${projectName}`;
const stackOverflowUrl = process.env.STACK_OVERFLOW_URL || 'https://stackoverflow.com/questions/tagged/docusaurus';
const discordUrl = process.env.DISCORD_URL || 'https://discordapp.com/invite/docusaurus';
const xUrl = process.env.X_URL || 'https://x.com/docusaurus';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: siteTitle,
  tagline: siteTagline,
  favicon: 'img/favicon.ico',


  url: siteUrl,
  baseUrl: baseUrl,

  organizationName: organizationName,
  projectName: projectName,

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',




  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: githubUrl,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },


          editUrl: githubUrl,

          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      require.resolve("docusaurus-plugin-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        // language: ["en"], // Add other languages like "fr", "de" if needed
        highlightSearchTermsOnTargetPage: true,
        // explicitSearchResultPath: true,
      },
    ],
  ],


  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({

      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: siteTitle,
        logo: {
          alt: siteTitle,
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Tutorial',
          },
          {
            label: 'Visualization',
            to: '/visualization',
            position: 'left',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: githubUrl,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: stackOverflowUrl,
              },
              {
                label: 'Discord',
                href: discordUrl,
              },
              {
                label: 'X',
                href: xUrl,
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: githubUrl,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'python', 'cpp'],
      },
    }),
};

export default config;