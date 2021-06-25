import ConditionalTokensAbi from './abis/ConditionalTokens.json';
import erc20Abi from './abis/erc20.json';
import FixedProductMarketMakerAbi from './abis/FixedProductMarketMaker.json';
import ownableAbi from './abis/ownable.json';

const abis = {
  erc20: erc20Abi,
  ownable: ownableAbi,
  conditionalTokens: ConditionalTokensAbi,
  fixedProductMarketMaker: FixedProductMarketMakerAbi,
};

export default abis;
