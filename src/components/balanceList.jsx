import React from 'react';
import { Flex, Text, Box } from '@chakra-ui/react';

import TextBox from './TextBox';
import ContentBox from './ContentBox';
import BalanceCard from './balanceCard';
import MinionVaultRefreshButton from './minionVaultRefreshButton';

const BalanceList = ({
  balances,
  profile,
  hasBalance,
  needsSync,
  vaultConfig,
  isNativeToken,
}) => {
  return (
    <ContentBox mt={6}>
      <Flex justify='space-between'>
        <TextBox size='xs' mb={6}>
          {isNativeToken
            ? `Network Token Balance`
            : `${vaultConfig.balanceListTitle}`}
        </TextBox>
        <MinionVaultRefreshButton />
      </Flex>
      <Flex w='100%'>
        <Box w='25%' d={['none', null, null, 'inline-block']}>
          <TextBox size='xs'>Asset</TextBox>
        </Box>
        <Box w={['40%', null, null, '40%']}>
          <TextBox size='xs'>{profile ? 'Internal Bal.' : 'Balance'}</TextBox>
        </Box>

        {!isNativeToken && (
          <>
            <Box w='20%' d={['none', null, null, 'inline-block']}>
              <TextBox size='xs'>Price</TextBox>
            </Box>
            <Box w={['20%', null, null, '30%']}>
              <TextBox size='xs'>Value</TextBox>
            </Box>
          </>
        )}
        <Box w={[null, null, null, '30%']} />
      </Flex>
      {balances ? (
        balances
          .sort((a, b) => b.totalUSD - a.totalUSD)
          .map(token => {
            return (
              <BalanceCard
                key={token?.id}
                token={token}
                hasBalance={hasBalance}
                hasSync={needsSync}
                isNativeToken={isNativeToken}
              />
            );
          })
      ) : (
        <Text fontFamily='mono' mt='5'>
          No unclaimed balances
        </Text>
      )}
    </ContentBox>
  );
};

export default BalanceList;
