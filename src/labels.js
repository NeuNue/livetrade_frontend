// 错误码 → 友好中文（与 app/engine/events.py 对应）
export const ERROR_LABELS = {
  E_MISSING_TICKER: '缺少 $代码',
  E_BAD_TICKER: '代码格式错误',
  E_UNKNOWN_TICKER: '标的不存在',
  E_BAD_AMOUNT: '金额格式错误',
  E_AMOUNT_OVER_LIMIT: '单笔金额超限',
  E_NO_CASH: '余额不足',
  E_NO_POSITION: '无持仓',
  E_INSUFFICIENT_QTY: '持仓不足',
  E_COOLDOWN: '指令冷却中',
  E_DAILY_LIMIT: '今日次数已用完',
  E_QUOTE_UNAVAILABLE: '行情不可用',
  E_SYSTEM: '系统错误',
  E_INVALID_CMD: '指令无法识别',
}

export function explainReason(code = '') {
  return ERROR_LABELS[code] || code || '—'
}
