import { Contract } from '@ethersproject/contracts';
import { abis } from '@project/contracts';
import axios from 'axios';
import React, { Component } from 'react';
import TradeRow from './TradeRow';

export default class Trades extends Component {
  state = {
    markets: {},
    trades: [],
  };
  tradesSet = new Set();

  async componentDidMount() {
    await this.loadMarkets();
    await this.subscribe();
    await this.loadRecentTrades();
  }

  handleEvent = async (event) => {
    console.log('event:', event);
    const hash = event.transactionHash;
    if (this.tradesSet.has(hash)) {
      return;
    }
    this.tradesSet.add(hash);
    const trade = await this.parseTradeEvent(event);
    let newTrades = [trade, ...this.state.trades];
    if (newTrades.length > 500) {
      newTrades = newTrades.slice(-500);
    }
    newTrades = newTrades.sort((a, b) => b.timestamp - a.timestamp);
    this.setState({ trades: newTrades });
  };

  parseTradeEvent = async (event) => {
    const block = await this.props.provider.getBlock(event.blockHash);
    console.log('block:', block);
    const trade = {
      timestamp: new Date(block.timestamp * 1000),
      outcomeIndex: Number(event.args.outcomeIndex),
      market: event.address.toLowerCase(),
      key: event.transactionHash,
    };
    if (event.event === 'FPMMBuy') {
      return Object.assign(trade, {
        account: event.args.buyer,
        outcomeTokensNum: Number(event.args.outcomeTokensBought),
        tradeAmountNum: Number(event.args.investmentAmount),
        type: 'Buy',
      });
    } else {
      return Object.assign(trade, {
        account: event.args.seller,
        outcomeTokensNum: Number(event.args.outcomeTokensSold),
        tradeAmountNum: Number(event.args.returnAmount),
        type: 'Sell',
      });
    }
  };

  async subscribe() {
    Object.values(this.state.markets).forEach((market) => {
      const marketMaker = new Contract(
        market.marketMakerAddress,
        abis.fixedProductMarketMaker,
        this.props.provider
      );
      marketMaker.on('FPMMBuy', (...args) => this.handleEvent(args[5]));
      marketMaker.on('FPMMSell', (...args) => this.handleEvent(args[5]));
      console.log('subscribed:', market.question);
    });
  }

  async loadMarkets() {
    const response = await this.getMarkets();
    const marketsObj = {};
    response.data.forEach((market) => {
      marketsObj[market.marketMakerAddress.toLowerCase()] = market;
    });

    this.setState({ markets: marketsObj });
  }

  async loadRecentTrades() {
    const blockNumber = await this.props.provider.getBlockNumber();
    console.log('blockNumber:', blockNumber);
    const fromBlock = blockNumber - 450; // 15 minutes
    Object.values(this.state.markets).forEach(async (market) => {
      const marketMaker = new Contract(
        market.marketMakerAddress,
        abis.fixedProductMarketMaker,
        this.props.provider
      );
      const buys = await marketMaker.queryFilter('FPMMBuy', fromBlock);
      const sells = await marketMaker.queryFilter('FPMMSell', fromBlock);
      buys.forEach(this.handleEvent);
      sells.forEach(this.handleEvent);
    });
  }

  getMarkets() {
    return axios.get('https://strapi-matic.poly.market/markets', {
      params: { _limit: -1, active: true, closed: false },
    });
  }

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Market</th>
              <th>Account</th>
              <th>Type</th>
              <th>Outcome</th>
              <th className="align-right">Amount</th>
              <th className="align-right">Shares</th>
              <th className="align-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {this.state.trades.map((trade) => {
              return (
                <TradeRow
                  markets={this.state.markets}
                  trade={trade}
                  key={trade.key}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
