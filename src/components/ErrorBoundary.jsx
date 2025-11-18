import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20,background:'#071026',color:'#fff',minHeight:'100vh'}}>
          <h2>Algo deu errado</h2>
          <pre style={{whiteSpace:'pre-wrap',color:'#ffdede'}}>{String(this.state.error)}</pre>
          {this.state.info && <details style={{color:'#fff'}}>{String(this.state.info.componentStack)}</details>}
          <button onClick={() => window.location.reload()} style={{marginTop:12,padding:'8px 12px',borderRadius:6}}>Recarregar</button>
        </div>
      )
    }
    return this.props.children
  }
}
