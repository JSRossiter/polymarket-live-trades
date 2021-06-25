import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { abis } from '@project/contracts';
import axios from 'axios';
import React, { Component } from 'react';
import TradeRow from './TradeRow';

export default class Trades extends Component {
  state = {
    markets: {},
    trades: [],
  };

  async componentDidMount() {
    await this.subscribe();
  }

  handleEvent = async (event) => {
    console.log('event:', event);

    const trade = await this.parseTradeEvent(event);
    let newTrades = [trade, ...this.state.trades];
    if (newTrades.length > 500) {
      newTrades = newTrades.slice(-500);
    }
    this.setState({ trades: newTrades });
  };

  parseTradeEvent = async (event) => {
    const provider = new Web3Provider(this.props.provider);
    const block = await provider.getBlock(event.blockHash);
    console.log('block:', block);

    if (event.event === 'FPMMBuy') {
      return {
        account: event.args.buyer,
        timestamp: new Date(block.timestamp * 1000),
        outcomeIndex: Number(event.args.outcomeIndex),
        outcomeTokensNum: Number(event.args.outcomeTokensBought),
        tradeAmountNum: Number(event.args.investmentAmount),
        type: 'Buy',
        market: event.address.toLowerCase(),
        key: event.transactionHash,
      };
    } else {
      return {
        account: event.args.seller,
        timestamp: new Date(block.timestamp * 1000),
        outcomeIndex: Number(event.args.outcomeIndex),
        outcomeTokensNum: Number(event.args.outcomeTokensSold),
        tradeAmountNum: Number(event.args.returnAmount),
        type: 'Sell',
        market: event.address.toLowerCase(),
        key: event.transactionHash,
      };
    }
  };

  async subscribe() {
    const provider = new Web3Provider(this.props.provider);
    const blockNumber = await provider.getBlockNumber();
    console.log('blockNumber:', blockNumber);

    const response = await this.getMarkets();
    const marketsObj = {};
    response.data.forEach((market) => {
      const marketMaker = new Contract(
        market.marketMakerAddress,
        abis.fixedProductMarketMaker,
        provider
      );
      marketMaker.on('FPMMBuy', (...args) => this.handleEvent(args[5]));
      marketMaker.on('FPMMSell', (...args) => this.handleEvent(args[5]));
      marketsObj[market.marketMakerAddress.toLowerCase()] = market;
      console.log('subscribed:', market.question);
    });

    this.setState({ markets: marketsObj });
  }

  getMarkets() {
    return axios.get(
      'https://strapi-matic.poly.market/markets?_limit=-1&active=true&closed=false'
    );
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
