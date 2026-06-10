import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="font-sans antialiased text-foreground" style={{ padding: 40, maxWidth: 560, margin: '40px auto' }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <p className="t-muted-sm" style={{ marginBottom: 16 }}>{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--blue)',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
