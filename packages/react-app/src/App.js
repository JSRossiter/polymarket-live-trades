import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import { Body, Button, Header } from './components';
import Trades from './components/Trades';
import GET_TRANSFERS from './graphql/subgraph';
import useWeb3Modal from './hooks/useWeb3Modal';

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? 'Connect Wallet' : 'Disconnect Wallet'}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton
          provider={provider}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
      </Header>
      <Body>{provider && <Trades provider={provider} />}</Body>
    </div>
  );
}

export default App;
