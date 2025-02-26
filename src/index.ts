import { createPublicClient, erc20Abi, http, Log, parseAbiItem, webSocket } from "viem";
import { mainnet } from "viem/chains";
import * as dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

type TransferEventArgs = {
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
};

type TransferLog = Log & {
  args: TransferEventArgs;
};

type EventData = {
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  transactionIndex: number;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
};

const main = async () => {
  logger.info("Starting watcher...");
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(`${process.env.RPC_PROVIDER_1}`),
  });

  let unwatch = publicClient.watchContractEvent({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    eventName: "Transfer",
    pollingInterval: 12 * 1000,
    onLogs: (logs) => {
      handleTransferLog(logs as TransferLog[]);
    },
  });

  logger.info("Watcher started");

  setInterval(async () => {
    unwatch();
    unwatch = publicClient.watchContractEvent({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      eventName: "Transfer",
      onLogs: (logs) => {
        handleTransferLog(logs as TransferLog[]);
      },
    });
  }, 5 * 60 * 1000);
};


const handleTransferLog = (logs: TransferLog[]) => {
  const results: EventData[] = [];
  logs.forEach((log) => {
    const eventData: EventData = {
      blockNumber: log.blockNumber ?? 0n,
      transactionHash: log.transactionHash ?? '0x0000000000000000000000000000000000000000',
      transactionIndex: log.transactionIndex ?? 0,
      from: log.args ? log.args.from : '0x0000000000000000000000000000000000000000',
      to: log.args ? log.args.to : '0x0000000000000000000000000000000000000000',
      value: log.args ? log.args.value : 0n,
    }
    results.push(eventData);
  });
  logger.info(JSON.stringify(results, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));
};

main();
