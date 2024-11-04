import algosdk from 'algosdk';

interface AppInfo {
  appId: number;
  name: string;
  transactionVolume: Array<{ name: string; value: number }>;
  userInteractions: Array<{ name: string; value: number }>;
  revenue: Array<{ name: string; value: number }>;
  assets: Array<{ id: number; name: string; unitName: string; total: number }>;
  recentTransactions: Array<{
    hash: string;
    timestamp: string;
    amount: number;
    sender: string;
    receiver: string;
  }>;
}

export async function getApplicationInfo(appId: number): Promise<AppInfo> {
  const algodClient = new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', '');
  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', '');

  try {
    // Fetch application info
    const appInfo = await algodClient.getApplicationByID(appId).do();
    
    // Fetch recent transactions
    const txnResponse = await indexerClient.searchForTransactions()
      .applicationID(appId)
      .limit(10)
      .do();

    // Process transactions
    const recentTransactions = txnResponse.transactions.map((tx: any) => ({
      hash: tx.id,
      timestamp: new Date(tx['round-time'] * 1000).toISOString(),
      amount: tx['payment-transaction'] ? tx['payment-transaction'].amount / 1e6 : 0,
      sender: tx.sender,
      receiver: tx['payment-transaction'] ? tx['payment-transaction'].receiver : '',
    }));

    // Fetch associated assets (this is a simplified version, you may need to adjust based on your specific needs)
    const assetResponse = await indexerClient.searchForAssets().creator(appInfo.params.creator).limit(10).do();
    const assets = assetResponse.assets.map((asset: any) => ({
      id: asset.index,
      name: asset.params.name,
      unitName: asset['unit-name'],
      total: asset.params.total,
    }));

    // Note: For transaction volume, user interactions, and revenue, you would need to implement
    // more complex logic to aggregate this data over time. This is a placeholder implementation.
    const placeholderData = Array.from({length: 30}, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    }));

    return {
      appId,
      name: appInfo.params.name || `App ${appId}`,
      transactionVolume: placeholderData,
      userInteractions: placeholderData,
      revenue: placeholderData.map(item => ({ ...item, value: item.value / 1e6 })),
      assets,
      recentTransactions,
    };
  } catch (error) {
    console.error('Error fetching application info:', error);
    throw new Error('Failed to fetch application info');
  }
}