import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Flex, Stack, Button, Spinner, Box, Icon } from '@chakra-ui/react';
import { GiPartyPopper } from 'react-icons/gi';

import { useTX } from '../contexts/TXContext';
import MainViewLayout from '../components/mainViewLayout';
import { TX } from '../data/contractTX';
import { useDaoMember } from '../contexts/DaoMemberContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { createContract } from '../utils/contract';
import { LOCAL_ABI } from '../utils/abi';
import { useDao } from '../contexts/DaoContext';

const PartyFavor = ({ isMember }) => {
  const { daoid, daochain } = useParams();
  const { submitTransaction } = useTX();
  const { daoMember } = useDaoMember();
  const { daoProposals } = useDao();
  const { address, injectedProvider } = useInjectedProvider();
  const [loading, setLoading] = useState(false);
  const [canRageQuit, setCanRageQuit] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);

  const canClaim = daoMember?.shares > 1;

  useEffect(() => {
    if (daoMember?.tokenBalances) {
      setHasBalance(
        daoMember.tokenBalances.some(bal => Number(bal.tokenBalance) > 0),
      );
    }
  }, [daoMember]);

  useEffect(() => {
    const getCanRageQuit = async () => {
      if (daoProposals) {
        if (daoMember?.highestIndexYesVote?.proposalIndex) {
          const molochContract = createContract({
            address: daoid,
            abi: LOCAL_ABI.MOLOCH_V2,
            chainID: daochain,
            web3: injectedProvider,
          });

          const localCanRage = await molochContract.methods
            .canRagequit(daoMember?.highestIndexYesVote?.proposalIndex)
            .call();

          setCanRageQuit(localCanRage);
        } else {
          const hasProposal = daoProposals.some(p => p.processed);
          setCanRageQuit(hasProposal);
        }
      }
    };
    getCanRageQuit();
  }, [daoMember, daoProposals]);

  const handleClaim = async () => {
    setLoading(true);
    await submitTransaction({
      tx: TX.RAGE_QUIT_CLAIM,
      args: ['1', '0'],
    });
    setLoading(false);
  };

  console.log(
    'isMember && canClaim && canRageQuit',
    isMember,
    canClaim,
    canRageQuit,
  );

  const claimButton =
    isMember && canClaim && canRageQuit ? (
      <Button onClick={handleClaim} size='lg'>
        Claim
      </Button>
    ) : (
      <Button disabled size='lg'>
        {!canRageQuit ? `Proposal pending` : `Not Eligible`}
      </Button>
    );

  return (
    <MainViewLayout header='Party Favor' isDao>
      <Flex direction='column' align='center'>
        <Icon as={GiPartyPopper} w={100} h={100} mb={10} />
        <Box fontSize='5xl' fontFamily='heading' mb={10}>
          GET YOUR FAVORS!
        </Box>
        <Flex as={Stack} direction='column' spacing={4} w='20%' mb={10}>
          {!loading ? claimButton : <Spinner size='xl' />}
        </Flex>
        {hasBalance && (
          <Link to={`/dao/${daochain}/${daoid}/${address}`}>
            Withdraw your tokens your DAO profile.
          </Link>
        )}
        {isMember && (
          <Box fontSize='xl'>
            And guess what? You&apos;re in a DAO now.{' '}
            <Link to={`/dao/${daochain}/${daoid}`}>Check it out.</Link>
          </Box>
        )}
      </Flex>
    </MainViewLayout>
  );
};

export default PartyFavor;