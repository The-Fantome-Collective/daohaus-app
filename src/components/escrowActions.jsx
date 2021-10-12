import React, { useEffect, useState } from 'react';
import { Button, Flex, Spinner, Text } from '@chakra-ui/react';

import { useUser } from '../contexts/UserContext';
import { useTX } from '../contexts/TXContext';
import { useOverlay } from '../contexts/OverlayContext';
import { MinionService } from '../services/minionService';
import { createPoll } from '../services/pollService';

const EscrowActions = ({ proposal, address, injectedProvider, daochain }) => {
  const { errorToast, successToast, setTxInfoModal } = useOverlay();
  const { molochAddress, minionAddress, proposalId } = proposal;
  const { cachePoll, resolvePoll } = useUser();
  const [loading, setLoading] = useState();
  const [tokensAvailable, setTokensAvailable] = useState(false);
  const { refreshDao } = useTX();

  useEffect(() => {
    if (
      !loading &&
      injectedProvider &&
      minionAddress &&
      daochain &&
      molochAddress &&
      proposalId
    ) {
      setLoading(true);
      MinionService({
        web3: injectedProvider,
        minion: minionAddress,
        chainID: daochain,
        minionType: 'escrowMinion',
      })('escrowBalances')({
        args: [molochAddress, proposalId, 0],
      })
        .then(({ executed }) => {
          setTokensAvailable(!executed);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [injectedProvider, minionAddress, daochain, molochAddress, proposalId]);

  const withdrawEscrowTokens = async () => {
    const args = [proposalId, molochAddress, [0]];

    try {
      setLoading(true);
      const poll = createPoll({ action: 'withdrawEscrowTokens', cachePoll })({
        daoID: molochAddress,
        chainID: daochain,
        proposalId,
        actions: {
          onError: (error, txHash) => {
            errorToast({
              title: 'There was an error.',
            });
            resolvePoll(txHash);
            console.error(`Could not find a matching proposal: ${error}`);
            setLoading(false);
          },
          onSuccess: txHash => {
            successToast({
              title: 'Tokens Withdrawn to vault!',
            });
            setTokensAvailable(false);
            refreshDao();
            resolvePoll(txHash);
            setLoading(false);
          },
        },
      });

      const onTxHash = () => {
        setTxInfoModal(true);
      };

      await MinionService({
        web3: injectedProvider,
        minion: minionAddress,
        chainID: daochain,
        minionType: 'escrowMinion',
      })('withdrawToDestination')({
        args,
        address,
        poll,
        onTxHash,
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Flex alignItems='center' flexDir='row'>
      {tokensAvailable && !proposal.executed ? (
        <Button onClick={withdrawEscrowTokens}>Withdraw from Escrow</Button>
      ) : (
        <Text>Tokens Withdrawn</Text>
      )}
    </Flex>
  );
};

export default EscrowActions;
