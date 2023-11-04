import { useUserStore } from "@/lib/store/user-store";
import { ethers } from "ethers";
import Safe, {
  AddOwnerTxParams,
  EthersAdapter,
  SafeFactory,
} from "@safe-global/protocol-kit";
import { toEthersWeb3ProviderWithSigner } from "./providers-wtf";
import { getWalletClient } from "wagmi/actions";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";
import SafeApiKit from "@safe-global/api-kit";

export async function deploySafeAndReturnAddress(): Promise<boolean> {

    try {
      const userAccount = useUserStore.getState();

      const response = await fetch("/api/deploy-safe", {
        method: "POST",
        body: JSON.stringify({
          address: userAccount.address,
          gasLimit: 100000,
        }),
      })
      const { safeAddress } = await response.json()
      userAccount.setSafes([safeAddress])
      return true

    } catch (error) {
        console.error("Error deploying Safe:", error);
        throw error;
    }
}

export async function makeSafeTransferSingleSign(): Promise<boolean> {
  try {
    const amount = ethers.utils.parseUnits("0.001", "ether").toString();
    const chainId = 1442;

    const walletClient = await getWalletClient({ chainId });

    const userAccount = useUserStore.getState();
    const safes = userAccount.safes.toString();
    const safe = safes[0];

    if (safe) {
      if (walletClient !== null) {
        const ethersProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_ZKEVM_RPC_URL as string);

        if (ethersProvider) {
          const newSigner = ethersProvider.getSigner();

          const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: newSigner,
          });

          const safeSdkOwner2 = await Safe.create({
            ethAdapter: ethAdapter,
            safeAddress: safe
          })

          const safeSdk = await safeSdkOwner2.connect({ ethAdapter, safeAddress: safe })

          // for relayer purpose
          const safeTransactionData: MetaTransactionData[] = [];
          safeTransactionData.push({
            to: userAccount.address,
            value: amount,
            data: "0x",
            operation: OperationType.Call,
          });

          // Create a Safe transaction with the provided parameters
          const safeTransaction = await safeSdk.createTransaction({
            safeTransactionData,
          });

          const signedSafeTx = await safeSdk.signTransaction(safeTransaction);

          const txServiceUrl =
            "https://safe-transaction-gnosis-chain.safe.global/";
          const safeService = new SafeApiKit({
            txServiceUrl,
            ethAdapter: ethAdapter,
          });

          const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
          const executeTxResponse = await safeSdk.executeTransaction(
            safeTransaction
          );
          const receipt = await executeTxResponse.transactionResponse?.wait();
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Error deploying Safe:", error);
    throw error;
  }
}
/*
export async function addSignAndChangeThreshold(): Promise<boolean> {
  try {
    const chainId = 1442;

    const walletClient = await getWalletClient({ chainId });

    const userAccount = useUserStore.getState();
    const safes = userAccount.safes.toString();
    const safe = safes[0];

    if (safe) {
      if (walletClient !== null) {
        const ethersProvider = toEthersWeb3ProviderWithSigner(walletClient);

        if (ethersProvider) {
          const newSigner = ethersProvider.getSigner();

          const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: newSigner,
          });

          const safeSDK = await Safe.create({
            ethAdapter,
            safeAddress: safe,
          });

          const params: AddOwnerTxParams = {
            ownerAddress: "0xD5E31DB94a4d638e70c0D2B4f875316712Ae7C06",
            threshold: 2,
          };

          const safeTransaction = await safeSDK.createAddOwnerTx(params);

          // Create a Safe transaction with the provided parameters

          const signedSafeTx = await safeSDK.signTransaction(safeTransaction);

          const txServiceUrl =
            "https://safe-transaction-gnosis-chain.safe.global/";
          const safeService = new SafeApiKit({
            txServiceUrl,
            ethAdapter: ethAdapter,
          });

          const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
          const executeTxResponse = await safeSDK.executeTransaction(
            safeTransaction
          );
          const receipt = await executeTxResponse.transactionResponse?.wait();
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error deploying Safe:", error);
    throw error;
  }
}
*/
/*
if (relayer) {
                        const safeSingletonContract = await getSafeContract({
                            ethAdapter,
                            safeVersion: await safeSDK.getContractVersion(),
                        });

                        const encodedTransaction = safeSingletonContract.encode(
                            "execTransaction",
                            [
                                signedSafeTx.data.to,
                                signedSafeTx.data.value,
                                signedSafeTx.data.data,
                                signedSafeTx.data.operation,
                                signedSafeTx.data.safeTxGas,
                                signedSafeTx.data.baseGas,
                                signedSafeTx.data.gasPrice,
                                signedSafeTx.data.gasToken,
                                signedSafeTx.data.refundReceiver,
                                signedSafeTx.encodedSignatures(),
                            ]
                        );
                        const relayKit = new GelatoRelayPack(
                            process.env.GELATO_RELAY_API_KEY!
                        );

                        const relayTransaction: RelayTransaction = {
                            target: safe.address,
                            encodedTransaction,
                            chainId,
                            options: {
                                gasLimit: "100000",
                                isSponsored: true,
                            },
                        };

                        const response = await relayKit.relayTransaction(relayTransaction);

                        return response.taskId;
                    }
*/
