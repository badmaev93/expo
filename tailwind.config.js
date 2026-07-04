export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        body:    'var(--bg-body)',
        panel:   'var(--bg-panel)',
        surface: 'var(--bg-container)',
        'surface-container':         'var(--bg-container)',
        'surface-container-low':     'var(--bg-panel)',
        'surface-container-high':    'var(--bg-container-high)',
        'surface-container-highest': 'var(--bg-container-high)',
        primary:          'var(--accent)',
        'primary-text':   'var(--accent-text)',
        'primary-dim':    'var(--accent-dim)',
        'primary-subtle': 'color-mix(in srgb, var(--accent) 10%, transparent)',
        'on-surface':         'var(--text-primary)',
        'on-surface-variant': 'var(--text-secondary)',
        'outline-variant':    'var(--border-subtle)',
        outline:              'var(--text-muted)',
        success:              'var(--success)',
        error:                'var(--error-text)',
      },
      spacing: {
        'panel-left':  '280px',
        'panel-right': '320px',
      },
      boxShadow: {
        'card':          'var(--shadow-card)',
        'card-hover':    'var(--shadow-card-hover)',
        'card-selected': 'var(--shadow-selected)',
        'dropdown':      '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--border-subtle)',
        'glass':         'inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.3)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    }
  },
  plugins: []
}
