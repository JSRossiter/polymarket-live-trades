import React from 'react';
import { formatDateTime } from '../../utilities/formatDateTime';

export default function TradeRow({ trade, markets }) {
  const market = markets[trade.market];
  return (
    <tr>
      <td>{formatDateTime(trade.timestamp)}</td>
      <td>{market.question}</td>
      <td>{trade.account}</td>
      <td>{trade.type}</td>
      <td>{market.outcomes[trade.outcomeIndex]}</td>
      <td className="align-right">
        ${(trade.tradeAmountNum / 1e6).toFixed(2)}
      </td>
      <td className="align-right">
        {(trade.outcomeTokensNum / 1e6).toFixed(2)}
      </td>
      <td className="align-right">
        {(trade.tradeAmountNum / trade.outcomeTokensNum).toFixed(4)}
      </td>
    </tr>
  );
}
