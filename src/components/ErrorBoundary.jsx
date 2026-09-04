import { Component } from 'react'
import { Link } from 'react-router-dom'

/**
 * 路由级错误边界：页面渲染抛错时展示可恢复的降级界面，
 * 避免单个组件异常导致整站白屏（如某玩家数据异常）。
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p className="error-boundary-emoji">😵</p>
          <h2 className="error-boundary-title">页面出了一点问题</h2>
          <p className="error-boundary-desc">可能是这位玩家的数据异常，稍后再试试</p>
          <Link to="/" className="btn-primary" onClick={() => this.setState({ hasError: false })}>
            返回首页
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
